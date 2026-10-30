/**
 * Lightweight, module-level tracker for tool completion state.
 *
 * Layout.tsx uses this to gate the RatingSection so it only appears after
 * the user has completed their task. Tools call `markToolCompleted(id)`
 * when they produce a result; the Layout re-renders and shows the rating.
 *
 * State resets on navigation (view change) via `resetToolCompletion()`.
 */

let completedTools = new Set<string>();
let listeners: Array<() => void> = [];

export function markToolCompleted(toolId: string): void {
  if (completedTools.has(toolId)) return;
  completedTools = new Set(completedTools);
  completedTools.add(toolId);
  notify();
}

export function isToolCompleted(toolId: string): boolean {
  return completedTools.has(toolId);
}

export function resetToolCompletion(): void {
  if (completedTools.size === 0) return;
  completedTools = new Set();
  notify();
}

export function onToolCompletionChange(fn: () => void): () => void {
  listeners = [...listeners, fn];
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function notify(): void {
  for (const l of listeners) l();
}
