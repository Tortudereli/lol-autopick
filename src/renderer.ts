const selectElement = document.getElementById("champions") as HTMLSelectElement;
const autoPickElement = document.getElementById("auto-pick") as HTMLInputElement;
const exitChampSelectElement = document.getElementById("exit-champ-select") as HTMLButtonElement;

async function init() {
  const ownedChampions = await window.lcuAPI.getOwnedChampions();

  ownedChampions.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    selectElement.appendChild(option);
  });
}

init();

autoPickElement.addEventListener("change", (e) => {
  const isAutoPick = (e.target as HTMLInputElement).checked;
  let interval: NodeJS.Timeout;
  if (isAutoPick) {
    console.log("Auto Pick");
    interval = setInterval(async () => {
      const autoPickResponse = await window.lcuAPI.autoPick(266, 517);
      console.log(autoPickResponse);
    }, 1000);
  } else {
    clearInterval(interval);
  }
});

exitChampSelectElement.addEventListener("click", () => {
  window.lcuAPI.exitChampSelect();
});
