import { useEffect } from "react";

import i18n, { getDeviceLanguage, Language } from "@/i18n";
import { useSettings } from "@/store/settingsStore";
import { rescheduleAllReminders } from "@/store/taskStore";

export function resolveLanguage(
  setting: ReturnType<typeof useSettings.getState>["language"],
): Language {
  return setting === "system" ? getDeviceLanguage() : setting;
}

export function useLanguage() {
  const language = useSettings((state) => state.language);
  const resolved = resolveLanguage(language);

  useEffect(() => {
    if (i18n.language !== resolved) {
      i18n.changeLanguage(resolved).then(rescheduleAllReminders);
    }
  }, [resolved]);

  return resolved;
}
