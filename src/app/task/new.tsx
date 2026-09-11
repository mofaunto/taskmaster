import { useRouter } from "expo-router";

import { TaskForm } from "@/components/TaskForm";
import { useTasks } from "@/store/taskStore";

export default function NewTaskScreen() {
  const router = useRouter();
  const addTask = useTasks((state) => state.addTask);

  return (
    <TaskForm
      submitLabel="Create task"
      onSubmit={(input) => {
        addTask(input);
        router.back();
      }}
    />
  );
}
