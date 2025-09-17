import { useEffect, useRef, useState } from "react";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";

declare global {
  interface Window {
    __GLINT_PROCESSOR__?: (mode: "summarize" | "explain", text: string) => Promise<string> | string;
  }
}

function explainLocal(text: string): string {
  const lines = text.replace(/\s+/g, " ").split(/(?<=[\.!\?])\s+/).filter(Boolean).map(s => s.trim());
  const simplified = lines.map((s, i) => `${i + 1}. ${s}`);
  return ["Here’s a simpler take (local fallback):", "", ...simplified].join("\n");
}

export default function Explain() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const autoRan = useRef(false);

  useEffect(() => {
    let cached = "";
    try { cached = sessionStorage.getItem("glint:lastText") || ""; } catch {}
    if (!cached && (window as any).__GLINT_LAST_TEXT__) {
        cached = String((window as any).__GLINT_LAST_TEXT__);
    }
    if (cached) {
        setInput(cached);
        // if (!autoRan.current) { autoRan.current = true; void runExplain(cached); }
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


  useEffect(() => {
    function onText(e: Event) {
      const detail = (e as CustomEvent).detail as { text?: string } | undefined;
      if (!detail?.text) return;
      setInput(detail.text);
      if (!autoRan.current) { autoRan.current = true; void runExplain(detail.text); }
    }
    window.addEventListener("glint-text", onText as EventListener);
    return () => window.removeEventListener("glint-text", onText as EventListener);
  }, []);

  async function runExplain(text?: string) {
    const source = (text ?? input).trim();
    if (!source) { setErr("Nothing to explain."); return; }
    setErr(null); setLoading(true); setOutput("");
    try {
      if (typeof window.__GLINT_PROCESSOR__ === "function") {
        const res = await window.__GLINT_PROCESSOR__("explain", source);
        setOutput((res ?? "").toString());
      } else {
        setOutput(explainLocal(source));
      }
    } catch (e: any) { setErr(e?.message ?? "Failed to explain."); }
    finally { setLoading(false); }
  }

  async function pasteFromClipboard() {
    try { setInput((await readText()) || ""); }
    catch {
      try { setInput((await navigator.clipboard.readText()) || ""); }
      catch { setErr("Clipboard read blocked."); }
    }
  }

  async function copyOutput() {
    try { await writeText(output); } catch { try { await navigator.clipboard.writeText(output); } catch {} }
  }

  return (
    <div className="page">
      <h2 className="page-title">Explain</h2>

      <div className="actions">
        <button onClick={pasteFromClipboard}>Paste from Clipboard</button>
        <button onClick={() => runExplain()} disabled={loading || !input.trim()}>
          {loading ? "Explaining…" : "Explain"}
        </button>
        <button onClick={() => { setInput(""); setOutput(""); setErr(null); autoRan.current = false; }}>
          Clear
        </button>
        <button onClick={copyOutput} disabled={!output}>Copy Output</button>
      </div>

      <div className="panel">
        <label className="page-title" style={{ fontSize: 13 }}>Input</label>
        <textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste or use Ctrl+Shift+S…" />
      </div>

      <div className="panel">
        <label className="page-title" style={{ fontSize: 13 }}>Explanation</label>
        <textarea rows={10} value={output} readOnly placeholder="Your explanation will appear here…" />
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </div>
  );
}
