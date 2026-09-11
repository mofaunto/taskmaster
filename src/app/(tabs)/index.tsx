import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
import { TaskCard } from "@/components/TaskCard";
import { statusLabels, statusOrder } from "@/constants/status";
import { useTheme } from "@/hooks/useTheme";
import { useTasks } from "@/store/taskStore";
import { filterTasks, StatusFilter } from "@/utils/filterTasks";
import { SortBy, sortTasks } from "@/utils/sortTasks";

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  ...statusOrder.map((status) => ({
    label: statusLabels[status],
    value: status,
  })),
];

const sortOptions: { label: string; value: SortBy }[] = [
  { label: "Added", value: "created" },
  { label: "Due", value: "due" },
  { label: "Status", value: "status" },
];

export default function TasksScreen() {
  const { colors } = useTheme();
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
            placeholder="Search by title"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
            accessibilityLabel="Search tasks by title"
          />
          {query !== "" && (
            <Pressable
              onPress={() => setQuery("")}
              accessibilityLabel="Clear search"
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
      </View>

      <FlatList
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => <TaskCard task={item} onPress={() => {}} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          tasks.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title="No tasks yet"
              message="Tap + to create your first task."
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No matching tasks"
              message="Try a different search or status filter."
            />
          )
        }
      />
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
    gap: 10,
  },
});
