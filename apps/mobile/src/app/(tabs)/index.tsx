import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FilterChip } from "@/components/FilterChip";
import { OptionSelector } from "@/components/OptionSelector";
import { SyncBanner } from "@/components/SyncBanner";
import { TaskCard } from "@/components/TaskCard";
import { statusOrder } from "@/constants/status";
import { useTheme } from "@/hooks/useTheme";
import { useTasks } from "@/store/taskStore";
import { filterTasks, StatusFilter } from "@/utils/filterTasks";
import { SortBy, sortTasks } from "@/utils/sortTasks";

export default function TasksScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: t("tasks.filterAll"), value: "all" },
    ...statusOrder.map((status) => ({
      label: t(`status.${status}`),
      value: status as StatusFilter,
    })),
  ];

  const sortOptions: { label: string; value: SortBy }[] = [
    { label: t("tasks.sortAdded"), value: "created" },
    { label: t("tasks.sortDue"), value: "due" },
    { label: t("tasks.sortStatus"), value: "status" },
  ];
  const tasks = useTasks((state) => state.tasks);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("created");

  const visibleTasks = sortTasks(filterTasks(tasks, query, status), sortBy);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.controls}>
        <View
          style={[
            styles.search,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("tasks.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
            accessibilityLabel={t("tasks.searchLabel")}
          />
          {query !== "" && (
            <Pressable
              onPress={() => setQuery("")}
              accessibilityLabel={t("tasks.clearSearch")}
              hitSlop={8}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {statusFilters.map((filter) => (
            <FilterChip
              key={filter.value}
              label={filter.label}
              selected={filter.value === status}
              onPress={() => setStatus(filter.value)}
            />
          ))}
        </ScrollView>

        <OptionSelector
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />

        <SyncBanner />
      </View>

      <FlatList
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => router.push(`/task/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          tasks.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title={t("tasks.emptyTitle")}
              message={t("tasks.emptyMessage")}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title={t("tasks.noMatchTitle")}
              message={t("tasks.noMatchMessage")}
            />
          )
        }
      />

      <Pressable
        onPress={() => router.push("/task/new")}
        accessibilityRole="button"
        accessibilityLabel={t("tasks.createTask")}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  controls: {
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  chips: {
    gap: 8,
  },
  list: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 96,
    gap: 10,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
