import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { OptionSelector } from "@/components/OptionSelector";
import { Section } from "@/components/Section";
import { APP_NAME, CANDIDATE_CODE, DEMO_SECONDS } from "@/constants/app";
import { useTheme } from "@/hooks/useTheme";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/services/notifications";
import { ThemeSetting, useSettings } from "@/store/settingsStore";

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

  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean | null>(null);

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
