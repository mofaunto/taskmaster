import { makeTask } from "@/test/makeTask";
import { ServerTask, Task } from "@/types/task";
import { mergeTasks } from "@/utils/mergeTasks";

function serverCopy(task: Task, changes: Partial<ServerTask> = {}): ServerTask {
  const { notificationId, syncStatus, ...serverTask } = task;
  return { ...serverTask, ...changes };
}

const older = "2026-09-10T08:00:00.000Z";
const newer = "2026-09-11T08:00:00.000Z";

describe("mergeTasks", () => {
  it("keeps the local copy when it is newer", () => {
    const local = makeTask({ id: "a", title: "Local edit", updatedAt: newer });
    const remote = serverCopy(local, {
      title: "Server version",
      updatedAt: older,
    });
    const { tasks, received } = mergeTasks([local], [remote], []);
    expect(tasks).toEqual([local]);
    expect(received).toBe(0);
  });

  it("takes the server copy when it is newer and marks it synced", () => {
    const local = makeTask({
      id: "a",
      title: "Stale",
      updatedAt: older,
      syncStatus: "pending",
      notificationId: "notif-1",
    });
    const remote = serverCopy(local, { title: "Fresh", updatedAt: newer });
    const { tasks, received } = mergeTasks([local], [remote], []);
    expect(tasks[0].title).toBe("Fresh");
    expect(tasks[0].syncStatus).toBe("synced");
    expect(tasks[0].notificationId).toBe("notif-1");
    expect(received).toBe(1);
  });

  it("keeps the local copy on a timestamp tie", () => {
    const local = makeTask({ id: "a", title: "Mine", updatedAt: older });
    const remote = serverCopy(local, { title: "Theirs" });
    expect(mergeTasks([local], [remote], []).tasks[0].title).toBe("Mine");
  });

  it("adds tasks that only exist on the server", () => {
    const local = makeTask({ id: "a" });
    const remote = serverCopy(makeTask({ id: "b", title: "From server" }));
    const { tasks, received } = mergeTasks([local], [remote], []);
    expect(tasks.map((t) => t.id)).toEqual(["a", "b"]);
    expect(tasks[1].syncStatus).toBe("synced");
    expect(received).toBe(1);
  });

  it("does not re-add a task the device deleted", () => {
    const remote = serverCopy(makeTask({ id: "gone" }));
    const { tasks } = mergeTasks([], [remote], ["gone"]);
    expect(tasks).toEqual([]);
  });

  it("keeps local-only tasks untouched so they can be pushed", () => {
    const local = makeTask({ id: "new-on-device", syncStatus: "pending" });
    const { tasks } = mergeTasks([local], [], []);
    expect(tasks).toEqual([local]);
  });
});
