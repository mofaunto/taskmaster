import {
  DEMO_SECONDS,
  FALLBACK_SECONDS,
  REMINDER_MINUTES,
} from "@/constants/app";

export function getReminderDelay(
  dueAt: string,
  demoMode: boolean,
  now = Date.now(),
): number | null {
  if (demoMode) {
    return DEMO_SECONDS;
  }

  const due = new Date(dueAt).getTime();
  if (due <= now) {
    return null;
  }

  const secondsUntilReminder =
    (due - REMINDER_MINUTES * 60 * 1000 - now) / 1000;
  return Math.max(Math.round(secondsUntilReminder), FALLBACK_SECONDS);
}
