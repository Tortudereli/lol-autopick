import "./index.css";

const autoPickElement = document.getElementById("auto-pick") as HTMLInputElement;
const autoBanElement = document.getElementById("auto-ban") as HTMLInputElement;
const bannedChampionsElement = document.getElementById("banned-champions") as HTMLSelectElement;
const pickedChampionsElement = document.getElementById("picked-champions") as HTMLSelectElement;
const autoAcceptElement = document.getElementById("auto-accept") as HTMLInputElement;

async function init() {
  const ownedChampions = await window.lcuAPI.getOwnedChampions();
  ownedChampions.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    pickedChampionsElement.appendChild(option);
  });

  pickedChampionsElement.value = ownedChampions[0].id.toString();
  setBackground();

  const champData = await fetch(
    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json"
  ).then((res) => res.json());
  champData.forEach((champion: any) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    bannedChampionsElement.appendChild(option);
  });
}

init();

let interval: NodeJS.Timeout;
autoPickElement.addEventListener("change", (e) => {
  if (interval) {
    clearInterval(interval);
  }
  const isAutoPick = (e.target as HTMLInputElement).checked;
  if (isAutoPick) {
    interval = setInterval(async () => {
      const bannedChampionId = autoBanElement.checked ? parseInt(bannedChampionsElement.value) : 0;
      const pickedChampionId = autoPickElement.checked ? parseInt(pickedChampionsElement.value) : 0;
      const autoPickResponse = await window.lcuAPI.autoPick(bannedChampionId, pickedChampionId);
      console.log(autoPickResponse);
    }, 1000);
  } else {
    clearInterval(interval);
  }
});

window.lcuAPI.pickSuccess(() => {
  autoPickElement.checked = false;
});

window.lcuAPI.banSuccess(() => {
  autoBanElement.checked = false;
});

pickedChampionsElement.addEventListener("change", (e) => {
  setBackground();
});

const setBackground = () => {
  window.document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://cdn.communitydragon.org/latest/champion/${pickedChampionsElement.value}/splash-art')`;
};

let autoAcceptInterval: NodeJS.Timeout;
autoAcceptElement.addEventListener("change", (e) => {
  if (autoAcceptInterval) {
    clearInterval(autoAcceptInterval);
  }
  const isAutoAccept = (e.target as HTMLInputElement).checked;
  if (isAutoAccept) {
    autoAcceptInterval = setInterval(async () => {
      const autoAcceptResponse = await window.lcuAPI.autoAccept();
      console.log(autoAcceptResponse);
    }, 1000);
  } else {
    clearInterval(autoAcceptInterval);
  }
});

window.lcuAPI.autoAcceptSuccess(() => {
  console.log("Auto accept success");
});
