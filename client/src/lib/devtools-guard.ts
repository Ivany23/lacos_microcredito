/**
 * DevTools Guard — Anti-Debugging Protection
 * 
 * Prevents casual users from inspecting the app via Chrome DevTools.
 * Only active in PRODUCTION and can be disabled via Dev Mode Secret.
 * 
 * Protections:
 * - Blocks F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U keyboard shortcuts
 * - Blocks right-click context menu (Inspect Element)
 * 
 * NOT active when:
 * - Running on localhost (development)
 * - Dev mode is activated (?dev_debug=lacos2024 or localStorage)
 */
import { isDevMode } from "./api.config";

/**
 * Key combinations that open DevTools or view source
 */
const BLOCKED_KEYS: Array<{ key: string; ctrl?: boolean; shift?: boolean }> = [
  { key: "F12" },
  { key: "I", ctrl: true, shift: true },   // Ctrl+Shift+I → DevTools
  { key: "J", ctrl: true, shift: true },   // Ctrl+Shift+J → Console
  { key: "C", ctrl: true, shift: true },   // Ctrl+Shift+C → Inspect
  { key: "U", ctrl: true },                // Ctrl+U → View Source
];

/**
 * Check if a keyboard event matches a blocked combination
 */
function isBlockedKey(e: KeyboardEvent): boolean {
  return BLOCKED_KEYS.some((combo) => {
    const keyMatch = e.key === combo.key || e.key === combo.key.toLowerCase();
    const ctrlMatch = combo.ctrl ? e.ctrlKey || e.metaKey : true;
    const shiftMatch = combo.shift ? e.shiftKey : true;
    return keyMatch && ctrlMatch && shiftMatch;
  });
}

/**
 * Initialize DevTools protection.
 * Call this once at app startup (in main.tsx).
 */
export function initDevToolsGuard(): void {
  // Never block in dev mode
  if (isDevMode()) {
    return;
  }

  // Block keyboard shortcuts
  document.addEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      if (isBlockedKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true // capture phase
  );

  // Block right-click context menu
  document.addEventListener(
    "contextmenu",
    (e: MouseEvent) => {
      e.preventDefault();
      return false;
    },
    true
  );
}
