import clsx from "clsx";

export type NavKey = "capture" | "summarize" | "explain" | "insights";

const NAV_ITEMS: { key: NavKey; label: string }[] = [
    { key: "capture", label: "Capture" },
    { key: "summarize", label: "Summarize" },
    { key: "explain", label: "Explain" },
    { key: "insights", label: "AI Insights" },
];

export default function Sidebar({
  current,
  onChange,
}: {
  current: NavKey;
  onChange: (k: NavKey) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Glint</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = current === item.key;
        
          const btnClass = clsx("nav-btn", active && "active");

          return (
            <button
              key={item.key}
              className={btnClass}
              onClick={() => onChange(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <small>v0.1.0 • First Edition</small>
      </div>
    </aside>
  );
}