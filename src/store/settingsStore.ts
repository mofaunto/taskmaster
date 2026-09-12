import { create } from "zustand";
import { persist } from "zustand/middleware";

import { appStorage } from "@/storage/appStorage";

export type ThemeSetting = "system" | "light" | "dark";

type SettingsState = {
  theme: ThemeSetting;
  demoReminders: boolean;
  apiUrl: string;
  lastSyncAt: string | null;
  hydrated: boolean;
  setTheme: (theme: ThemeSetting) => void;
  setDemoReminders: (on: boolean) => void;
  setApiUrl: (url: string) => void;
  setLastSyncAt: (iso: string) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      demoReminders: false,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
      lastSyncAt: null,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      setDemoReminders: (on) => set({ demoReminders: on }),
      setApiUrl: (url) => set({ apiUrl: url }),
      setLastSyncAt: (iso) => set({ lastSyncAt: iso }),
    }),
    {
      name: "taskmaster-settings",
      storage: appStorage,
      partialize: (state) => ({
        theme: state.theme,
        demoReminders: state.demoReminders,
        apiUrl: state.apiUrl,
        lastSyncAt: state.lastSyncAt,
      }),
      onRehydrateStorage: () => () => {
        useSettings.setState({ hydrated: true });
      },
    },
  ),
);
