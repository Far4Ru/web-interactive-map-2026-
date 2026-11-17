import { Storage, STORAGE_KEY } from "./core/storage.js";
import { Store } from "./core/store.js";
import { validState } from "./core/state.js";
import { money, time } from "./core/format.js";
import { Panel, notify } from "./ui/dialog.js";
import { Scene } from "./scene/scene.js";
import { openMap } from "./ui/map.js";
import { BookingView } from "./ui/booking.js";
import { openBookings } from "./ui/bookings.js";
import { openProfile, openHelp } from "./ui/profile.js";
import { EventTray } from "./ui/events.js";

const reportStorage = (message) => notify(message, true);
const storage = new Storage(reportStorage),
  store = new Store(storage, reportStorage),
  panel = new Panel();
const book = (venue, places = [], session = 0) =>
  new BookingView(panel, store, venue, () => openBookings(panel, store), {
    places,
    session,
  });
const scene = new Scene(store, panel, book),
  events = new EventTray(store);
const map = () => openMap(panel, scene, book);
document.querySelector("#map-button").onclick = map;
document.querySelector("#bookings-button").onclick = () =>
  openBookings(panel, store);
document.querySelector("#profile-button").onclick = () =>
  openProfile(panel, store, () => {
    scene.leave();
    scene.position = 650;
  });
document.querySelector("#help-button").onclick = () => openHelp(panel);
document.querySelector("#mode").onchange = (e) => {
  store.setMode(e.target.value);
  notify(
    store.mode === "demo"
      ? `Демо ×${store.state.demoRate}: баланс пополняется на 100 ₽ в секунду.`
      : "Реальное время: учебный баланс можно пополнить в профиле.",
  );
};
window.addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() === "m" &&
    !panel.dialog.open &&
    !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)
  ) {
    e.preventDefault();
    map();
  }
});
const render = () => {
  document.querySelector("#balance").textContent = money(store.balance);
  document.querySelector("#coins").textContent = store.state.coins;
  document.querySelector("#mode").value =
    store.mode === "real" ? "real" : `demo${store.state.demoRate}`;
  const now = new Date(),
    minutes =
      store.mode === "demo"
        ? store.state.demoMinutes
        : now.getHours() * 60 + now.getMinutes();
  document.querySelector("#clock").textContent = time(minutes);
  document.querySelector("#booking-count").textContent = store.bookings.length;
  scene.setTime(minutes);
  events.update();
};
store.addEventListener("change", render);
render();
setInterval(() => {
  if (!document.hidden) store.tick();
}, 1000);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    store.changed();
  } else {
    store.lastTick = Date.now();
    store.tick();
  }
});
window.addEventListener("pagehide", () => store.changed());
window.addEventListener("storage", (e) => {
  if (e.key !== STORAGE_KEY || !e.newValue) return;
  try {
    const state = JSON.parse(e.newValue);
    if (validState(state)) {
      store.state = state;
      store.lastTick = Date.now();
      panel.close();
      scene.position = state.position;
      render();
      notify("Город обновлён из другой вкладки. Продолжайте здесь.");
    }
  } catch {
    notify("Не удалось прочитать изменение из другой вкладки.");
  }
});
