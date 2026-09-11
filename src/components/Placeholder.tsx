import { useTheme } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export function Placeholder({ title }: { title: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={styles.hint}>Testing testing!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
    color: "#888",
  },
});
