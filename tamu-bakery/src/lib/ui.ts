// Make text safe to put inside HTML that we build with JavaScript.
export const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

let timer: number | undefined;

// Small message at the bottom of the screen, e.g. "Added to your cart".
export function toast(message: string) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.dataset.show = "true";
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    el.dataset.show = "false";
  }, 2200);
}
