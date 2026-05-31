export type Locale = "en" | "ar";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    explorer: "Explorer",
    search: "Search",
    git: "Git",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    import: "Import",
    workspaceSearch: "Search in workspace",
    noResults: "No results",
    snapshotSaved: "Snapshot saved",
    snapshotRestored: "Snapshot restored",
  },
  ar: {
    explorer: "المستكشف",
    search: "بحث",
    git: "Git",
    settings: "الإعدادات",
    save: "حفظ",
    cancel: "إلغاء",
    import: "استيراد",
    workspaceSearch: "بحث في المجلد",
    noResults: "لا نتائج",
    snapshotSaved: "تم حفظ النسخة",
    snapshotRestored: "تم استعادة النسخة",
  },
};

export function t(key: string, locale: Locale = "en"): string {
  return STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
}

export function applyLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}
