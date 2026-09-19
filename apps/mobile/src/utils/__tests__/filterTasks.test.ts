import { makeTask } from "@/test/makeTask";
import { filterTasks } from "@/utils/filterTasks";

const boiler = makeTask({
  id: "boiler",
  title: "Check the boiler",
  status: "new",
});
const roof = makeTask({
  id: "roof",
  title: "Fix roof leak",
  status: "completed",
});
const fence = makeTask({ id: "fence", title: "Paint fence", status: "new" });
const all = [boiler, roof, fence];

const ids = (tasks: ReturnType<typeof makeTask>[]) => tasks.map((t) => t.id);

describe("filterTasks", () => {
  it("returns everything with no query and the 'all' filter", () => {
    expect(ids(filterTasks(all, "", "all"))).toEqual([
      "boiler",
      "roof",
      "fence",
    ]);
  });

  it("matches the title case-insensitively and ignores surrounding spaces", () => {
    expect(ids(filterTasks(all, "  ROOF ", "all"))).toEqual(["roof"]);
  });

  it("filters by status", () => {
    expect(ids(filterTasks(all, "", "new"))).toEqual(["boiler", "fence"]);
  });

  it("combines the query and the status filter", () => {
    expect(ids(filterTasks(all, "fence", "completed"))).toEqual([]);
    expect(ids(filterTasks(all, "fence", "new"))).toEqual(["fence"]);
  });
});
