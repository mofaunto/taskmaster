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
    errors.title = "validation.titleRequired";
  }
  if (input.description.trim() === "") {
    errors.description = "validation.descriptionRequired";
  }
  if (input.address.trim() === "") {
    errors.address = "validation.addressRequired";
  }

  const due = new Date(input.dueAt);
  if (input.dueAt === "" || Number.isNaN(due.getTime())) {
    errors.dueAt = "validation.dueRequired";
  } else if (input.dueAt !== originalDueAt && due.getTime() <= Date.now()) {
    errors.dueAt = "validation.dueFuture";
  }

  return errors;
}
