import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/i18n/locales/en.json";
import ru from "@/i18n/locales/ru.json";
import uzCyrl from "@/i18n/locales/uz-Cyrl.json";
import uzLatn from "@/i18n/locales/uz-Latn.json";

export const languages = ["en", "ru", "uz-Latn", "uz-Cyrl"] as const;

export type Language = (typeof languages)[number];

export const languageNames: Record<Language, string> = {
  en: "English",
  ru: "Русский",
  "uz-Latn": "O'zbekcha",
  "uz-Cyrl": "Ўзбекча",
};

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  "uz-Latn": { translation: uzLatn },
  "uz-Cyrl": { translation: uzCyrl },
};

export function getDeviceLanguage(): Language {
  for (const locale of getLocales()) {
    if (locale.languageCode === "ru") {
      return "ru";
    }
    if (locale.languageCode === "uz") {
      return locale.languageScriptCode === "Cyrl" ? "uz-Cyrl" : "uz-Latn";
    }
    if (locale.languageCode === "en") {
      return "en";
    }
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
