import { useState } from "react";
import { quickInsights } from "../lib/ai";

/**
 * AI Insights:
 * - Quick Q&A / idea generator
 * - Keep it cheap & fast now; wire to real backends later
 */
export default function Insights() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onAsk() {
    setErr(null);
    setAnswer("");
    if (!prompt.trim()) {
      setErr("Type a question or request.");
      return;
    }
    setLoading(true);
    try {
      const res = await quickInsights(prompt);
      setAnswer(res);
    } catch (e: any) {
      setErr(e?.message || "Could not get insights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>AI Insights</h2>
      <p className="muted">Ask for quick ideas, tips, or checks.</p>

      <input
        className="input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., Give 3 UI improvements for this screen..."
      />

      <div className="row">
        <button className="primary-btn" onClick={onAsk} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
        <button
          className="ghost-btn"
          onClick={() => {
            setPrompt("");
            setAnswer("");
            setErr(null);
          }}
        >
          Clear
        </button>
      </div>

      {err && <div className="alert error">{err}</div>}
      {answer && (
        <div className="output">
          <h3>Result</h3>
          <pre className="pre">{answer}</pre>
        </div>
      )}
    </div>
  );
}
