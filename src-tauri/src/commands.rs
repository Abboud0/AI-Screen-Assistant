// src-tauri/src/commands.rs
// Minimal, compiling commands for MVP.

// Minimal commands used by the frontend.

use screenshots::Screen;
// Use the image types exported by screenshots to avoid crate mismatches.
use screenshots::image::{DynamicImage, ImageFormat, RgbaImage};
use std::io::Cursor;

use base64::engine::general_purpose::STANDARD as B64;
use base64::Engine;

#[tauri::command]
pub fn capture_primary_screen_png_b64() -> Result<String, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    let screen = screens.first().ok_or("No screens found")?;

    let rgba_img: RgbaImage = screen.capture().map_err(|e| e.to_string())?;

    let mut png_bytes = Vec::new();
    {
        let mut cursor = Cursor::new(&mut png_bytes);
        DynamicImage::ImageRgba8(rgba_img)
            .write_to(&mut cursor, ImageFormat::Png)
            .map_err(|e| e.to_string())?;
    }

    Ok(B64.encode(png_bytes))
}

#[tauri::command]
pub async fn capture_and_ocr() -> Result<String, String> {
    Ok("OCR stub: it works ✅".to_string())
}

#[tauri::command]
pub async fn summarize_server(text: String) -> Result<String, String> {
    let summary = text
        .split(&['.', '!', '?'][..])
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .take(2)
        .collect::<Vec<_>>()
        .join(". ");
    if summary.is_empty() {
        let mut s: String = text.chars().take(200).collect();
        if text.chars().count() > 200 { s.push('…'); }
        Ok(s)
    } else {
        Ok(summary)
    }
}
