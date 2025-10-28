import "./index.css";

const autoPickElement = document.getElementById(
  "auto-pick"
) as HTMLInputElement;
const autoBanElement = document.getElementById("auto-ban") as HTMLInputElement;
const bannedChampionsElement = document.getElementById(
  "banned-champions"
) as HTMLSelectElement;
const pickedChampionsElement = document.getElementById(
  "picked-champions"
) as HTMLSelectElement;
const autoAcceptElement = document.getElementById(
  "auto-accept"
) as HTMLInputElement;
const toastContainer = document.getElementById(
  "toast-container"
) as HTMLDivElement;
const dodgeMatchElement = document.getElementById(
  "dodge-match"
) as HTMLInputElement;
const pickedChampionsSearchElement = document.getElementById(
  "picked-champions-search"
) as HTMLInputElement;
const bannedChampionsSearchElement = document.getElementById(
  "banned-champions-search"
) as HTMLInputElement;

// Champion data interfaces
interface Champion {
  id: number;
  name: string;
}

// Store all champions for filtering
let allPickedChampions: Champion[] = [];
let allBannedChampions: Champion[] = [];

// Toast notification function
function showToast(
  title: string,
  message: string,
  type: "success" | "pick-success" | "ban-success",
  icon: string
) {
  const toast = document.createElement("div");
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
  const closeBtn = toast.querySelector(".toast-close") as HTMLButtonElement;
  closeBtn.addEventListener("click", () => {
    removeToast(toast);
  });

  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 5000);
}

function removeToast(toast: HTMLElement) {
  toast.style.animation = "slideOutRight 0.4s ease-out";
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 400);
}

// Filter champions based on search input
function filterChampions(
  selectElement: HTMLSelectElement,
  champions: Champion[],
  searchTerm: string,
  keepNoneFirst = false
) {
  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  // Filter champions based on search term
  const filteredChampions = champions.filter((champion) =>
    champion.name.toLowerCase().includes(lowerSearchTerm)
  );

  // If keepNoneFirst is true, ensure "None" stays at the beginning
  if (keepNoneFirst && filteredChampions.length > 0) {
    const noneIndex = filteredChampions.findIndex((c) => c.name === "None");
    if (noneIndex > 0) {
      const noneChamp = filteredChampions.splice(noneIndex, 1)[0];
      filteredChampions.unshift(noneChamp);
    }
  }

  // Clear current options
  selectElement.innerHTML = "";

  // Add filtered options
  filteredChampions.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    selectElement.appendChild(option);
  });

  // If no results, show a message
  if (filteredChampions.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Champion not found";
    option.disabled = true;
    selectElement.appendChild(option);
  }
}

// Sort champions alphabetically, keeping "None" first for banned champions
function sortChampions(
  champions: Champion[],
  keepNoneFirst = false
): Champion[] {
  const sorted = [...champions].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );

  if (keepNoneFirst) {
    const noneIndex = sorted.findIndex((c) => c.name === "None");
    if (noneIndex > 0) {
      const noneChamp = sorted.splice(noneIndex, 1)[0];
      sorted.unshift(noneChamp);
    }
  }

  return sorted;
}

async function init() {
  const ownedChampions = await window.lcuAPI.getOwnedChampions();

  // Sort and store picked champions
  allPickedChampions = sortChampions(ownedChampions);

  allPickedChampions.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    pickedChampionsElement.appendChild(option);
  });

  if (allPickedChampions.length > 0) {
    pickedChampionsElement.value = allPickedChampions[0].id.toString();
    setBackground();
  }

  const champData = await fetch(
    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json"
  ).then((res) => res.json());

  // Add "None" option first
  const noneChampion: Champion = { id: -1, name: "None" };
  const championsWithNone: Champion[] = [noneChampion, ...champData];

  // Sort and store banned champions (None will stay first)
  allBannedChampions = sortChampions(championsWithNone, true);

  allBannedChampions.forEach((champion: Champion) => {
    const option = document.createElement("option");
    option.value = champion.id.toString();
    option.textContent = champion.name;
    bannedChampionsElement.appendChild(option);
  });
}

// Setup search functionality for picked champions
pickedChampionsSearchElement.addEventListener("input", (e) => {
  const searchTerm = (e.target as HTMLInputElement).value;
  filterChampions(pickedChampionsElement, allPickedChampions, searchTerm);
});

// Setup search functionality for banned champions
bannedChampionsSearchElement.addEventListener("input", (e) => {
  const searchTerm = (e.target as HTMLInputElement).value;
  filterChampions(bannedChampionsElement, allBannedChampions, searchTerm, true);
});

init();

let pickedChampionId = 0;
autoPickElement.addEventListener("change", (e) => {
  const isAutoPick = (e.target as HTMLInputElement).checked;
  if (isAutoPick)
    pickedChampionId = parseInt(pickedChampionsElement.value) || 0;
});

let bannedChampionId = 0;
autoBanElement.addEventListener("change", (e) => {
  const isAutoBan = (e.target as HTMLInputElement).checked;
  if (isAutoBan) bannedChampionId = parseInt(bannedChampionsElement.value) || 0;
});

const autoPick = () => {
  if (autoPickElement.checked || autoBanElement.checked) {
    window.lcuAPI.autoPick(bannedChampionId, pickedChampionId);
  }
};

setInterval(autoPick, 1000);

window.lcuAPI.pickSuccess(() => {
  autoPickElement.checked = false;
  const championName =
    pickedChampionsElement.options[pickedChampionsElement.selectedIndex].text;
  showToast(
    "🎯 Champion Picked!",
    `${championName} successfully picked.`,
    "pick-success",
    "⚔️"
  );
});

window.lcuAPI.banSuccess(() => {
  autoBanElement.checked = false;
  const championName =
    bannedChampionsElement.options[bannedChampionsElement.selectedIndex].text;
  showToast(
    "🚫 Champion Banned!",
    `${championName} successfully banned.`,
    "ban-success",
    "❌"
  );
});

pickedChampionsElement.addEventListener("change", () => {
  setBackground();
});

const setBackground = () => {
  if (pickedChampionsElement.value && pickedChampionsElement.value !== "") {
    window.document.body.style.backgroundImage = `url('https://cdn.communitydragon.org/latest/champion/${pickedChampionsElement.value}/splash-art')`;
  } else {
    window.document.body.style.backgroundImage = "none";
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
    "✅ Match Accepted!",
    "Match accepted successfully.",
    "success",
    "🎮"
  );
});

dodgeMatchElement.addEventListener(
  "click",
  async () => await window.lcuAPI.dodgeMatch()
);

window.lcuAPI.dodgeMatchSuccess(() => {
  console.log("Dodge match success");
  showToast("🚫 Match Dodged!", "Match dodged successfully.", "success", "🚫");
});
