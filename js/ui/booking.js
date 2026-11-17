import { bookingTemplate } from "./booking-template.js";
import { renderPlaces } from "./place-picker.js";
import { getPlaces } from "../data/venues.js";
import { money, eventTime, integer } from "../core/format.js";
import { notify } from "./dialog.js";

export class BookingView {
  constructor(panel, store, venue, onDone, initial = {}) {
    this.panel = panel;
    this.store = store;
    this.venue = venue;
    this.onDone = onDone;
    this.selected = new Set(initial.places ?? []);
    this.session = initial.session ?? 0;
    this.category = "";
    this.maxPrice = "";
    this.start = store.sessionStart(venue.id, this.session);
    this.open();
  }
  open() {
    this.panel.open(
      this.venue.name,
      `${this.venue.type.toUpperCase()}: ПЛАНИРУЕМ ПРИЯТНОЕ`,
      "booking-panel",
    );
    this.panel.content.innerHTML = bookingTemplate;
    this.$ = (selector) => this.panel.content.querySelector(selector);
    this.$(".description").textContent = this.venue.description;
    this.venue.sessions.forEach((name, i) =>
      this.$("#session").append(
        new Option(
          `${name}, ${eventTime(this.store.sessionStart(this.venue.id, i), this.store.mode)}`,
          i,
        ),
      ),
    );
    this.$("#session").value = String(this.session);
    this.venue.zones.forEach((name, i) =>
      this.$("#category").append(new Option(name, i)),
    );
    this.$("#nights-label").hidden = this.venue.id !== "hotel";
    this.$("#session").onchange = (e) => {
      this.session = Number(e.target.value);
      this.start = this.store.sessionStart(this.venue.id, this.session);
      this.selected.clear();
      this.renderPlaces();
    };
    this.$("#category").onchange = (e) => {
      this.category = e.target.value;
      this.filter();
    };
    this.$("#max-price").oninput = (e) => {
      this.maxPrice = e.target.value;
      this.filter();
    };
    this.$("#reset-filters").onclick = () => {
      this.category = "";
      this.maxPrice = "";
      this.$("#category").value = "";
      this.$("#max-price").value = "";
      this.renderPlaces();
    };
    this.$("#booking-form").oninput = () => this.updateTotal();
    this.$("#booking-form").onsubmit = (e) => {
      e.preventDefault();
      this.submit();
    };
    this.onChange = () => {
      this.$("#available-balance").textContent =
        `На балансе: ${money(this.store.balance)}`;
      if (this.start <= this.store.now()) {
        this.start = this.store.sessionStart(this.venue.id, this.session);
        this.selected.clear();
        this.venue.sessions.forEach((name, i) => {
          this.$("#session").options[i].textContent =
            `${name}, ${eventTime(this.store.sessionStart(this.venue.id, i), this.store.mode)}`;
        });
        this.renderPlaces();
        notify(
          "Предыдущее событие началось. Расписание обновлено — выберите места для следующего.",
        );
      }
    };
    this.store.addEventListener("change", this.onChange);
    this.panel.onClose = () =>
      this.store.removeEventListener("change", this.onChange);
    this.renderPlaces();
    this.onChange();
  }
  filtered() {
    return getPlaces(this.venue, this.session).filter(
      (p) =>
        (this.category === "" || p.category === Number(this.category)) &&
        (this.maxPrice === "" ||
          (integer(this.maxPrice, 0, 10000000) &&
            p.price <= Number(this.maxPrice))),
    );
  }
  filter() {
    const visible = this.filtered().map((p) => p.id);
    let removed = false;
    this.selected.forEach((id) => {
      if (!visible.includes(id)) {
        this.selected.delete(id);
        removed = true;
      }
    });
    if (removed) notify("Скрытые фильтром места убраны из выбора.");
    this.renderPlaces();
  }
  renderPlaces() {
    renderPlaces(this);
  }
  toggle(id) {
    const fromList = document.activeElement?.dataset.listPlace;
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
    this.renderPlaces();
    this.$(
      fromList ? `[data-list-place="${id}"]` : `[data-place="${id}"]`,
    )?.focus();
  }
  values() {
    return {
      quantity: this.venue.id === "hotel" ? this.$("#nights").value : 1,
      guests: this.$("#guests").value,
      travel: this.$("#travel").value || 0,
    };
  }
  validate() {
    const v = this.values(),
      capacity = this.venue.capacity * Math.max(1, this.selected.size);
    const errors = {
      guests: integer(v.guests, 1, capacity)
        ? ""
        : `Укажите целое число от 1 до ${capacity}.`,
      nights: integer(v.quantity, 1, 30)
        ? ""
        : "Укажите целое число ночей от 1 до 30.",
      travel:
        !this.$("#travel").validity.badInput && integer(v.travel, 0, 120)
          ? ""
          : "Укажите целые минуты от 0 до 120.",
    };
    Object.entries(errors).forEach(([key, message]) => {
      this.$(`#${key}-error`).textContent = message;
      this.$(`#${key}`).setAttribute("aria-invalid", String(!!message));
    });
    this.$("#guests").max = capacity;
    return !Object.values(errors).some(Boolean);
  }
  updateTotal() {
    const valid = this.validate(),
      { quantity } = this.values();
    const sum = getPlaces(this.venue, this.session)
      .filter((p) => this.selected.has(p.id))
      .reduce((s, p) => s + p.price, 0);
    this.$("#total").textContent = valid ? money(sum * Number(quantity)) : "—";
    this.$("#selection-summary").textContent = this.selected.size
      ? `Выбрано: ${[...this.selected].join(", ")}. ${eventTime(this.start, this.store.mode)}`
      : "Выберите места на схеме";
  }
  submit() {
    this.$("#booking-error").textContent = "";
    if (!this.validate()) {
      this.$('[aria-invalid="true"]')?.focus();
      return;
    }
    try {
      this.store.book({
        venueId: this.venue.id,
        session: this.session,
        start: this.start,
        places: [...this.selected],
        ...this.values(),
      });
      this.$("#confirm-booking").disabled = true;
      notify("Готово! Ваш план сохранён. Хорошего дня в городе.");
      this.onDone();
    } catch (error) {
      this.$("#booking-error").textContent = error.message;
    }
  }
}
