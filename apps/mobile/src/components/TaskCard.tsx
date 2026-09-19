import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { StatusBadge } from "@/components/StatusBadge";
import { SyncBadge } from "@/components/SyncBadge";
import { useTheme } from "@/hooks/useTheme";
import { Task } from "@/types/task";
import { formatDateTime } from "@/utils/date";

type Props = {
  task: Task;
  onPress: () => void;
};

export function TaskCard({ task, onPress }: Props) {
  const { colors } = useTheme();

  const isOpen = task.status === "new" || task.status === "in_progress";
  const overdue = isOpen && new Date(task.dueAt) < new Date();
  const dueColor = overdue ? colors.danger : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open task ${task.title}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {task.title}
      </Text>

      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={14} color={dueColor} />
        <Text style={[styles.meta, { color: dueColor }]}>
          {formatDateTime(task.dueAt)}
          {overdue ? " · Overdue" : ""}
        </Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text
          style={[styles.meta, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {task.address}
        </Text>
      </View>

      <View style={styles.footer}>
        <StatusBadge status={task.status} />
        <View style={styles.footerRight}>
          {task.attachments.length > 0 && (
            <View style={styles.row}>
              <Ionicons name="attach" size={14} color={colors.textMuted} />
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {task.attachments.length}
              </Text>
            </View>
          )}
          <SyncBadge status={task.syncStatus} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    fontSize: 14,
    flexShrink: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
