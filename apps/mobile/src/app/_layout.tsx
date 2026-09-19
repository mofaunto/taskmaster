import { useLastNotificationResponse } from "expo-notifications";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useLanguage } from "@/hooks/useLanguage";
import { useNetworkSync } from "@/hooks/useNetworkSync";
import { useTheme } from "@/hooks/useTheme";
import { setupNotifications } from "@/services/notifications";
import { useSettings } from "@/store/settingsStore";
import { useTasks } from "@/store/taskStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const settingsReady = useSettings((state) => state.hydrated);
  const tasksReady = useTasks((state) => state.hydrated);
  const hydrated = settingsReady && tasksReady;
  const notificationResponse = useLastNotificationResponse();

  useLanguage();
  useNetworkSync();

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync();
    }
  }, [hydrated]);

  useEffect(() => {
    const taskId =
      notificationResponse?.notification.request.content.data?.taskId;
    if (hydrated && typeof taskId === "string") {
      router.push(`/task/${taskId}`);
    }
  }, [hydrated, notificationResponse, router]);

  if (!hydrated) {
    return null;
  }

  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="task/new" options={{ title: t("screens.newTask") }} />
        <Stack.Screen name="task/[id]/index" options={{ title: t("screens.task") }} />
        <Stack.Screen
          name="task/[id]/edit"
          options={{ title: t("screens.editTask") }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
