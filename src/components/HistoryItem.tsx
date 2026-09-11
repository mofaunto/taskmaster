import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { HistoryAction, HistoryEntry } from "@/types/history";
import { formatDateTime } from "@/utils/date";

const icons = {
  created: "add-circle-outline",
  updated: "create-outline",
  status_changed: "swap-horizontal-outline",
  attachment_added: "attach-outline",
  attachment_removed: "remove-circle-outline",
  deleted: "trash-outline",
  synced: "cloud-done-outline",
  sync_failed: "cloud-offline-outline",
} as const satisfies Record<HistoryAction, string>;

type Props = {
  entry: HistoryEntry;
  showTaskTitle?: boolean;
};

export function HistoryItem({ entry, showTaskTitle }: Props) {
  const { colors } = useTheme();

  const iconColor =
    entry.action === "sync_failed" || entry.action === "deleted"
      ? colors.danger
      : colors.primary;

  return (
    <View style={styles.row}>
      <Ionicons name={icons[entry.action]} size={20} color={iconColor} />
      <View style={styles.body}>
        <Text style={[styles.description, { color: colors.text }]}>
          {entry.description}
        </Text>
        {showTaskTitle && (
          <Text
            style={[styles.taskTitle, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {entry.taskTitle}
          </Text>
        )}
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {formatDateTime(entry.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontSize: 15,
    fontWeight: "500",
  },
  taskTitle: {
    fontSize: 14,
  },
  time: {
    fontSize: 13,
  },
});
