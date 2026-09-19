import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { TaskForm } from "@/components/TaskForm";
import { requestNotificationPermission } from "@/services/notifications";
import { useTasks } from "@/store/taskStore";

export default function NewTaskScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const addTask = useTasks((state) => state.addTask);

  return (
    <TaskForm
      submitLabel={t("form.createTask")}
      onSubmit={async (input) => {
        const allowed = await requestNotificationPermission();
        const task = addTask(input);

        if (!allowed) {
          Alert.alert(
            t("notifications.remindersOffTitle"),
            t("notifications.remindersOffMessage"),
          );
        }

        router.replace(`/task/${task.id}`);
      }}
    />
  );
}
