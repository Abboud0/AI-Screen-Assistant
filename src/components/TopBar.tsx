import { useState } from "react";

/**
 * /simple top bar with a lightweight "status" and a fake connection indicator.
 * next step: wire this to real health checks later
 */
export default function TopBar() {
    const [connected, setConnected] = useState(true);

    return (
        <header className="topbar">
            <div className="topbar-left">
                <span className="status-text">
                    {connected ? "Ready" : "Offline (retrying...)"}
                </span>
            </div>
            <div className="topbar-right">
                <button
                    className="ghost-btn"
                    onClick={() => setConnected((c) => !c)}
                    title="Toggle dummty connection"
                >
                    {connected ? "Go Offline" : "Go Offline"}
                </button>
            </div>
        </header>
    )
}