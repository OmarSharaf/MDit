export function dirnamePath(filePath: string): string {
  const i = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  return i <= 0 ? filePath : filePath.slice(0, i);
}

export function joinPath(base: string, relative: string): string | null {
  if (!base) return relative;
  const sep = base.includes("\\") ? "\\" : "/";
  const cleaned = relative.replace(/^[/\\]+/, "").replace(/\//g, sep);
  return base.endsWith(sep) ? `${base}${cleaned}` : `${base}${sep}${cleaned}`;
}

export function basenameWithoutExt(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? name;
  return base.replace(/\.(md|markdown|mdx|txt)$/i, "");
}
