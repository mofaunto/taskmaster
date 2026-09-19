import { getReminderDelay } from "@/utils/reminderDelay";

const now = new Date("2026-09-15T12:00:00.000Z").getTime();

function dueInMinutes(minutes: number) {
  return new Date(now + minutes * 60 * 1000).toISOString();
}

describe("getReminderDelay", () => {
  it("fires 30 minutes before the due time", () => {
    expect(getReminderDelay(dueInMinutes(90), false, now)).toBe(60 * 60);
  });

  it("falls back to 60 seconds when the due time is less than 30 minutes away", () => {
    expect(getReminderDelay(dueInMinutes(10), false, now)).toBe(60);
  });

  it("falls back to 60 seconds when the reminder time is within the next minute", () => {
    const dueAt = new Date(now + 30.5 * 60 * 1000).toISOString();
    expect(getReminderDelay(dueAt, false, now)).toBe(60);
  });

  it("returns null when the task is already due", () => {
    expect(getReminderDelay(dueInMinutes(-5), false, now)).toBeNull();
    expect(getReminderDelay(dueInMinutes(0), false, now)).toBeNull();
  });

  it("uses the demo delay regardless of the due time", () => {
    expect(getReminderDelay(dueInMinutes(90), true, now)).toBe(30);
    expect(getReminderDelay(dueInMinutes(-5), true, now)).toBe(30);
  });
});
