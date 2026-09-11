import { TaskInput } from "@/types/task";

export type TaskErrors = Partial<
  Record<"title" | "description" | "dueAt" | "address", string>
>;

export function validateTask(
  input: TaskInput,
  originalDueAt?: string,
): TaskErrors {
  const errors: TaskErrors = {};

  if (input.title.trim() === "") {
    errors.title = "Title is required";
  }
  if (input.description.trim() === "") {
    errors.description = "Description is required";
  }
  if (input.address.trim() === "") {
    errors.address = "Address is required";
  }

  const due = new Date(input.dueAt);
  if (input.dueAt === "" || Number.isNaN(due.getTime())) {
    errors.dueAt = "Due date and time are required";
  } else if (input.dueAt !== originalDueAt && due.getTime() <= Date.now()) {
    errors.dueAt = "Due date must be in the future";
  }

  return errors;
}
