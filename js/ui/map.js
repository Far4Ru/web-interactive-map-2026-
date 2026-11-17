import { VENUES } from "../data/venues.js";
import { el, sprite } from "../core/format.js";

export function openMap(panel, scene, openBooking) {
  panel.open("Куда отправимся?", "СЕМЬ МЕСТ, ОДИН УЮТНЫЙ ГОРОД", "map-panel");
  const intro = el(
    "p",
    "muted",
    "Выберите здание на карте, чтобы оказаться рядом. Или сразу запланируйте визит.",
  );
  const map = el("div", "town-map");
  const list = el("div", "venue-list");
  VENUES.forEach((venue) => {
    const pin = el("button", "map-pin");
    pin.style.left = `${venue.map[0]}%`;
    pin.style.top = `${venue.map[1]}%`;
    pin.append(sprite(venue.index), el("span", "map-label", venue.name));
    pin.setAttribute(
      "aria-label",
      `${venue.type} «${venue.name}»: переместиться`,
    );
    pin.onclick = () => {
      scene.teleport(venue);
      panel.close();
    };
    map.append(pin);
    const card = el("article", `venue-card ${venue.color}`);
    const text = el("div");
    text.append(el("small", "", venue.type), el("h3", "", venue.name));
    const go = el("button", "text-button", "Прогуляться");
    go.onclick = () => {
      scene.teleport(venue);
      panel.close();
    };
    const book = el("button", "", "Выбрать места");
    book.onclick = () => openBooking(venue);
    card.append(sprite(venue.index), text, go, book);
    list.append(card);
  });
  panel.content.append(intro, map, list);
}
