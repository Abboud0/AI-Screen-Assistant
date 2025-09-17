import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// IMPORTANT: no top-level import 'tesseract.js'.
// We lazy-load it inside runOCR().

export default function Capture() {
  const [imgB64, setImgB64] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [ocring, setOcring] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const dataUrl = useMemo(
    () => (imgB64 ? `data:image/png;base64,${imgB64}` : ""),
    [imgB64]
  );

  const doCapture = useCallback(async () => {
    setErr(null);
    setBusy(true);
    setImgB64("");
    setText("");
    setOcrProgress(0);
    try {
      const b64 = await invoke<string>("capture_primary_screen_png_b64");
      if (!b64) throw new Error("Empty screenshot");
      setImgB64(b64);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to capture screen");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const onCapture = () => void doCapture();
    window.addEventListener("glint-capture", onCapture as EventListener);
    return () => window.removeEventListener("glint-capture", onCapture as EventListener);
  }, [doCapture]);

  async function runOCR() {
    if (!dataUrl) return;
    setErr(null); setText(""); setOcring(true); setOcrProgress(0);

    try {
      const { default: Tesseract } = await import("tesseract.js");

      // helper to resolve paths in dev/prod (vite base './' in prod)
      const rel = (p: string) => (import.meta.env.DEV ? `/${p}` : `./${p}`);

      const { data } = await Tesseract.recognize(dataUrl, "eng", {
        workerPath: rel("tesseract/worker.min.js"),
        corePath:   rel("tesseract/tesseract-core.wasm.js"),
        langPath:   rel("tesseract"), // looks for eng.traineddata(.gz) here
        logger: (m: any) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      setText((data.text || "").trim());
    } catch (e: any) {
      setErr(e?.message ?? "OCR failed");
    } finally {
      setOcring(false);
    }
  }

  function sendTo(page: "summarize" | "explain") {
  const payload = (text || "").trim();
  if (!payload) {
    setErr("No text extracted yet.");
    return;
  }

  // 1) cache the text so the next page can read it on mount
  try { sessionStorage.setItem("glint:lastText", payload); } catch {}
    (window as any).__GLINT_LAST_TEXT__ = payload;

    // 2) navigate first
    window.dispatchEvent(new CustomEvent("glint-nav", { detail: page }));

    // 3) then emit the event (slight delay for lazy page to mount + attach listeners)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("glint-text", { detail: { text: payload } }));
    }, 50);
  }


  return (
    <div className="page">
      <h2 className="page-title">Capture</h2>

      <div className="actions">
        <button onClick={doCapture} disabled={busy}>
          {busy ? "Capturing…" : "Capture Now"}
        </button>
        <button onClick={() => { setImgB64(""); setText(""); setErr(null); }}>
          Clear
        </button>
        <button onClick={runOCR} disabled={!dataUrl || ocring}>
          {ocring ? `Extracting… ${ocrProgress}%` : "Extract Text"}
        </button>
        <button onClick={() => sendTo("summarize")} disabled={!text.trim()}>
          Send to Summarize
        </button>
        <button onClick={() => sendTo("explain")} disabled={!text.trim()}>
          Send to Explain
        </button>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div className="panel">
        {dataUrl ? (
          <img src={dataUrl} alt="screenshot" style={{ maxWidth: "100%", borderRadius: 8, display: "block" }} />
        ) : (
          <div style={{ opacity: 0.7 }}>No screenshot yet.</div>
        )}
      </div>

      <div className="panel">
        <label className="page-title" style={{ fontSize: 13 }}>Extracted Text</label>
        <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Run Extract Text to populate…" />
      </div>
    </div>
  );
}
