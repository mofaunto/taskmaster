import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { SyncStatus } from "@/types/task";

const icons = {
  pending: "cloud-upload-outline",
  synced: "cloud-done-outline",
  failed: "cloud-offline-outline",
} as const;

const labels: Record<SyncStatus, string> = {
  pending: "Pending sync",
  synced: "Synced",
  failed: "Sync failed",
};

export function SyncBadge({ status }: { status: SyncStatus }) {
  const { colors } = useTheme();

  const color =
    status === "failed"
      ? colors.danger
      : status === "synced"
        ? colors.success
        : colors.textMuted;

  return (
    <View style={styles.row} accessibilityLabel={labels[status]}>
      <Ionicons name={icons[status]} size={14} color={color} />
      <Text style={[styles.text, { color }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  text: {
    fontSize: 12,
  },
});
