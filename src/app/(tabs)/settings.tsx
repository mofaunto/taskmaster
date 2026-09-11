import Constants from "expo-constants";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { OptionSelector } from "@/components/OptionSelector";
import { APP_NAME, CANDIDATE_CODE } from "@/constants/app";
import { useTheme } from "@/hooks/useTheme";
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

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        APPEARANCE
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
        <OptionSelector
          options={themeOptions}
          value={theme}
          onChange={setTheme}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        ABOUT
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
  },
});
