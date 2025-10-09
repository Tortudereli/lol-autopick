// src/types/preload.d.ts
export {};

interface Champion {
  active: boolean;
  alias: string;
  banVoPath: string;
  baseLoadScreenPath: string;
  baseSplashPath: string;
  botEnabled: boolean;
  chooseVoPath: string;
  disabledQueues: string[];
  freeToPlay: boolean;
  id: number;
  isVisibleInClient: boolean;
  name: string;
  ownership: {
    loyaltyReward: boolean;
    owned: boolean;
    rental: {
      endDate: number;
      purchaseDate: number;
      rented: boolean;
      winCountRemaining: number;
    };
    xboxGPReward: boolean;
  };
  purchased: number;
  rankedPlayEnabled: boolean;
  roles: string[];
  squarePortraitPath: string;
  stingerSfxPath: string;
  title: string;
}

declare global {
  interface Window {
    lcuAPI: {
      getOwnedChampions: () => Promise<Champion[]>;
      autoPick: (banChampionId: number, pickChampionId: number) => Promise<void>;
      pickSuccess: (callback: () => void) => void;
      banSuccess: (callback: () => void) => void;
    };
  }
}
