import { freshState, validState } from "./state.js";
import { getVenue, getPlaces } from "../data/venues.js";
import { integer } from "./format.js";

export class Store extends EventTarget {
  constructor(storage, report) {
    super();
    this.storage = storage;
    this.report = report;
    const saved = storage.read();
    this.state = validState(saved) ? saved : freshState();
    this.state.demoRate ??= 60;
    if (saved && !validState(saved))
      report("Сохранение повреждено. Создан новый учебный город.");
    this.lastTick = Date.now();
    this.lastSave = this.lastTick;
  }
  get mode() {
    return this.state.mode;
  }
  get balance() {
    return this.state.wallets[this.mode];
  }
  get bookings() {
    return this.state.bookings.filter((b) => b.mode === this.mode);
  }
  now(mode = this.mode) {
    return mode === "demo" ? this.state.demoMinutes : Date.now() / 60000;
  }
  changed(save = true) {
    if (save) {
      this.state.updatedAt = Date.now();
      this.storage.write(this.state);
    }
    this.dispatchEvent(new Event("change"));
  }
  setMode(choice) {
    if (!["demo60", "demo360", "real"].includes(choice)) return;
    const nextRate =
      choice === "real" ? this.state.demoRate : Number(choice.slice(4));
    if (nextRate !== this.state.demoRate) {
      for (const key of Object.keys(this.state.schedule)) {
        if (!key.startsWith("demo:")) continue;
        const [, venueId, session] = key.split(":");
        const hasBooking = this.state.bookings.some(
          (booking) =>
            booking.mode === "demo" &&
            booking.venueId === venueId &&
            booking.session === Number(session) &&
            booking.start === this.state.schedule[key],
        );
        if (!hasBooking) delete this.state.schedule[key];
      }
    }
    this.state.mode = choice === "real" ? "real" : "demo";
    this.state.demoRate = nextRate;
    this.changed();
  }
  sessionStart(venueId, session) {
    const key = `${this.mode}:${venueId}:${session}`;
    if (!this.state.schedule[key] || this.state.schedule[key] <= this.now()) {
      const wait = session === 0 ? 20 : venueId === "hotel" ? 1440 : 90;
      const speed = this.mode === "demo" ? this.state.demoRate / 60 : 1;
      this.state.schedule[key] = Math.floor(this.now()) + wait * speed;
    }
    return this.state.schedule[key];
  }
  occupied(venueId, session, start, placeId) {
    return this.bookings.some(
      (b) =>
        b.venueId === venueId &&
        b.session === session &&
        (venueId === "hotel" || b.start === start) &&
        b.places.includes(placeId),
    );
  }
  book({ venueId, session, start, places, quantity, guests, travel }) {
    const venue = getVenue(venueId);
    if (
      !venue ||
      ![0, 1].includes(session) ||
      !Number.isFinite(start) ||
      !places.length
    )
      throw new Error("Сначала выберите хотя бы одно свободное место.");
    if (start <= this.now())
      throw new Error("Это событие уже началось. Выберите новое время.");
    if (this.bookings.length >= 100)
      throw new Error(
        "Достигнут лимит 100 бронирований. Отмените ненужные записи.",
      );
    if (
      !integer(quantity, 1, venue.id === "hotel" ? 30 : 1) ||
      !integer(guests, 1, venue.capacity * places.length) ||
      !integer(travel, 0, 120)
    )
      throw new Error("Проверьте количество гостей, ночей и время в пути.");
    const selected = getPlaces(venue, session).filter((p) =>
      places.includes(p.id),
    );
    if (
      selected.length !== places.length ||
      selected.some(
        (p) => p.occupied || this.occupied(venueId, session, start, p.id),
      )
    )
      throw new Error("Место уже занято. Выберите другое.");
    const total =
      selected.reduce((sum, p) => sum + p.price, 0) * Number(quantity);
    if (total > this.balance)
      throw new Error(
        "Недостаточно средств. Пополните учебный баланс в профиле или выберите другие места.",
      );
    const booking = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `b-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      venueId,
      session,
      start,
      places: [...places],
      quantity: Number(quantity),
      guests: Number(guests),
      travel: Number(travel),
      total,
      mode: this.mode,
      end:
        start +
        (venue.id === "hotel" ? 1440 * Number(quantity) : venue.duration),
      phase: "upcoming",
      minimized: false,
    };
    this.state.wallets[this.mode] -= total;
    this.state.bookings.push(booking);
    this.changed();
    return booking;
  }
  cancel(id) {
    const b = this.bookings.find((b) => b.id === id);
    if (!b) return;
    const cap = this.mode === "demo" ? 100000 : 10000000;
    this.state.wallets[this.mode] = Math.min(cap, this.balance + b.total);
    this.state.bookings = this.state.bookings.filter((item) => item.id !== id);
    this.changed();
  }
  topUp(amount) {
    if (!integer(amount, 100, 100000))
      throw new Error("Введите целую сумму от 100 до 100 000 ₽.");
    const cap = this.mode === "demo" ? 100000 : 10000000;
    this.state.wallets[this.mode] = Math.min(
      cap,
      this.balance + Number(amount),
    );
    this.changed();
  }
  tick() {
    const now = Date.now(),
      elapsed = Math.max(0, (now - this.lastTick) / 1000);
    this.lastTick = now;
    if (this.mode === "demo") {
      this.state.demoMinutes += elapsed * (this.state.demoRate / 60);
      this.state.wallets.demo = Math.min(
        100000,
        this.state.wallets.demo + elapsed * 100,
      );
    }
    for (const b of this.state.bookings) {
      const t = this.now(b.mode);
      const phase =
        t >= b.end
          ? "done"
          : t >= b.start
            ? "active"
            : t >= b.start - b.travel
              ? "travel"
              : "upcoming";
      if (phase !== b.phase) {
        if (phase === "done") this.state.coins += 10;
        b.phase = phase;
        b.minimized = false;
      }
    }
    const save = now - this.lastSave >= 5000;
    if (save) this.lastSave = now;
    this.changed(save);
  }
  reset() {
    this.state = freshState();
    this.lastTick = Date.now();
    this.changed();
  }
}
