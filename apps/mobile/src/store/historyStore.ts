import { create } from "zustand";
import { persist } from "zustand/middleware";

import { appStorage } from "@/storage/appStorage";
import { HistoryAction, HistoryEntry } from "@/types/history";
import { nowIso } from "@/utils/date";
import { newId } from "@/utils/id";

const MAX_ENTRIES = 200;

type NewEntry = {
  taskId: string | null;
  taskTitle: string;
  action: HistoryAction;
  description: string;
};

type HistoryState = {
  entries: HistoryEntry[];
  addEntry: (entry: NewEntry) => void;
};

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (entry) =>
        set((state) => ({
          entries: [
            { ...entry, id: newId(), createdAt: nowIso() },
            ...state.entries,
          ].slice(0, MAX_ENTRIES),
        })),
    }),
    {
      name: "taskmaster-history",
      storage: appStorage,
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);
