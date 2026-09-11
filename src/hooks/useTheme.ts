import { useColorScheme } from "react-native";

import { darkColors, lightColors } from "@/constants/theme";
import { useSettings } from "@/store/settingsStore";

export function useTheme() {
  const theme = useSettings((state) => state.theme);
  const systemScheme = useColorScheme();

  const isDark =
    theme === "system" ? systemScheme === "dark" : theme === "dark";

  return { colors: isDark ? darkColors : lightColors, isDark };
}
