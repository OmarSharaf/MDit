import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, FileText, Folder, FolderPlus, FilePlus, Trash2, Pencil, ExternalLink } from "lucide-react";
import { readDir, createDir, deletePath, renamePath, revealInExplorer, writeTextFile, isBrowserPath, browserRootAvailable, browserWorkspaceDisplayName, browserReconnectFolder } from "../../utils/fileSystem";
import { joinPath } from "../../utils/pathUtils";
import styles from "./WorkspaceTree.module.css";

export interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
}

interface Props {
  rootPath: string;
  onOpenFile: (path: string, name: string) => void;
  onRefresh: () => void;
}

type MenuAction = "newFile" | "newFolder" | "rename" | "delete" | "reveal";

interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNode;
}

async function loadTree(dirPath: string, depth = 0): Promise<TreeNode[]> {
  if (depth > 6) return [];
  const entries = await readDir(dirPath);
  const nodes: TreeNode[] = [];

  for (const e of entries) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "dist") continue;
    if (e.isDir) {
      const children = await loadTree(e.path, depth + 1);
      nodes.push({ name: e.name, path: e.path, isDir: true, children });
    } else if (/\.(md|markdown|txt|mdx)$/i.test(e.name)) {
      nodes.push({ name: e.name, path: e.path, isDir: false });
    }
  }
  return nodes;
}

function ContextMenu({
  menu,
  onClose,
  onAction,
}: {
  menu: ContextMenuState;
  onClose: () => void;
  onAction: (action: MenuAction, node: TreeNode) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  const node = menu.node;

  return createPortal(
    <div
      ref={ref}
      className={styles.ctx}
      style={{ top: menu.y, left: menu.x }}
      role="menu"
    >
      {node.isDir && (
        <>
          <button type="button" onClick={() => onAction("newFile", node)}>
            <FilePlus size={12} /> New file
          </button>
          <button type="button" onClick={() => onAction("newFolder", node)}>
            <FolderPlus size={12} /> New folder
          </button>
        </>
      )}
      <button type="button" onClick={() => onAction("rename", node)}>
        <Pencil size={12} /> Rename
      </button>
      <button type="button" onClick={() => onAction("reveal", node)}>
        <ExternalLink size={12} /> Reveal in Explorer
      </button>
      <button type="button" className={styles.danger} onClick={() => onAction("delete", node)}>
        <Trash2 size={12} /> Delete
      </button>
    </div>,
    document.body
  );
}

function TreeItem({
  node,
  depth,
  onOpenFile,
  onContextMenu,
}: {
  node: TreeNode;
  depth: number;
  onOpenFile: (path: string, name: string) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
}) {
  const [open, setOpen] = useState(depth < 2);

  if (node.isDir) {
    return (
      <div className={styles.branch}>
        <button
          type="button"
          className={styles.row}
          style={{ paddingLeft: 8 + depth * 12 }}
          onClick={() => setOpen((v) => !v)}
          onContextMenu={(e) => onContextMenu(e, node)}
        >
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          <Folder size={11} className={styles.icon} />
          <span className={styles.name}>{node.name}</span>
        </button>
        {open &&
          node.children?.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onOpenFile={onOpenFile}
              onContextMenu={onContextMenu}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.row}
      style={{ paddingLeft: 8 + depth * 12 + 14 }}
      title={node.path}
      onClick={() => onOpenFile(node.path, node.name)}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <FileText size={11} className={styles.icon} />
      <span className={styles.name}>{node.name}</span>
    </button>
  );
}

export function WorkspaceTree({ rootPath, onOpenFile, onRefresh }: Props) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessLost, setAccessLost] = useState(false);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const displayName = browserWorkspaceDisplayName(rootPath);

  const refresh = useCallback(async () => {
    if (isBrowserPath(rootPath) && !browserRootAvailable(rootPath)) {
      setAccessLost(true);
      setTree([]);
      return;
    }
    setAccessLost(false);
    setLoading(true);
    try {
      setTree(await loadTree(rootPath));
      onRefresh();
    } finally {
      setLoading(false);
    }
  }, [rootPath, onRefresh]);

  const reconnect = async () => {
    if (!isBrowserPath(rootPath)) return;
    const ok = await browserReconnectFolder(rootPath);
    if (ok) void refresh();
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (action: MenuAction, node: TreeNode) => {
    setMenu(null);
    if (action === "newFile") {
      const name = prompt("New file name:", "untitled.md");
      if (!name) return;
      const base = node.isDir ? node.path : rootPath;
      await writeTextFile(joinPath(base, name)!, `# ${name.replace(/\.md$/i, "")}\n\n`);
      void refresh();
    }
    if (action === "newFolder") {
      const name = prompt("New folder name:", "docs");
      if (!name) return;
      const base = node.isDir ? node.path : rootPath;
      await createDir(joinPath(base, name)!);
      void refresh();
    }
    if (action === "rename") {
      const name = prompt("Rename to:", node.name);
      if (!name || name === node.name) return;
      const parent = node.path.replace(/[\\/][^\\/]+$/, "");
      await renamePath(node.path, joinPath(parent, name)!);
      void refresh();
    }
    if (action === "delete") {
      if (!confirm(`Delete ${node.name}?`)) return;
      await deletePath(node.path);
      void refresh();
    }
    if (action === "reveal") {
      await revealInExplorer(node.path);
    }
  };

  const openContextMenu = (e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, node });
  };

  return (
    <div className={styles.tree}>
      <div className={styles.toolbar}>
        <span className={styles.root} title={rootPath}>
          {displayName}
        </span>
        <button type="button" className={styles.refresh} onClick={() => void refresh()} disabled={loading}>
          Refresh
        </button>
        <button
          type="button"
          className={styles.refresh}
          onClick={() => void runAction("newFile", { name: "", path: rootPath, isDir: true })}
          title="New file in workspace root"
        >
          <FilePlus size={12} />
        </button>
      </div>
      {accessLost && (
        <div className={styles.empty}>
          <p>Folder access expired. Pick the folder again to browse files.</p>
          <button type="button" className={styles.reconnect} onClick={() => void reconnect()}>
            Reconnect folder
          </button>
        </div>
      )}
      {!accessLost && !loading && tree.length === 0 && (
        <p className={styles.emptyHint}>No markdown files in this folder.</p>
      )}
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          onOpenFile={onOpenFile}
          onContextMenu={openContextMenu}
        />
      ))}
      {menu && (
        <ContextMenu
          menu={menu}
          onClose={() => setMenu(null)}
          onAction={(action, node) => void runAction(action, node)}
        />
      )}
    </div>
  );
}
