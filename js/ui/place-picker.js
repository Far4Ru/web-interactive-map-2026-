import { el, money } from "../core/format.js";

export function renderPlaces(view) {
  const grid = view.$("#place-grid"),
    list = view.$("#place-list");
  grid.replaceChildren();
  list.replaceChildren();
  grid.style.setProperty("--columns", view.venue.columns);
  const visible = view.filtered();
  view.$("#stage-label").textContent = {
    cinema: "Э К Р А Н",
    theater: "С Ц Е Н А",
    stadium: view.session ? "КОНЦЕРТНАЯ СЦЕНА" : "ИГРОВОЕ ПОЛЕ",
    hotel: "РЕСЕПШН, НОМЕРА ПО ЭТАЖАМ",
    restaurant: "СТОЛИКИ, ЗАЛЫ И ТЕРРАСА",
    university: "ВХОД, АУДИТОРИИ",
    hospital: "РЕГИСТРАТУРА, КАБИНЕТЫ",
  }[view.venue.id];
  for (const p of visible) {
    const busy =
      p.occupied ||
      view.store.occupied(view.venue.id, view.session, view.start, p.id);
    if (busy) view.selected.delete(p.id);
    const selected = view.selected.has(p.id),
      status = busy ? "× Занято" : selected ? "✓ Выбрано" : "○ Свободно";
    const button = el(
      "button",
      `place category-${p.category}${selected ? " selected" : ""}`,
    );
    button.type = "button";
    button.disabled = busy;
    button.dataset.place = p.id;
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute(
      "aria-label",
      `${p.label}, ${p.zone}, ${money(p.price)}, ${status}`,
    );
    button.append(el("strong", "", String(p.id)), el("small", "", status));
    button.onclick = () => view.toggle(p.id);
    grid.append(button);
    const row = el("button", `place-row${selected ? " selected" : ""}`);
    row.type = "button";
    row.disabled = busy;
    row.dataset.listPlace = p.id;
    row.setAttribute("aria-pressed", String(selected));
    row.append(
      el("span", "", `${p.label}, ${p.zone}`),
      el("strong", "", `${money(p.price)}: ${status}`),
    );
    row.onclick = () => view.toggle(p.id);
    list.append(row);
  }
  view.$("#filter-result").textContent = visible.length
    ? `${visible.length} мест по вашим условиям. Цена указана за ${view.venue.id === "hotel" ? "ночь" : view.venue.unit}.`
    : "Ничего не найдено. Увеличьте цену или сбросьте фильтры.";
  view.updateTotal();
}
