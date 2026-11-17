export class Panel {
  constructor() {
    this.dialog = document.querySelector("#panel");
    this.content = document.querySelector("#panel-content");
    document.querySelector("#close-panel").onclick = () => this.close();
    this.dialog.addEventListener("click", (e) => {
      if (e.target === this.dialog) {
        const r = this.dialog.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          this.close();
      }
    });
    this.dialog.addEventListener("close", () => {
      this.onClose?.();
      this.onClose = null;
      this.returnFocus?.focus();
    });
  }
  open(title, kicker = "ТИХИЙ ГОРОД", className = "") {
    this.onClose?.();
    this.onClose = null;
    document.querySelector("#panel-title").textContent = title;
    document.querySelector("#panel-kicker").textContent = kicker;
    this.dialog.className = className;
    this.content.replaceChildren();
    if (!this.dialog.open) {
      this.returnFocus = document.activeElement;
      this.dialog.showModal();
    }
    this.content.scrollTop = 0;
  }
  close() {
    this.dialog.close();
  }
}

let toastTimer;
let importantUntil = 0;
export function notify(message, important = false) {
  // Storage failures must remain visible even if the action also reports success.
  if (!important && Date.now() < importantUntil) return;
  if (important) importantUntil = Date.now() + 8000;
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.hidden = false;
  toast.showPopover?.();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidePopover?.();
    toast.hidden = true;
  }, 8000);
}
