import { Ionicons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { syncTasks } from "@/services/sync";
import { useTasks } from "@/store/taskStore";

export function SyncBanner() {
  const { colors } = useTheme();
  const network = useNetworkState();
  const tasks = useTasks((state) => state.tasks);
  const deletedIds = useTasks((state) => state.deletedIds);
  const [syncing, setSyncing] = useState(false);

  const pendingCount =
    tasks.filter((task) => task.syncStatus !== "synced").length +
    deletedIds.length;

  if (network.isConnected === false) {
    return (
      <View
        style={[
          styles.banner,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons
          name="cloud-offline-outline"
          size={18}
          color={colors.textMuted}
        />
        <Text style={[styles.text, { color: colors.textMuted }]}>
          You're offline. Changes are saved on this device and will sync later.
        </Text>
      </View>
    );
  }

  if (pendingCount === 0) {
    return null;
  }

  async function syncNow() {
    setSyncing(true);
    const result = await syncTasks();
    setSyncing(false);

    if (!result.ok) {
      Alert.alert("Sync failed", result.error);
    }
  }

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Ionicons name="cloud-upload-outline" size={18} color={colors.warning} />
      <Text style={[styles.text, { color: colors.text }]}>
        {pendingCount} {pendingCount === 1 ? "change" : "changes"} not synced
        yet
      </Text>
      <Pressable
        onPress={syncNow}
        disabled={syncing}
        accessibilityRole="button"
        accessibilityLabel="Sync now"
        hitSlop={8}
      >
        <Text style={[styles.action, { color: colors.primary }]}>
          {syncing ? "Syncing…" : "Sync now"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 14,
  },
  action: {
    fontSize: 14,
    fontWeight: "600",
  },
});
