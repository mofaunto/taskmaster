import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

type Props<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

export function ChoiceList<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  const { colors } = useTheme();

  return (
    <View>
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.row,
              index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.label, { color: colors.text }]}>
              {option.label}
            </Text>
            {selected && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
  },
});
