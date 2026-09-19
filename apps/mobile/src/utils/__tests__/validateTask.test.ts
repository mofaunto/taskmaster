import { TaskInput } from "@/types/task";
import { validateTask } from "@/utils/validateTask";

const valid: TaskInput = {
  title: "Check the boiler",
  description: "Annual inspection",
  dueAt: "2026-09-20T10:00:00.000Z",
  address: "Amir Temur street 1",
};

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date("2026-09-15T12:00:00.000Z"));
});

afterAll(() => {
  jest.useRealTimers();
});

describe("validateTask", () => {
  it("accepts a complete task with a future due date", () => {
    expect(validateTask(valid)).toEqual({});
  });

  it("requires title, description and address, ignoring whitespace", () => {
    const errors = validateTask({
      ...valid,
      title: "   ",
      description: "",
      address: " ",
    });
    expect(errors.title).toBe("validation.titleRequired");
    expect(errors.description).toBe("validation.descriptionRequired");
    expect(errors.address).toBe("validation.addressRequired");
  });

  it("requires a due date", () => {
    expect(validateTask({ ...valid, dueAt: "" }).dueAt).toBe(
      "validation.dueRequired",
    );
    expect(validateTask({ ...valid, dueAt: "not a date" }).dueAt).toBe(
      "validation.dueRequired",
    );
  });

  it("rejects a due date in the past", () => {
    const past = "2026-09-15T11:59:00.000Z";
    expect(validateTask({ ...valid, dueAt: past }).dueAt).toBe(
      "validation.dueFuture",
    );
  });

  it("allows an unchanged past due date when editing", () => {
    const past = "2026-09-15T11:59:00.000Z";
    expect(validateTask({ ...valid, dueAt: past }, past)).toEqual({});
  });

  it("still rejects a past due date when it was changed during editing", () => {
    const past = "2026-09-15T11:59:00.000Z";
    const original = "2026-09-14T09:00:00.000Z";
    expect(validateTask({ ...valid, dueAt: past }, original).dueAt).toBe(
      "validation.dueFuture",
    );
  });
});
