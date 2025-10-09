const autoPickElement = document.getElementById("auto-pick") as HTMLInputElement;
const autoBanElement = document.getElementById("auto-ban") as HTMLInputElement;
const bannedChampionsElement = document.getElementById("banned-champions") as HTMLSelectElement;
const pickedChampionsElement = document.getElementById("picked-champions") as HTMLSelectElement;

async function init() {
  const ownedChampions = await window.lcuAPI.getOwnedChampions();

  ownedChampions.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    pickedChampionsElement.appendChild(option);
  });
}

init();

autoPickElement.addEventListener("change", (e) => {
  const isAutoPick = (e.target as HTMLInputElement).checked;
  let interval: NodeJS.Timeout;
  if (isAutoPick) {
    console.log("Auto Pick");
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