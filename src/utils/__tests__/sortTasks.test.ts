import { makeTask } from "@/test/makeTask";
import { sortTasks } from "@/utils/sortTasks";

const oldest = makeTask({
  id: "oldest",
  createdAt: "2026-09-01T08:00:00.000Z",
  dueAt: "2026-09-30T10:00:00.000Z",
  status: "completed",
});
const middle = makeTask({
  id: "middle",
  createdAt: "2026-09-05T08:00:00.000Z",
  dueAt: "2026-09-10T10:00:00.000Z",
  status: "new",
});
const newest = makeTask({
  id: "newest",
  createdAt: "2026-09-09T08:00:00.000Z",
  dueAt: "2026-09-20T10:00:00.000Z",
  status: "in_progress",
});

const ids = (tasks: ReturnType<typeof makeTask>[]) => tasks.map((t) => t.id);

describe("sortTasks", () => {
  it("sorts by created date, newest first", () => {
    const result = sortTasks([oldest, newest, middle], "created");
    expect(ids(result)).toEqual(["newest", "middle", "oldest"]);
  });

  it("sorts by due date, soonest first", () => {
    const result = sortTasks([oldest, newest, middle], "due");
    expect(ids(result)).toEqual(["middle", "newest", "oldest"]);
  });

  it("sorts by status in New, In Progress, Completed, Cancelled order", () => {
    const cancelled = makeTask({ id: "cancelled", status: "cancelled" });
    const result = sortTasks([cancelled, oldest, newest, middle], "status");
    expect(ids(result)).toEqual(["middle", "newest", "oldest", "cancelled"]);
  });

  it("uses due date as tie-break inside the same status", () => {
    const later = makeTask({ id: "later", dueAt: "2026-09-25T10:00:00.000Z" });
    const sooner = makeTask({ id: "sooner", dueAt: "2026-09-12T10:00:00.000Z" });
    const result = sortTasks([later, sooner], "status");
    expect(ids(result)).toEqual(["sooner", "later"]);
  });

  it("does not mutate the original array", () => {
    const input = [oldest, newest];
    sortTasks(input, "created");
    expect(ids(input)).toEqual(["oldest", "newest"]);
  });
});
