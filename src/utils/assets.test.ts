import { describe, expect, it, vi } from "vitest";
import { saveDroppedImage } from "./assets";

vi.mock("./fileSystem", () => ({
  createDir: vi.fn(async () => undefined),
  writeBinaryFile: vi.fn(async () => undefined),
}));

describe("assets", () => {
  it("returns blob url when no base dir", async () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });
    const url = await saveDroppedImage(file, null, null);
    expect(url.startsWith("blob:")).toBe(true);
  });

  it("writes to assets next to doc", async () => {
    const file = new File(["x"], "my photo.png", { type: "image/png" });
    const { writeBinaryFile } = await import("./fileSystem");
    const rel = await saveDroppedImage(file, "/proj/readme.md", null);
    expect(rel).toBe("./assets/my-photo.png");
    expect(writeBinaryFile).toHaveBeenCalled();
  });

  it("writes to workspace assets without doc path", async () => {
    const file = new File(["x"], "pic.png", { type: "image/png" });
    const dest = await saveDroppedImage(file, null, "/workspace");
    expect(dest).toContain("assets");
  });
});
