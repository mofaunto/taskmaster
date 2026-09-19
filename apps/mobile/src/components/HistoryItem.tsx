import { Ionicons } from "@expo/vector-icons";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  onPress?: () => void;
};

export function HistoryItem({ entry, showTaskTitle, onPress }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const iconColor =
    entry.action === "sync_failed" || entry.action === "deleted"
      ? colors.danger
      : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={
        onPress ? t("tasks.openTask", { title: entry.taskTitle }) : undefined
      }
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Ionicons name={icons[entry.action]} size={20} color={iconColor} />
      <View style={styles.body}>
        <Text style={[styles.description, { color: colors.text }]}>
          {describeEntry(entry, t, i18n.language)}
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
          {formatDateTime(entry.createdAt, i18n.language)}
        </Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

function describeEntry(
  entry: HistoryEntry,
  t: TFunction,
  locale: string,
): string {
  if (!entry.meta) {
    return entry.description ?? t(`history.${entry.action}`);
  }

  if (entry.action === "status_changed") {
    return t("history.status_changed", {
      from: t(`status.${entry.meta.from}`),
      to: t(`status.${entry.meta.to}`),
    });
  }

  if (entry.action === "created") {
    return t("history.created", {
      due: formatDateTime(String(entry.meta.due), locale),
    });
  }

  return t(`history.${entry.action}`, entry.meta);
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
