import en from "@/i18n/locales/en.json";
import ru from "@/i18n/locales/ru.json";
import uzCyrl from "@/i18n/locales/uz-Cyrl.json";
import uzLatn from "@/i18n/locales/uz-Latn.json";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(tree)) {
    const path = `${prefix}${key}`;
    if (typeof value === "string") {
      flat[path] = value;
    } else {
      Object.assign(flat, flatten(value, `${path}.`));
    }
  }

  return flat;
}

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function baseKey(key: string) {
  return key.replace(PLURAL_SUFFIX, "");
}

function placeholders(text: string) {
  return [...text.matchAll(/{{(\w+)}}/g)].map((match) => match[1]).sort();
}

const english = flatten(en);
const locales = {
  ru: flatten(ru),
  "uz-Latn": flatten(uzLatn),
  "uz-Cyrl": flatten(uzCyrl),
};

describe.each(Object.entries(locales))("%s locale", (_name, locale) => {
  it("translates every key English has", () => {
    const translated = new Set(Object.keys(locale).map(baseKey));
    const missing = Object.keys(english)
      .map(baseKey)
      .filter((key) => !translated.has(key));

    expect([...new Set(missing)]).toEqual([]);
  });

  it("has no keys English does not have", () => {
    const known = new Set(Object.keys(english).map(baseKey));
    const extra = Object.keys(locale)
      .map(baseKey)
      .filter((key) => !known.has(key));

    expect([...new Set(extra)]).toEqual([]);
  });

  it("uses the same placeholders as English", () => {
    const wrong: string[] = [];

    for (const [key, text] of Object.entries(locale)) {
      const source = english[key] ?? english[`${baseKey(key)}_other`];
      if (source && placeholders(source).join() !== placeholders(text).join()) {
        wrong.push(key);
      }
    }

    expect(wrong).toEqual([]);
  });

  it("keeps a plural form for every plural key", () => {
    const pluralBases = new Set(
      Object.keys(english)
        .filter((key) => PLURAL_SUFFIX.test(key))
        .map(baseKey),
    );

    for (const base of pluralBases) {
      expect(locale[`${base}_one`]).toBeDefined();
      expect(locale[`${base}_other`]).toBeDefined();
    }
  });
});
