import { addNetworkStateListener } from "expo-network";
import { useEffect } from "react";

import { syncTasks } from "@/services/sync";
import { useSettings } from "@/store/settingsStore";
import { useTasks } from "@/store/taskStore";

export function useNetworkSync() {
  const settingsReady = useSettings((state) => state.hydrated);
  const tasksReady = useTasks((state) => state.hydrated);

  useEffect(() => {
    if (!settingsReady || !tasksReady) {
      return;
    }

    syncTasks();

    const subscription = addNetworkStateListener((state) => {
      if (state.isConnected) {
        syncTasks();
      }
    });
    return () => subscription.remove();
  }, [settingsReady, tasksReady]);
}
