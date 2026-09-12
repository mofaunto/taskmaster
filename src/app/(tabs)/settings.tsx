import Constants from "expo-constants";
import { useEffect, useState } from "react";
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
import { OptionSelector } from "@/components/OptionSelector";
import { Section } from "@/components/Section";
import { TextField } from "@/components/TextField";
import { APP_NAME, CANDIDATE_CODE, DEMO_SECONDS } from "@/constants/app";
import { useTheme } from "@/hooks/useTheme";
import { ping } from "@/services/api";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/services/notifications";
import { syncTasks } from "@/services/sync";
import { ThemeSetting, useSettings } from "@/store/settingsStore";
import { formatDateTime } from "@/utils/date";

const themeOptions: { label: string; value: ThemeSetting }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const theme = useSettings((state) => state.theme);
  const setTheme = useSettings((state) => state.setTheme);
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
      Alert.alert("Connected", "The server answered.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Not connected", message);
    } finally {
      setBusy(null);
    }
  }

  async function syncNow() {
    setBusy("sync");
    const result = await syncTasks();
    setBusy(null);

    if (result.ok) {
      Alert.alert("Synced", `${result.sent} sent, ${result.received} received.`);
    } else {
      Alert.alert("Sync failed", result.error);
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
      <Section title="Appearance">
        <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
        <OptionSelector
          options={themeOptions}
          value={theme}
          onChange={setTheme}
        />
      </Section>

      <Section title="Reminders">
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>
              Notifications
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {notificationsAllowed === null
                ? "Checking…"
                : notificationsAllowed
                  ? "Allowed"
                  : "Not allowed — reminders will not show"}
            </Text>
          </View>
          {notificationsAllowed === false && (
            <Button title="Enable" variant="secondary" onPress={enableNotifications} />
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>Demo mode</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Reminder fires {DEMO_SECONDS} s after saving a task instead of 30
              min before it is due
            </Text>
          </View>
          <Switch
            value={demoReminders}
            onValueChange={setDemoReminders}
            trackColor={{ true: colors.primary }}
            accessibilityLabel="Demo reminders"
          />
        </View>
      </Section>

      <Section title="Server">
        <TextField
          label="Server URL"
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.10:3000"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Use your computer&apos;s LAN address, not localhost. Last sync:{" "}
          {lastSyncAt ? formatDateTime(lastSyncAt) : "never"}
        </Text>
        <View style={styles.row}>
          <View style={styles.rowButton}>
            <Button
              title={busy === "test" ? "Testing…" : "Test connection"}
              variant="secondary"
              onPress={testConnection}
              disabled={busy !== null}
            />
          </View>
          <View style={styles.rowButton}>
            <Button
              title={busy === "sync" ? "Syncing…" : "Sync now"}
              icon="sync-outline"
              onPress={syncNow}
              disabled={busy !== null}
            />
          </View>
        </View>
      </Section>

      <Section title="About">
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>App</Text>
          <Text style={[styles.value, { color: colors.textMuted }]}>
            {APP_NAME}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Version</Text>
          <Text style={[styles.value, { color: colors.textMuted }]}>
            {version}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            Candidate code
          </Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            {CANDIDATE_CODE}
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
