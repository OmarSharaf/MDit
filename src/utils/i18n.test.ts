import { describe, expect, it } from "vitest";
import { applyLocale, t } from "./i18n";

describe("i18n", () => {
  it("translates keys", () => {
    expect(t("save", "en")).toBe("Save");
    expect(t("save", "ar")).toBe("حفظ");
    expect(t("unknown", "en")).toBe("unknown");
  });

  it("applyLocale sets document attributes", () => {
    applyLocale("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    applyLocale("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });
});
