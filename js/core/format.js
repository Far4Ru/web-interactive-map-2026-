export const money = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
export const time = (minutes) =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(Math.floor(minutes) % 60).padStart(2, "0")}`;
export const eventTime = (minutes, mode) =>
  mode === "real"
    ? new Date(minutes * 60000).toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : `День ${Math.floor(minutes / 1440) + 1}, ${time(minutes)}`;
export const integer = (value, min, max) =>
  value !== "" &&
  Number.isInteger(Number(value)) &&
  Number(value) >= min &&
  Number(value) <= max;
export const el = (tag, className = "", text = "") =>
  Object.assign(document.createElement(tag), { className, textContent: text });
export function sprite(index, className = "") {
  const node = el("span", `building-art ${className}`);
  node.style.backgroundPosition = `${((index % 4) * 100) / 3}% ${Math.floor(index / 4) * 100}%`;
  node.setAttribute("aria-hidden", "true");
  return node;
}
