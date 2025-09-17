export type NavKey = "capture" | "summarize" | "explain" | "insights";

export function navigate(to: NavKey) {
  window.dispatchEvent(new CustomEvent<NavKey>("glint-nav", { detail: to }));
}

export function onNavigate(cb: (to: NavKey) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<NavKey>).detail);
  window.addEventListener("glint-nav", handler);
  return () => window.removeEventListener("glint-nav", handler);
}
