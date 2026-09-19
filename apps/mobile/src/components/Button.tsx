import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "@/hooks/useTheme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: ComponentProps<typeof Ionicons>["name"];
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
}: Props) {
  const { colors } = useTheme();

  const background =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
        ? colors.danger
        : colors.card;
  const textColor = variant === "secondary" ? colors.text : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === "secondary" ? colors.border : background,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={textColor} />}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
});
