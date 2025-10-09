// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('lcuAPI', {
  getOwnedChampions: () => ipcRenderer.invoke('get-owned-champions'),
  autoPick: (banChampionId: number, pickChampionId: number) => ipcRenderer.invoke('auto-pick', banChampionId, pickChampionId),  
  pickSuccess: (callback: () => void) => ipcRenderer.on('pick-success', () => callback()),
  banSuccess: (callback: () => void) => ipcRenderer.on('ban-success', () => callback()),
});