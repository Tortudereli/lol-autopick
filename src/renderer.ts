import "./index.css";

const autoPickElement = document.getElementById("auto-pick") as HTMLInputElement;
const autoBanElement = document.getElementById("auto-ban") as HTMLInputElement;
const bannedChampionsElement = document.getElementById("banned-champions") as HTMLSelectElement;
const pickedChampionsElement = document.getElementById("picked-champions") as HTMLSelectElement;
const autoAcceptElement = document.getElementById("auto-accept") as HTMLInputElement;
const toastContainer = document.getElementById("toast-container") as HTMLDivElement;

// Toast notification function
function showToast(title: string, message: string, type: 'success' | 'pick-success' | 'ban-success', icon: string) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">×</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Close button functionality
  const closeBtn = toast.querySelector('.toast-close') as HTMLButtonElement;
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 5000);
}

function removeToast(toast: HTMLElement) {
  toast.style.animation = 'slideOutRight 0.4s ease-out';
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 400);
}

async function init() {
  const ownedChampions = await window.lcuAPI.getOwnedChampions();
  
  // Add a default option
  const defaultPickOption = document.createElement("option");
  defaultPickOption.value = "";
  defaultPickOption.textContent = "Şampiyon Seçin...";
  pickedChampionsElement.appendChild(defaultPickOption);
  
  ownedChampions.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    pickedChampionsElement.appendChild(option);
  });

  if (ownedChampions.length > 0) {
    pickedChampionsElement.value = ownedChampions[0].id.toString();
    setBackground();
  }

  const champData = await fetch(
    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json"
  ).then((res) => res.json());
  
  // Add a default option for ban
  const defaultBanOption = document.createElement("option");
  defaultBanOption.value = "";
  defaultBanOption.textContent = "Şampiyon Seçin...";
  bannedChampionsElement.appendChild(defaultBanOption);
  
  champData.forEach((champion: { id: number; name: string }) => {
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
  const championName = pickedChampionsElement.options[pickedChampionsElement.selectedIndex].text;
  showToast(
    '🎯 Şampiyon Seçildi!',
    `${championName} başarıyla seçildi.`,
    'pick-success',
    '⚔️'
  );
});

window.lcuAPI.banSuccess(() => {
  autoBanElement.checked = false;
  const championName = bannedChampionsElement.options[bannedChampionsElement.selectedIndex].text;
  showToast(
    '🚫 Şampiyon Yasaklandı!',
    `${championName} başarıyla yasaklandı.`,
    'ban-success',
    '❌'
  );
});

pickedChampionsElement.addEventListener("change", () => {
  setBackground();
});

const setBackground = () => {
  if (pickedChampionsElement.value && pickedChampionsElement.value !== "") {
    window.document.body.style.backgroundImage = `url('https://cdn.communitydragon.org/latest/champion/${pickedChampionsElement.value}/splash-art')`;
  } else {
    window.document.body.style.backgroundImage = 'none';
  }
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
  showToast(
    '✅ Maç Kabul Edildi!',
    'Otomatik kabul başarılı.',
    'success',
    '🎮'
  );
});
