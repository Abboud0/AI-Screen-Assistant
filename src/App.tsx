import { Suspense, lazy, useEffect, useState } from "react";
import { register, unregisterAll, isRegistered } from "@tauri-apps/plugin-global-shortcut";
import "./App.css";
import Sidebar, { NavKey } from "./components/Sidebar";
import TopBar from "./components/TopBar";

// ✅ lazy-load pages so nothing heavy runs before the shell shows
const Capture   = lazy(() => import("./pages/Capture"));
const Summarize = lazy(() => import("./pages/Summarize"));
const Explain   = lazy(() => import("./pages/Explain"));
const Insights  = lazy(() => import("./pages/Insights"));

function SectionView({ current }: { current: NavKey }) {
  switch (current) {
    case "capture":   return <Capture />;
    case "summarize": return <Summarize />;
    case "explain":   return <Explain />;
    case "insights":  return <Insights />;
    default:          return <Capture />;
  }
}

export default function App() {
  const [current, setCurrent] = useState<NavKey>("capture");

  // Global hotkey
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { await unregisterAll().catch(() => {}); } catch {}
      const combos = ["Ctrl+Shift+S", "Ctrl+Alt+S", "Alt+Shift+1"];
      for (const combo of combos) {
        if (!mounted) break;
        try {
          await register(combo, () => {
            if (!mounted) return;
            console.log("🔥 HOTKEY FIRED:", combo);
            window.dispatchEvent(new CustomEvent("glint-capture"));
          });
          const ok = await isRegistered(combo).catch(() => false);
          console.log(`Global hotkey ${combo} registered?`, ok);
          if (ok) break;
        } catch (err) {
          console.warn(`Failed to register ${combo}`, err);
        }
      }
    })();
    return () => { mounted = false; unregisterAll().catch(() => {}); };
  }, []);

  // ✅ allow any page to navigate the app by dispatching "glint-nav"
  useEffect(() => {
    function onNav(e: Event) {
      const detail = (e as CustomEvent).detail as NavKey | undefined;
      if (detail) setCurrent(detail);
    }
    window.addEventListener("glint-nav", onNav as EventListener);
    return () => window.removeEventListener("glint-nav", onNav as EventListener);
  }, []);

  return (
    <div className="app-root">
      <Sidebar current={current} onChange={setCurrent} />
      <div className="app-main">
        <TopBar />
        <div className="app-content">
          <Suspense fallback={<div style={{ opacity: 0.6, padding: 16 }}>Loading…</div>}>
            <SectionView current={current} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
