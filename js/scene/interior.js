import { getPlaces } from "../data/venues.js";
import { el, money } from "../core/format.js";

export function renderInterior(scene) {
  const { venue, world, session } = scene;
  const height = scene.floorHeight();
  const floors = venue.zones.length;
  const shift = Math.max(0, scene.floor - 2) * height;
  const places = getPlaces(venue, session);
  world.replaceChildren(el("div", "ground"));
  world.style.setProperty("--room-width", `${scene.roomWidth()}px`);
  world.style.setProperty("--floor-height", `${height}px`);
  scene.character.style.setProperty("--floor-height", `${height}px`);
  scene.character.style.setProperty("--floor-shift", `${shift}px`);

  for (let floor = 0; floor < floors; floor++) {
    const floorPlaces = places.filter((place) => place.category === floor);
    const width = scene.roomWidth(floor);
    const bottom = `calc(var(--interior-base) + ${floor * height - shift}px)`;
    const panoramaWidth = Math.max(
      floorPlaces.length * width,
      floors * height * 1.5,
    );
    const panoramaOffset = (floorPlaces.length * width - panoramaWidth) / 2;
    floorPlaces.forEach((place, index) => {
      const button = el(
        "button",
        `interior-module ${scene.floor === floor ? "current-floor" : ""}`,
      );
      button.type = "button";
      button.style.width = `${width}px`;
      button.style.left = `${index * width}px`;
      button.style.bottom = bottom;
      button.style.backgroundImage = `url("assets/interior-${venue.id}.webp")`;
      button.style.backgroundSize = `${panoramaWidth}px ${floors * height}px`;
      button.style.backgroundPosition = `${panoramaOffset - index * width}px ${floors === 1 ? 0 : ((floors - 1 - floor) * 100) / (floors - 1)}%`;
      button.dataset.interiorPlace = place.id;
      button.dataset.floor = floor;
      if (index === (venue.id === "university" && floor === 0 ? 1 : 0))
        button.append(
          el(
            "span",
            "module-floor",
            `${floor + 1} этаж: ${venue.zones[floor]}`,
          ),
        );
      const meta = el("span", "module-meta");
      meta.append(
        el("strong", "", `№ ${place.id}`),
        el("small", "", money(place.price)),
        el("span", "place-status"),
      );
      button.append(meta);
      button.onclick = () => {
        scene.selected.has(place.id)
          ? scene.selected.delete(place.id)
          : scene.selected.add(place.id);
        updateInteriorPlaces(scene);
      };
      world.append(button);
      if (venue.id === "university" && floor === 0 && index === 0) {
        const exitDoor = el("button", "exit-door-action");
        exitDoor.type = "button";
        exitDoor.style.left = "0px";
        exitDoor.style.bottom = `calc(var(--interior-base) + ${36 - shift}px)`;
        exitDoor.style.width = `${width}px`;
        exitDoor.style.height = `${height - 36}px`;
        exitDoor.append(el("span", "exit-door-label", "В город"));
        exitDoor.setAttribute("aria-label", "Выйти из здания в город");
        exitDoor.onclick = () => scene.leave();
        world.append(exitDoor);
      }
    });
    const stair = (direction, side, text) => {
      const button = el("button", `stair-tile stair-tile-${side}`);
      button.type = "button";
      button.style.width = `${scene.tileWidth()}px`;
      button.style.left = `${side === "right" ? floorPlaces.length * width : -scene.tileWidth()}px`;
      button.style.bottom = bottom;
      button.append(el("span", "stair-tile-label", text));
      button.disabled = floor !== scene.floor;
      button.setAttribute("aria-label", `${text}, ${floor + 1} этаж`);
      button.onclick = () => scene.takeStairs(direction);
      world.append(button);
    };
    if (floor === 0 && venue.id !== "university") {
      const exit = el("button", "exit-tile");
      exit.type = "button";
      exit.style.width = `${scene.tileWidth()}px`;
      exit.style.left = `${-scene.tileWidth()}px`;
      exit.style.bottom = bottom;
      exit.append(el("span", "stair-tile-label", "В город"));
      exit.setAttribute("aria-label", "Выйти из здания в город");
      exit.onclick = () => scene.leave();
      world.append(exit);
    }
    if (floor > 0) stair(-1, "left", "На этаж ниже");
    if (floor < floors - 1) stair(1, "right", "На этаж выше");
  }
  document.querySelector("#interior-floor-label").textContent =
    `${scene.floor + 1} этаж: ${venue.zones[scene.floor]}`;
  scene.character.style.setProperty("--floor", scene.floor);
  updateInteriorPlaces(scene);
}

export function updateInteriorPlaces(scene) {
  if (!scene.venue) return;
  const start = scene.store.sessionStart(scene.venue.id, scene.session);
  const places = getPlaces(scene.venue, scene.session);
  scene.world.querySelectorAll("[data-interior-place]").forEach((button) => {
    const id = Number(button.dataset.interiorPlace);
    const place = places[id - 1];
    const busy =
      place.occupied ||
      scene.store.occupied(scene.venue.id, scene.session, start, id);
    if (busy) scene.selected.delete(id);
    const selected = scene.selected.has(id);
    button.disabled = busy || Number(button.dataset.floor) !== scene.floor;
    button.classList.toggle("selected", selected);
    button.classList.toggle("busy", busy);
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute(
      "aria-label",
      `${place.label}, ${place.zone}, ${money(place.price)}, ${busy ? "занято" : selected ? "выбрано" : "свободно"}`,
    );
    button.querySelector(".place-status").textContent = busy
      ? "× Занято"
      : selected
        ? "✓ Выбрано"
        : "○ Свободно";
  });
  document.querySelector("#interior-selected-count").textContent =
    scene.selected.size;
}
