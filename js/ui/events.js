import { getVenue } from "../data/venues.js";
import { el, sprite } from "../core/format.js";
import { characterMarkup } from "../scene/character.js";

export class EventTray {
  constructor(store) {
    this.store = store;
    this.root = document.querySelector("#event-tray");
    this.dock = document.querySelector("#event-dock");
    this.signature = "";
  }
  update() {
    const active = this.store.bookings.filter((b) =>
      ["travel", "active"].includes(b.phase),
    );
    const signature = active
      .map((b) => `${b.id}:${b.phase}:${b.minimized}`)
      .join("|");
    if (signature !== this.signature) {
      this.signature = signature;
      this.root.replaceChildren();
      this.dock.replaceChildren();
      active.forEach((b) => {
        const venue = getVenue(b.venueId);
        if (b.minimized) {
          const shortcut = el("div", "event-shortcut");
          const button = el("button", "event-shortcut-button");
          button.type = "button";
          button.title = `${venue.name}: открыть событие`;
          button.setAttribute("aria-label", `${venue.name}: открыть событие`);
          button.append(el("span", "icon icon-ticket"));
          button.onclick = () => {
            b.minimized = false;
            this.store.changed();
          };
          const timer = el("span", "event-timer");
          timer.dataset.timer = b.id;
          shortcut.append(button, timer);
          this.dock.append(shortcut);
          return;
        }
        const card = el("article", "event-card");
        const button = el("button", "event-toggle", "Свернуть −");
        button.onclick = () => {
          b.minimized = !b.minimized;
          this.store.changed();
        };
        const art = el("div", `event-art ${b.phase}`);
        if (b.phase === "travel") {
          art.append(sprite(venue.index));
        } else {
          art.style.backgroundImage = 'url("assets/interiors.webp")';
          art.style.backgroundSize = "400% 200%";
          art.style.backgroundPosition = `${((venue.index % 4) * 100) / 3}% ${Math.floor(venue.index / 4) * 100}%`;
        }
        const character = el(
          "div",
          `character ${b.phase === "travel" ? "walking" : ""}`,
        );
        character.innerHTML = characterMarkup();
        art.append(character);
        card.append(
          art,
          el(
            "small",
            "eyebrow",
            b.phase === "travel" ? "ПОРА В ПУТЬ" : "СОБЫТИЕ НАЧАЛОСЬ",
          ),
          el("h3", "", venue.name),
          el(
            "p",
            "muted",
            b.phase === "travel"
              ? "Мико уже собирается. Не забудьте хорошее настроение!"
              : venue.sessions[b.session],
          ),
        );
        const timer = el("span", "event-timer");
        timer.dataset.timer = b.id;
        card.append(timer, button);
        this.root.append(card);
      });
    }
    active.forEach((b) => {
      const timer = document.querySelector(`[data-timer="${b.id}"]`);
      const remaining = Math.max(
        0,
        Math.ceil((b.phase === "travel" ? b.start : b.end) - this.store.now()),
      );
      if (timer)
        timer.textContent = `${b.phase === "travel" ? "До начала" : "До окончания"}: ${remaining} ${b.mode === "demo" ? "сек." : "мин."}`;
    });
  }
}
