import { BrowserWindow, app, ipcMain } from "electron";

import { exec } from "node:child_process";
import path from "node:path";
import started from "electron-squirrel-startup";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const lcuData = {
  username: "riot",
  password: "",
  port: "",
  success: false,
};

function getLcuData(callback: (data: typeof lcuData) => void) {
  const command = `powershell -Command "Get-CimInstance Win32_Process -Filter \\"Name = 'LeagueClientUx.exe'\\" | Select-Object CommandLine | Format-List"`;

  exec(command, (err, stdout, stderr) => {
    if (err || !stdout || stderr) {
      console.log("Error: ", err);
      callback({
        username: "riot",
        password: "",
        port: "",
        success: false,
      });
      return;
    }

    const output = stdout
      .replace(/--\s*(\S+)/g, "--$1")
      .replace(/\s+/g, "")
      .replace(/\r?\n|\r/g, "")
      .trim();

    lcuData.password =
      output.match(/--remoting-auth-token=([A-Za-z0-9\-_]+)/)[1] != "null"
        ? output.match(/--remoting-auth-token=([A-Za-z0-9\-_]+)/)[1]
        : null;
    lcuData.port = output.match(/--app-port=([0-9]+)/)[1] != "null" ? output.match(/--app-port=([0-9]+)/)[1] : null;

    callback({
      username: "riot",
      password: lcuData.password,
      port: lcuData.port,
      success: true,
    });
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    title: "LOL AutoPick - Tortudereli",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  let appRun = false;

  setInterval(() => {
    getLcuData((x) => {
      if (x.success) {
        const { password, port } = x;
        if (port != "" && password != "" && !appRun) {
          startApp();
          appRun = true;
          console.log("League of Legends açıldı");
        } else if (port == "" || (password == "" && appRun)) {
          stopApp();
          appRun = false;
          console.log("League of Legends kapandı");
        }
      } else {
        stopApp();
        appRun = false;
        console.log("League of Legends kapandı");
      }
    });
  }, 2000);

  function startApp() {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname, `../../index.html`));
    }
  }

  function stopApp() {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + "/waiting-lol.html");
    } else {
      mainWindow.loadFile(path.join(__dirname, `../../waiting-lol.html`));
    }
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + "/waiting-lol.html");
  } else {
    mainWindow.loadFile(path.join(__dirname, `../../waiting-lol.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.maximize();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("get-owned-champions", async () => {
    const uri = `https://127.0.0.1:${lcuData.port}/lol-champions/v1/owned-champions-minimal`;

    const champions = await fetch(uri, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${lcuData.username}:${lcuData.password}`).toString("base64")}`,
      },
    })
      .then((res) => res.json())
      .catch((err: Error) => {
        console.log(err.message);
        return [];
      });

    return champions;
  });

  ipcMain.handle("auto-pick", async (_, banChampionId: number, pickChampionId: number)  => {
    const session = await fetch(`https://127.0.0.1:${lcuData.port}/lol-lobby-team-builder/champ-select/v1/session`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${lcuData.username}:${lcuData.password}`).toString("base64")}`,
      },
    });

    if (session.status !== 200) {
      return;
    }
    const sessionData = await session.json();
    if (sessionData.timer.phase !== "BAN_PICK") {
      return;
    }
    
    let banActionId = null;
    let pickActionId = null;
    let banActionIsInProgress = false;
    let pickActionIsInProgress = false;

    sessionData.actions.forEach((action: any) => {
      action.forEach((action: any) => {
        if (action.type === "ban" && action.actorCellId === sessionData.localPlayerCellId) {
          banActionId = action.id;
          banActionIsInProgress = action.isInProgress;
        }
        if (action.type === "pick" && action.actorCellId === sessionData.localPlayerCellId) {
          pickActionId = action.id;
          pickActionIsInProgress = action.isInProgress;
        }
      });
    });

    if (banActionId !== null && banChampionId !== 0 && banActionIsInProgress) {
      const patchBan = await fetch(
        `https://127.0.0.1:${lcuData.port}/lol-lobby-team-builder/champ-select/v1/session/actions/${banActionId}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${lcuData.username}:${lcuData.password}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            championId: banChampionId,
            completed: true,
          }),
        }
      )
      if (patchBan.status !== 204) {
        console.log("Ban patch failed", patchBan.status);
      }
      if (patchBan.status === 204) {
        mainWindow.webContents.send("ban-success");
      }
    }

    if (pickActionId !== null && pickChampionId !== 0 && pickActionIsInProgress) {
      const patchPick = await fetch(
        `https://127.0.0.1:${lcuData.port}/lol-lobby-team-builder/champ-select/v1/session/actions/${pickActionId}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${lcuData.username}:${lcuData.password}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            championId: pickChampionId,
            completed: true,
          }),
        }
      )

      if (patchPick.status !== 204) {
        console.log("Pick patch failed", patchPick.status);
      }
      if (patchPick.status === 204) {
        mainWindow.webContents.send("pick-success");
      }
    }
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
