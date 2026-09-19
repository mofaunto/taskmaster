import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SectionList, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { HistoryItem } from "@/components/HistoryItem";
import { useTheme } from "@/hooks/useTheme";
import { useHistory } from "@/store/historyStore";
import { useTasks } from "@/store/taskStore";
import { groupByDay } from "@/utils/groupByDay";

export default function HistoryScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const entries = useHistory((state) => state.entries);
  const tasks = useTasks((state) => state.tasks);

  const existingTaskIds = new Set(tasks.map((task) => task.id));
  const sections = groupByDay(entries, new Date(), {
    today: t("history.today"),
    yesterday: t("history.yesterday"),
    locale: i18n.language,
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(entry) => entry.id}
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              styles.header,
              { color: colors.textMuted, backgroundColor: colors.background },
            ]}
          >
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => {
          const taskExists =
            item.taskId !== null && existingTaskIds.has(item.taskId);
          return (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <HistoryItem
                entry={item}
                showTaskTitle
                onPress={
                  taskExists ? () => router.push(`/task/${item.taskId}`) : undefined
                }
              />
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title={t("history.emptyTitle")}
            message={t("history.emptyMessage")}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    padding: 16,
    gap: 8,
  },
  header: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingVertical: 8,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
});
