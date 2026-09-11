import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { TaskForm } from "@/components/TaskForm";
import { useTheme } from "@/hooks/useTheme";
import { useTasks } from "@/store/taskStore";

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const task = useTasks((state) => state.tasks.find((item) => item.id === id));
  const updateTask = useTasks((state) => state.updateTask);

  if (!task) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="alert-circle-outline"
          title="Task not found"
          message="It may have been deleted."
        />
      </View>
    );
  }

  return (
    <TaskForm
      initialValues={task}
      submitLabel="Save changes"
      onSubmit={(input) => {
        updateTask(task.id, input);
        router.back();
      }}
    />
  );
}
