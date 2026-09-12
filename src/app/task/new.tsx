import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { TaskForm } from "@/components/TaskForm";
import { requestNotificationPermission } from "@/services/notifications";
import { useTasks } from "@/store/taskStore";

export default function NewTaskScreen() {
  const router = useRouter();
  const addTask = useTasks((state) => state.addTask);

  return (
    <TaskForm
      submitLabel="Create task"
      onSubmit={async (input) => {
        const allowed = await requestNotificationPermission();
        const task = addTask(input);

        if (!allowed) {
          Alert.alert(
            "Reminders are off",
            "The task was saved, but you will not get a reminder. Enable notifications in Settings to turn them on.",
          );
        }

        router.replace(`/task/${task.id}`);
      }}
    />
  );
}
