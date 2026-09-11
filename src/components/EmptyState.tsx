import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

type Props = {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  message: string;
};

export function EmptyState({ icon, title, message }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
