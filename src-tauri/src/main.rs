// main.rs
//
// Entry point for the Tauri backend. We import our commands and
// register them so the frontend can `invoke()` them.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{
  capture_primary_screen_png_b64,
  capture_and_ocr,
  summarize_server,
};

fn main() {
  tauri::Builder::default()
    // Install the global-shortcut plugin; JS will register the hotkey.
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    // Expose commands to the frontend.
    .invoke_handler(tauri::generate_handler![
      capture_primary_screen_png_b64,
      capture_and_ocr,
      summarize_server
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
