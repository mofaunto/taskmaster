import { StyleSheet, Text, View } from "react-native";

import { statusColors, statusLabels } from "@/constants/status";
import { TaskStatus } from "@/types/task";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const color = statusColors[status];

  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <Text style={[styles.text, { color }]}>{statusLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
