import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { TaskForm } from "@/components/TaskForm";
import { useTheme } from "@/hooks/useTheme";
import { useTasks } from "@/store/taskStore";

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const task = useTasks((state) => state.tasks.find((item) => item.id === id));
  const updateTask = useTasks((state) => state.updateTask);

  if (!task) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="alert-circle-outline"
          title={t("task.notFoundTitle")}
          message={t("task.notFoundMessage")}
        />
      </View>
    );
  }

  return (
    <TaskForm
      initialValues={task}
      submitLabel={t("form.saveChanges")}
      onSubmit={(input) => {
        updateTask(task.id, input);
        router.back();
      }}
    />
  );
}
