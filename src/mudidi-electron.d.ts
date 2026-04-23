export interface MudidiElectronAPI {
  getApiKey: () => Promise<string>;
  setApiKey: (key: string) => Promise<boolean>;
}

declare global {
  interface Window {
    mudidiElectron?: MudidiElectronAPI;
  }
}

export {};
