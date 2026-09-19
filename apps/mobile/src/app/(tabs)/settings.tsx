import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { ChoiceList } from "@/components/ChoiceList";
import { OptionSelector } from "@/components/OptionSelector";
import { Section } from "@/components/Section";
import { TextField } from "@/components/TextField";
import { APP_NAME, DEMO_SECONDS, REMINDER_MINUTES } from "@/constants/app";
import { useTheme } from "@/hooks/useTheme";
import { languageNames, languages } from "@/i18n";
import { ping } from "@/services/api";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/services/notifications";
import { syncTasks } from "@/services/sync";
import {
  LanguageSetting,
  ThemeSetting,
  useSettings,
} from "@/store/settingsStore";
import { formatDateTime } from "@/utils/date";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const theme = useSettings((state) => state.theme);
  const setTheme = useSettings((state) => state.setTheme);
  const language = useSettings((state) => state.language);
  const setLanguage = useSettings((state) => state.setLanguage);

  const themeOptions: { label: string; value: ThemeSetting }[] = [
    { label: t("settings.themeSystem"), value: "system" },
    { label: t("settings.themeLight"), value: "light" },
    { label: t("settings.themeDark"), value: "dark" },
  ];

  // Language names stay in their own language, the way every app lists them.
  const languageOptions: { label: string; value: LanguageSetting }[] = [
    { label: t("settings.languageSystem"), value: "system" },
    ...languages.map((code) => ({ label: languageNames[code], value: code })),
  ];
  const demoReminders = useSettings((state) => state.demoReminders);
  const setDemoReminders = useSettings((state) => state.setDemoReminders);
  const apiUrl = useSettings((state) => state.apiUrl);
  const setApiUrl = useSettings((state) => state.setApiUrl);
  const lastSyncAt = useSettings((state) => state.lastSyncAt);

  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<"test" | "sync" | null>(null);

  async function testConnection() {
    setBusy("test");
    try {
      await ping();
      Alert.alert(
        t("settings.connectedTitle"),
        t("settings.connectedMessage"),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.unknownError");
      Alert.alert(t("settings.notConnectedTitle"), message);
    } finally {
      setBusy(null);
    }
  }

  async function syncNow() {
    setBusy("sync");
    const result = await syncTasks();
    setBusy(null);

    if (result.ok) {
      Alert.alert(
        t("sync.successTitle"),
        t("sync.successMessage", {
          sent: result.sent,
          received: result.received,
        }),
      );
    } else {
      Alert.alert(t("sync.failedTitle"), result.error);
    }
  }

  useEffect(() => {
    getNotificationPermission().then((status) =>
      setNotificationsAllowed(status === "granted"),
    );
  }, []);

  async function enableNotifications() {
    const granted = await requestNotificationPermission();
    setNotificationsAllowed(granted);
    if (!granted) {
      // Android only shows the system prompt once; after that the user has to go to Settings.
      Linking.openSettings();
    }
  }

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Section title={t("settings.appearance")}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("settings.theme")}
        </Text>
        <OptionSelector
          options={themeOptions}
          value={theme}
          onChange={setTheme}
        />
      </Section>

      <Section title={t("settings.language")}>
        <ChoiceList
          options={languageOptions}
          value={language}
          onChange={setLanguage}
        />
      </Section>

      <Section title={t("settings.reminders")}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("settings.notifications")}
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {notificationsAllowed === null
                ? t("settings.checking")
                : notificationsAllowed
                  ? t("settings.allowed")
                  : t("settings.notAllowed")}
            </Text>
          </View>
          {notificationsAllowed === false && (
            <Button
              title={t("settings.enable")}
              variant="secondary"
              onPress={enableNotifications}
            />
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("settings.demoMode")}
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {t("settings.demoHint", {
                seconds: DEMO_SECONDS,
                minutes: REMINDER_MINUTES,
              })}
            </Text>
          </View>
          <Switch
            value={demoReminders}
            onValueChange={setDemoReminders}
            trackColor={{ true: colors.primary }}
            accessibilityLabel={t("settings.demoMode")}
          />
        </View>
      </Section>

      <Section title={t("settings.server")}>
        <TextField
          label={t("settings.serverUrl")}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.10:3000"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {t("settings.serverHint", {
            lastSync: lastSyncAt
              ? formatDateTime(lastSyncAt, i18n.language)
              : t("settings.never"),
          })}
        </Text>
        <View style={styles.row}>
          <View style={styles.rowButton}>
            <Button
              title={
                busy === "test"
                  ? t("settings.testing")
                  : t("settings.testConnection")
              }
              variant="secondary"
              onPress={testConnection}
              disabled={busy !== null}
            />
          </View>
          <View style={styles.rowButton}>
            <Button
              title={busy === "sync" ? t("sync.syncing") : t("sync.syncNow")}
              icon="sync-outline"
              onPress={syncNow}
              disabled={busy !== null}
            />
          </View>
        </View>
      </Section>

      <Section title={t("settings.about")}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("settings.app")}
          </Text>
          <Text style={[styles.value, { color: colors.textMuted }]}>
            {APP_NAME}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("settings.version")}
          </Text>
          <Text style={[styles.value, { color: colors.textMuted }]}>
            {version}
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowButton: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  value: {
    fontSize: 16,
  },
});
