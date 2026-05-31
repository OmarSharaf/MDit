import { joinPath } from "./pathUtils";
import { createDir, writeBinaryFile } from "./fileSystem";

export async function saveDroppedImage(
  file: File,
  docPath: string | null,
  workspaceRoot: string | null
): Promise<string> {
  const baseDir = docPath
    ? joinPath(dirname(docPath), "assets") ?? "assets"
    : workspaceRoot
      ? joinPath(workspaceRoot, "assets")
      : null;

  if (!baseDir) {
    return URL.createObjectURL(file);
  }

  await createDir(baseDir);
  const safeName = file.name.replace(/[^\w.-]+/g, "-");
  const dest = joinPath(baseDir, safeName)!;
  const buffer = await file.arrayBuffer();
  await writeBinaryFile(dest, new Uint8Array(buffer));

  if (docPath) {
    const rel = `./assets/${safeName}`;
    return rel;
  }
  return dest;
}

function dirname(p: string): string {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i <= 0 ? p : p.slice(0, i);
}
