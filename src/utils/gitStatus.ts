export interface GitFileStatus {
  path: string;
  status: string;
}

export interface GitRepoStatus {
  branch: string;
  clean: boolean;
  files: GitFileStatus[];
  available: boolean;
  error?: string;
}

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function getGitRepoStatus(repoPath: string): Promise<GitRepoStatus> {
  if (!repoPath) {
    return { branch: "", clean: true, files: [], available: false, error: "No workspace" };
  }
  if (!isTauri()) {
    return {
      branch: "",
      clean: true,
      files: [],
      available: false,
      error: "Git is available in the MDit desktop app only.",
    };
  }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<GitRepoStatus>("git_repo_status", { repoPath });
  } catch {
    return {
      branch: "",
      clean: true,
      files: [],
      available: false,
      error: "Git is not installed or this folder is not a repository.",
    };
  }
}
