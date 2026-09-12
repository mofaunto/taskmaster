import { create } from "zustand";
import { persist } from "zustand/middleware";

import { appStorage } from "@/storage/appStorage";

export type ThemeSetting = "system" | "light" | "dark";

type SettingsState = {
  theme: ThemeSetting;
  demoReminders: boolean;
  hydrated: boolean;
  setTheme: (theme: ThemeSetting) => void;
  setDemoReminders: (on: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      demoReminders: false,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      setDemoReminders: (on) => set({ demoReminders: on }),
    }),
    {
      name: "taskmaster-settings",
      storage: appStorage,
      partialize: (state) => ({
        theme: state.theme,
        demoReminders: state.demoReminders,
      }),
      onRehydrateStorage: () => () => {
        useSettings.setState({ hydrated: true });
      },
    },
  ),
);
