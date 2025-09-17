// ai.ts — hybrid: Tauri first, fallback to local stubs
import { invoke } from "@tauri-apps/api/core";

// ---- public API used by your pages ----
export async function summarizeText(text: string): Promise<string> {
  return callOrFallback<string>("summarize_server", { text }, async () => {
    await delay(300);
    return naiveSummary(text);
  });
}

export async function explainLikeImFive(text: string): Promise<string> {
  return callOrFallback<string>("explain_server", { text }, async () => {
    await delay(300);
    return naiveExplain(text);
  });
}

export async function quickInsights(prompt: string): Promise<string> {
  return callOrFallback<string>("insights_server", { prompt }, async () => {
    await delay(300);
    return naiveInsights(prompt);
  });
}

// ---- helpers ----
async function callOrFallback<T>(
  cmd: string,
  args: Record<string, unknown>,
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    // if the Tauri command exists, use it
    return await invoke<T>(cmd, args);
  } catch {
    // otherwise use the local fallback
    return await fallback();
  }
}

function naiveSummary(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  return sentences || text.slice(0, 200) + (text.length > 200 ? "..." : "");
}

function naiveExplain(text: string): string {
  return `Imagine you're 10. Here's the idea:\n\n- ${text}\n\nIn simple terms, it means: (1) What is it? (2) Why it matters. (3) One example.`;
}

function naiveInsights(prompt: string): string {
  return `Quick takeaways for: "${prompt}"\n\n• Idea 1\n• Idea 2\n• Idea 3`;
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
