import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import i18n from "@/i18n";
import { Task } from "@/types/task";
import { formatTime } from "@/utils/date";
import { getReminderDelay } from "@/utils/reminderDelay";

const CHANNEL_ID = "reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: i18n.t("notifications.channelName"),
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function getNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleTaskReminder(
  task: Task,
  demoMode: boolean,
): Promise<string | undefined> {
  const seconds = getReminderDelay(task.dueAt, demoMode);
  if (seconds === null) {
    return undefined;
  }

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t("notifications.reminderTitle"),
        body: i18n.t("notifications.reminderBody", {
          title: task.title,
          time: formatTime(task.dueAt, i18n.language),
        }),
        data: { taskId: task.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: CHANNEL_ID,
      },
    });
  } catch (error) {
    console.warn("Could not schedule reminder", error);
    return undefined;
  }
}

export async function cancelTaskReminder(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.error("Cancellation error", err);
  }
}
