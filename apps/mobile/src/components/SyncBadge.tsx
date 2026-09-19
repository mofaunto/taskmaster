import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { SyncStatus } from "@/types/task";

const icons = {
  pending: "cloud-upload-outline",
  synced: "cloud-done-outline",
  failed: "cloud-offline-outline",
} as const;

export function SyncBadge({ status }: { status: SyncStatus }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const label = t(`sync.${status}`);

  const color =
    status === "failed"
      ? colors.danger
      : status === "synced"
        ? colors.success
        : colors.textMuted;

  return (
    <View style={styles.row} accessibilityLabel={label}>
      <Ionicons name={icons[status]} size={14} color={color} />
      <Text style={[styles.text, { color }]}>{label}</Text>
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
