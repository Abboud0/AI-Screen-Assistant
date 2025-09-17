#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager};

#[cfg(mobile)]
#[tauri::mobile_entry_point]
pub fn run() {
  run_app();
}

#[cfg(not(mobile))]
pub fn run() {
  run_app();
}

fn run_app() {
  tauri::Builder::default()
    // GLOBAL SHORTCUT PLUGIN — required for hotkeys to work in the desktop app
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())

    // If you have other plugins, add them here with more .plugin(...) calls

    // —— COMMANDS ——
    // Make sure you have a commands.rs (or similar) that defines this function:
    //   #[tauri::command]
    //   fn capture_primary_screen_png_b64() -> Result<String, String> { ... }
    .invoke_handler(tauri::generate_handler![
      capture_primary_screen_png_b64
    ])

    .setup(|_app| {
      // If you want to log something at startup, do it here.
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// You can keep this here or in a separate module.
// Stub implementation so this compiles even if your real one lives elsewhere.
// Replace with your existing implementation if you already have it.
#[tauri::command]
fn capture_primary_screen_png_b64() -> Result<String, String> {
  Err("capture_primary_screen_png_b64 not implemented in this stub".into())
}
