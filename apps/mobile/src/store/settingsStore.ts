import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Language } from "@/i18n";
import { appStorage } from "@/storage/appStorage";

export type ThemeSetting = "system" | "light" | "dark";

export type LanguageSetting = "system" | Language;

type SettingsState = {
  theme: ThemeSetting;
  language: LanguageSetting;
  demoReminders: boolean;
  apiUrl: string;
  lastSyncAt: string | null;
  hydrated: boolean;
  setTheme: (theme: ThemeSetting) => void;
  setLanguage: (language: LanguageSetting) => void;
  setDemoReminders: (on: boolean) => void;
  setApiUrl: (url: string) => void;
  setLastSyncAt: (iso: string) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "system",
      demoReminders: false,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
      lastSyncAt: null,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setDemoReminders: (on) => set({ demoReminders: on }),
      setApiUrl: (url) => set({ apiUrl: url }),
      setLastSyncAt: (iso) => set({ lastSyncAt: iso }),
    }),
    {
      name: "taskmaster-settings",
      storage: appStorage,
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
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
