import { BrowserWindow, app, ipcMain } from "electron";

import { exec } from "node:child_process";
import path from "node:path";
import started from "electron-squirrel-startup";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

interface ChampSelectAction {
  id: number;
  type: "ban" | "pick";
  actorCellId: number;
  isInProgress: boolean;
  championId: number;
  completed: boolean;
}

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
  }, 5000);

  function startApp() {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
  }

  function stopApp() {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + "/waiting-lol.html");
    } else {
      mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/waiting-lol.html`));
    }
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + "/waiting-lol.html");
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/waiting-lol.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("get-owned-champions", async () => {
    const champions = await fetchApi("/lol-champions/v1/owned-champions-minimal", {
      headers: { "Content-Type": "application/json" },
    })
    if (champions.status !== 200) {
      return [];
    }
    return await champions.json();
  });

  ipcMain.handle("auto-pick", async (_, banChampionId: number, pickChampionId: number) => {
    const session = await fetchApi(`/lol-lobby-team-builder/champ-select/v1/session`, {
      headers: { "Content-Type": "application/json" },
    });

    if (session.status !== 200) {
      return;
    }
    const sessionData = await session.json();

    let banActionId = null;
    let pickActionId = null;
    let banActionIsInProgress = false;
    let pickActionIsInProgress = false;

    sessionData.actions.forEach((actions: ChampSelectAction[]) => {
      actions.forEach(async (action: ChampSelectAction) => {
        if (action.type === "ban" && action.actorCellId === sessionData.localPlayerCellId) {
          banActionId = action.id;
          banActionIsInProgress = action.isInProgress;
        }
        if (action.type === "pick" && action.actorCellId === sessionData.localPlayerCellId) {
          pickActionId = action.id;
          pickActionIsInProgress = action.isInProgress;
          if (action.championId === 0) {
            const showPick = await fetchApi(`/lol-lobby-team-builder/champ-select/v1/session/actions/${action.id}`, {
              headers: { "Content-Type": "application/json" },
              method: "PATCH",
              body: JSON.stringify({
                championId: pickChampionId,
              }),
            });
            if (showPick.status !== 204) {
              console.log("Show pick patch failed", showPick.status);
            }
          }
        }
      });
    });

    if (sessionData.timer.phase !== "BAN_PICK") {
      return;
    }

    if (banActionId !== null && banChampionId !== 0 && banActionIsInProgress) {
      const patchBan = await fetchApi(`/lol-lobby-team-builder/champ-select/v1/session/actions/${banActionId}`, {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({
          championId: banChampionId,
          completed: true,
        }),
      });
      if (patchBan.status !== 204) {
        console.log("Ban patch failed", patchBan.status);
      }
      if (patchBan.status === 204) {
        mainWindow.webContents.send("ban-success");
      }
    }

    if (pickActionId !== null && pickChampionId !== 0 && pickActionIsInProgress) {
      const patchPick = await fetchApi(`/lol-lobby-team-builder/champ-select/v1/session/actions/${pickActionId}`, {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({
          championId: pickChampionId,
          completed: true,
        }),
      });

      if (patchPick.status !== 204) {
        console.log("Pick patch failed", patchPick.status);
      }
      if (patchPick.status === 204) {
        mainWindow.webContents.send("pick-success");
      }
    }
  });

  ipcMain.handle("auto-accept", async () => {
    const session = await fetchApi(`/lol-matchmaking/v1/ready-check/accept`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (session.status !== 204) {
      console.log("Auto accept failed", session.status);
    }

    if (session.status === 204) {
      mainWindow.webContents.send("auto-accept-success");
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

const fetchApi = async (url: string, options: RequestInit) => {
  return await fetch(`https://127.0.0.1:${lcuData.port}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Basic ${Buffer.from(`${lcuData.username}:${lcuData.password}`).toString("base64")}`,
    },
  });
};
