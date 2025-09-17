// App.tsx — minimal capture+OCR UI for AI Screen Helper
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { register, isRegistered } from "@tauri-apps/plugin-global-shortcut";
import Tesseract from "tesseract.js";

export default function App() {
  const [img, setImg] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Ready");

  async function doCapture() {
    try {
      setStatus("Capturing...");
      const b64 = await invoke<string>("capture_primary_screen_png_b64"); // calls your Rust command
      const dataUrl = `data:image/png;base64,${b64}`;
      setImg(dataUrl);

      setStatus("OCR...");
      const r = await Tesseract.recognize(dataUrl, "eng");
      setText(r.data.text.trim());
      setStatus("Done");
    } catch (e: any) {
      setStatus("Error");
      setText("Capture failed: " + String(e));
    }
  }

  useEffect(() => {
    // global hotkey: Ctrl+Shift+S
    (async () => {
      const combo = "Ctrl+Shift+S";
      if (!(await isRegistered(combo))) {
        await register(combo, () => doCapture());
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, color: "#e5e7eb", background: "#0b0f14", minHeight: "100vh" }}>
      <h1 style={{ marginTop: 0 }}>AI Screen Helper (MVP)</h1>
      <p><b>Hotkey:</b> Ctrl + Shift + S</p>
      <button onClick={doCapture} style={{ padding: "10px 14px", borderRadius: 8 }}>Capture Screen</button>

      {img && (
        <>
          <h3 style={{ marginTop: 16 }}>Preview</h3>
          <img src={img} alt="screen" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </>
      )}

      <h3 style={{ marginTop: 16 }}>OCR Text</h3>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={10} style={{ width: "100%" }} />
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={() => navigator.clipboard.writeText(text)}>Copy</button>
        <span style={{ opacity: 0.7 }}>Status: {status}</span>
      </div>
    </div>
  );
}
