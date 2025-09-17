import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";

// 🔧 crash guard: show JS errors on screen (and log)
window.addEventListener("error", (e) => {
  console.error("GLOBAL ERROR:", e.error || e.message);
  const div = document.createElement("div");
  div.style.cssText = "position:fixed;inset:8px;z-index:999999;background:#200;color:#fdd;padding:12px;border:1px solid #533;border-radius:8px;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap;";
  div.textContent = `Error: ${e.error?.message || e.message}\n\n${e.error?.stack || ""}`;
  document.body.appendChild(div);
});
window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
  console.error("UNHANDLED REJECTION:", e.reason);
  const div = document.createElement("div");
  div.style.cssText = "position:fixed;inset:8px;z-index:999999;background:#220;color:#ffd;padding:12px;border:1px solid #864;border-radius:8px;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap;";
  div.textContent = `Unhandled: ${e.reason?.message || String(e.reason)}`;
  document.body.appendChild(div);
});

const el = document.getElementById("root");
if (!el) throw new Error("#root not found");
createRoot(el).render(<App />);
