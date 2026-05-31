import { describe, expect, it } from "vitest";
import { basenameWithoutExt, dirnamePath, joinPath } from "./pathUtils";

describe("pathUtils", () => {
  it("dirnamePath handles unix and windows paths", () => {
    expect(dirnamePath("/a/b/c.md")).toBe("/a/b");
    expect(dirnamePath("C:\\proj\\file.md")).toBe("C:\\proj");
    expect(dirnamePath("file.md")).toBe("file.md");
  });

  it("joinPath joins with correct separator", () => {
    expect(joinPath("", "x")).toBe("x");
    expect(joinPath("/root", "sub/file.md")).toBe("/root/sub/file.md");
    expect(joinPath("C:\\root", "sub/file.md")).toBe("C:\\root\\sub\\file.md");
    expect(joinPath("/root/", "file.md")).toBe("/root/file.md");
  });

  it("basenameWithoutExt strips extensions", () => {
    expect(basenameWithoutExt("notes/readme.md")).toBe("readme");
    expect(basenameWithoutExt("doc.MDX")).toBe("doc");
    expect(basenameWithoutExt("plain.txt")).toBe("plain");
  });
});
