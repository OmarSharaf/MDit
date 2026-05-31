use std::path::Path;
use tauri::Manager;

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_binary_file(path: String, contents: Vec<u8>) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_dir(path: String) -> Result<(), String> {
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_path(path: String) -> Result<(), String> {
    let meta = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    if meta.is_dir() {
        std::fs::remove_dir_all(&path).map_err(|e| e.to_string())
    } else {
        std::fs::remove_file(&path).map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn rename_path(from: String, to: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&to).parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::rename(&from, &to).map_err(|e| e.to_string())
}

#[tauri::command]
async fn copy_file(from: String, to: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&to).parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::copy(&from, &to).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn file_info(path: String) -> Result<serde_json::Value, String> {
    let meta = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    let modified = meta
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);

    Ok(serde_json::json!({
        "size": meta.len(),
        "modified": modified,
        "is_file": meta.is_file(),
        "is_dir": meta.is_dir(),
    }))
}

#[tauri::command]
async fn list_dir(path: String) -> Result<Vec<serde_json::Value>, String> {
    let entries = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
        let path_str = entry.path().to_string_lossy().to_string();
        files.push(serde_json::json!({
            "name": name,
            "path": path_str,
            "is_dir": is_dir,
        }));
    }
    files.sort_by(|a, b| {
        let a_dir = a["is_dir"].as_bool().unwrap_or(false);
        let b_dir = b["is_dir"].as_bool().unwrap_or(false);
        b_dir.cmp(&a_dir).then(
            a["name"]
                .as_str()
                .unwrap_or("")
                .cmp(b["name"].as_str().unwrap_or("")),
        )
    });
    Ok(files)
}

fn should_skip(name: &str) -> bool {
    name.starts_with('.') || name == "node_modules" || name == "dist" || name == "target"
}

fn search_dir(
    root: &Path,
    query: &str,
    extensions: &[String],
    results: &mut Vec<serde_json::Value>,
    limit: usize,
) {
    if results.len() >= limit {
        return;
    }
    let entries = match std::fs::read_dir(root) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        if results.len() >= limit {
            break;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        if should_skip(&name) {
            continue;
        }
        let path = entry.path();
        let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
        if is_dir {
            search_dir(&path, query, extensions, results, limit);
            continue;
        }
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        if !extensions.is_empty() && !extensions.iter().any(|e| e.eq_ignore_ascii_case(&ext)) {
            continue;
        }
        let content = match std::fs::read_to_string(&path) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let query_lower = query.to_lowercase();
        for (i, line) in content.lines().enumerate() {
            if results.len() >= limit {
                break;
            }
            if line.to_lowercase().contains(&query_lower) {
                let col = line.to_lowercase().find(&query_lower).unwrap_or(0) + 1;
                results.push(serde_json::json!({
                    "path": path.to_string_lossy(),
                    "name": name,
                    "line": i + 1,
                    "column": col,
                    "excerpt": line.trim().chars().take(120).collect::<String>(),
                }));
            }
        }
    }
}

#[tauri::command]
async fn search_in_directory(
    root: String,
    query: String,
    extensions: Vec<String>,
) -> Result<Vec<serde_json::Value>, String> {
    let mut results = Vec::new();
    search_dir(Path::new(&root), &query, &extensions, &mut results, 200);
    Ok(results)
}

#[tauri::command]
async fn git_repo_status(repo_path: String) -> Result<serde_json::Value, String> {
    use std::process::Command;

    let branch = Command::new("git")
        .args(["-C", &repo_path, "rev-parse", "--abbrev-ref", "HEAD"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .unwrap_or_else(|| "unknown".to_string());

    let status = Command::new("git")
        .args(["-C", &repo_path, "status", "--porcelain"])
        .output()
        .map_err(|e| e.to_string())?;

    if !status.status.success() {
        return Ok(serde_json::json!({
            "branch": branch,
            "clean": true,
            "files": [],
            "available": false,
            "error": "Not a git repository or git unavailable"
        }));
    }

    let stdout = String::from_utf8_lossy(&status.stdout);
    let mut files = Vec::new();
    for line in stdout.lines() {
        if line.len() < 4 {
            continue;
        }
        let code = line[..2].trim();
        let path = line[3..].trim();
        files.push(serde_json::json!({
            "path": path,
            "status": code,
        }));
    }

    Ok(serde_json::json!({
        "branch": branch,
        "clean": files.is_empty(),
        "files": files,
        "available": true
    }))
}

#[tauri::command]
async fn reveal_in_explorer(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &path.replace('/', "\\")])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        if let Some(parent) = Path::new(&path).parent() {
            std::process::Command::new("xdg-open")
                .arg(parent)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn watch_file_mtime(path: String, last_mtime: u64) -> Result<serde_json::Value, String> {
    let meta = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    let modified = meta
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);
    Ok(serde_json::json!({
        "modified": modified,
        "changed": modified > last_mtime
    }))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "windows")]
            {
                window.set_decorations(false)?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            write_binary_file,
            create_dir,
            delete_path,
            rename_path,
            copy_file,
            file_info,
            list_dir,
            search_in_directory,
            git_repo_status,
            reveal_in_explorer,
            watch_file_mtime,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
