import { create } from "zustand";
import { persist } from "zustand/middleware";

import { appStorage } from "@/storage/appStorage";

export type ThemeSetting = "system" | "light" | "dark";

type SettingsState = {
  theme: ThemeSetting;
  hydrated: boolean;
  setTheme: (theme: ThemeSetting) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      hydrated: false,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "taskmaster-settings",
      storage: appStorage,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => () => {
        useSettings.setState({ hydrated: true });
      },
    },
  ),
);
