import { getVenue, getPlaces } from "../data/venues.js";

export const freshState = () => ({
  version: 1,
  mode: "demo",
  demoRate: 60,
  wallets: { demo: 12000, real: 0 },
  coins: 0,
  demoMinutes: 540,
  bookings: [],
  schedule: {},
  position: 650,
  updatedAt: Date.now(),
});

// Saved values are untrusted: validate before using them in either UI or payment.
export function validState(s) {
  if (!s || s.version !== 1 || !["demo", "real"].includes(s.mode)) return false;
  if (s.demoRate !== undefined && ![60, 360].includes(s.demoRate)) return false;
  if (
    !s.wallets ||
    !["demo", "real"].every(
      (m) =>
        Number.isFinite(s.wallets[m]) &&
        s.wallets[m] >= 0 &&
        s.wallets[m] <= (m === "demo" ? 100000 : 10000000),
    )
  )
    return false;
  if (
    !Number.isSafeInteger(s.coins) ||
    s.coins < 0 ||
    !Number.isFinite(s.demoMinutes) ||
    s.demoMinutes < 0 ||
    !Number.isFinite(s.position) ||
    !Number.isFinite(s.updatedAt)
  )
    return false;
  if (
    !s.schedule ||
    typeof s.schedule !== "object" ||
    Array.isArray(s.schedule) ||
    !Object.values(s.schedule).every((v) => Number.isFinite(v) && v >= 0)
  )
    return false;
  if (!Array.isArray(s.bookings) || s.bookings.length > 1000) return false;
  const ids = new Set(),
    occupied = new Set();
  return s.bookings.every((b) => {
    if (!b || typeof b !== "object") return false;
    const v = getVenue(b.venueId);
    if (
      !v ||
      typeof b.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,80}$/.test(b.id) ||
      ids.has(b.id) ||
      !["demo", "real"].includes(b.mode) ||
      ![0, 1].includes(b.session)
    )
      return false;
    ids.add(b.id);
    if (
      !Array.isArray(b.places) ||
      !b.places.length ||
      new Set(b.places).size !== b.places.length ||
      !b.places.every((p) => Number.isInteger(p) && p >= 1 && p <= v.count)
    )
      return false;
    if (
      !Number.isInteger(b.quantity) ||
      b.quantity < 1 ||
      b.quantity > (v.id === "hotel" ? 30 : 1) ||
      !Number.isInteger(b.guests) ||
      b.guests < 1 ||
      b.guests > v.capacity * b.places.length
    )
      return false;
    if (
      !Number.isInteger(b.travel) ||
      b.travel < 0 ||
      b.travel > 120 ||
      !Number.isFinite(b.start) ||
      !Number.isFinite(b.end) ||
      b.end <= b.start ||
      !["upcoming", "travel", "active", "done"].includes(b.phase) ||
      typeof b.minimized !== "boolean"
    )
      return false;
    const places = getPlaces(v, b.session).filter((p) =>
      b.places.includes(p.id),
    );
    if (
      places.some((p) => p.occupied) ||
      b.total !== places.reduce((sum, p) => sum + p.price, 0) * b.quantity
    )
      return false;
    return b.places.every((p) => {
      const key = `${b.mode}:${b.venueId}:${b.session}:${b.start}:${p}`;
      if (occupied.has(key)) return false;
      occupied.add(key);
      return true;
    });
  });
}
