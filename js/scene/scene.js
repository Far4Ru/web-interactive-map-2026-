import { VENUES, getPlaces } from "../data/venues.js";
import { el, sprite } from "../core/format.js";
import { renderInterior, updateInteriorPlaces } from "./interior.js";

const TOWN_LENGTH = VENUES.length * 760;

export class Scene {
  constructor(store, panel, onBook) {
    this.store = store;
    this.panel = panel;
    this.onBook = onBook;
    this.root = document.querySelector("#scene");
    this.world = document.querySelector("#world");
    this.landscape = document.querySelector("#landscape");
    this.character = document.querySelector("#character");
    this.position =
      ((store.state.position % TOWN_LENGTH) + TOWN_LENGTH) % TOWN_LENGTH;
    this.direction = 0;
    this.target = null;
    this.venue = null;
    this.floor = 0;
    this.session = 0;
    this.selected = new Set();
    this.last = 0;
    this.renderTown();
    this.bind();
    new ResizeObserver(() => {
      if (!this.venue) return;
      const previous = parseFloat(
        this.world.style.getPropertyValue("--room-width"),
      );
      const previousHeight = parseFloat(
        this.world.style.getPropertyValue("--floor-height"),
      );
      const current = this.roomWidth();
      if (
        previous &&
        (previous !== current || previousHeight !== this.floorHeight())
      ) {
        if (previous !== current) this.position *= current / previous;
        renderInterior(this);
      }
    }).observe(this.root);
    this.store.addEventListener("change", () => {
      if (this.venue) updateInteriorPlaces(this);
    });
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }

  tileWidth() {
    return Math.min(220, Math.max(165, this.root.clientWidth * 0.18));
  }

  roomWidth(floor = this.floor) {
    const minimum = this.tileWidth();
    if (!this.venue) return minimum;
    const count = this.floorPlaces(floor).length;
    return Math.max(
      minimum,
      (this.venue.zones.length * this.floorHeight() * 1.5) / count,
    );
  }

  floorPlaces(floor = this.floor) {
    return getPlaces(this.venue, this.session).filter(
      (place) => place.category === floor,
    );
  }

  floorHeight() {
    return this.root.clientWidth <= 550
      ? 165
      : Math.min(195, Math.max(150, (this.root.clientHeight - 120) / 3));
  }

  renderTown() {
    this.world.replaceChildren();
    this.world.append(el("div", "ground"));
    for (const copy of [-1, 0, 1]) {
      const board = el("button", "noticeboard");
      board.type = "button";
      board.style.left = `${270 + copy * TOWN_LENGTH}px`;
      board.setAttribute(
        "aria-label",
        "Добро пожаловать. Открыть путеводитель",
      );
      board.append(el("span", "noticeboard-sign"));
      board.onclick = () => document.querySelector("#help-button").click();
      this.world.append(board);
      VENUES.forEach((venue) => {
        const button = el("button", "venue");
        button.type = "button";
        button.style.left = `${venue.x + copy * TOWN_LENGTH}px`;
        button.setAttribute(
          "aria-label",
          `${venue.type} «${venue.name}»: войти`,
        );
        const sign = el("span", "venue-sign");
        sign.style.backgroundPosition = `${((venue.index % 4) * 100) / 3}% ${Math.floor(venue.index / 4) * 100}%`;
        button.append(sprite(venue.index), sign);
        button.onclick = () => this.enter(venue);
        this.world.append(button);
      });
    }
  }

  bind() {
    const stop = () => {
      this.direction = 0;
    };
    window.addEventListener("keydown", (event) => {
      if (
        this.panel.dialog.open ||
        /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)
      )
        return;
      if (this.venue && ["ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        if (!event.repeat) this.takeStairs(event.key === "ArrowUp" ? 1 : -1);
        return;
      }
      if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        this.target = null;
        this.pendingFloor = undefined;
        this.direction = event.key === "ArrowLeft" ? -1 : 1;
      }
    });
    window.addEventListener("keyup", (event) => {
      if (["ArrowLeft", "ArrowRight"].includes(event.key)) stop();
    });
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    this.root.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, a, input, select")) return;
      if (event.pointerType === "touch") {
        this.target = null;
        this.pendingFloor = undefined;
        this.direction = event.clientX < this.root.clientWidth / 2 ? -1 : 1;
        this.root.setPointerCapture(event.pointerId);
      } else {
        this.target = this.position + event.clientX - this.root.clientWidth / 2;
        this.pendingFloor = undefined;
      }
    });
    this.root.addEventListener("pointerup", stop);
    this.root.addEventListener("pointercancel", stop);
    for (const [id, direction] of [
      ["#move-left", -1],
      ["#move-right", 1],
    ]) {
      const button = document.querySelector(id);
      let pressedAt = 0;
      let startPosition = 0;
      button.addEventListener("pointerdown", (event) => {
        if (!this.venue || this.panel.dialog.open) return;
        pressedAt = performance.now();
        startPosition = this.position;
        this.target = null;
        this.pendingFloor = undefined;
        this.direction = direction;
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener("pointerup", () => {
        const tapped =
          performance.now() - pressedAt < 180 &&
          Math.abs(this.position - startPosition) < 30;
        this.direction = 0;
        if (tapped) this.moveStep(direction);
      });
      button.addEventListener("pointercancel", stop);
      button.addEventListener("lostpointercapture", stop);
      button.addEventListener("click", (event) => {
        if (event.detail === 0) this.moveStep(direction);
      });
    }
    document.querySelector("#leave-building").onclick = () => this.leave();
    document.querySelector("#open-booking").onclick = () =>
      this.onBook(this.venue, [...this.selected], this.session);
    document.querySelector("#interior-session").onchange = (event) => {
      this.session = Number(event.target.value);
      this.selected.clear();
      renderInterior(this);
    };
  }

  moveStep(direction) {
    if (!this.venue || this.panel.dialog.open) return;
    this.pendingFloor = undefined;
    this.direction = 0;
    this.target =
      this.position + direction * Math.min(180, this.roomWidth() * 0.6);
  }

  teleport(venue) {
    if (this.venue) this.leave();
    this.position = venue.x;
    this.target = null;
    this.direction = 0;
    this.update();
  }

  enter(venue) {
    this.outsidePosition = venue.x;
    this.venue = venue;
    this.floor = 0;
    this.session = 0;
    this.selected.clear();
    this.position = this.roomWidth() * 0.5;
    this.target = null;
    this.pendingFloor = undefined;
    this.direction = 0;
    this.root.classList.add("inside");
    const session = document.querySelector("#interior-session");
    session.replaceChildren(
      ...venue.sessions.map((name, index) => new Option(name, index)),
    );
    document.querySelector("#interior-title").textContent =
      `${venue.type} «${venue.name}»`;
    document.querySelector("#interior-toolbar").hidden = false;
    document.querySelector("#interior-actions").hidden = false;
    document.querySelector("#interior-controls").hidden = false;
    renderInterior(this);
    this.update();
  }

  leave() {
    if (!this.venue) return;
    this.venue = null;
    this.selected.clear();
    this.position = this.outsidePosition ?? 650;
    this.target = null;
    this.pendingFloor = undefined;
    this.root.classList.remove("inside");
    document.querySelector("#interior-toolbar").hidden = true;
    document.querySelector("#interior-actions").hidden = true;
    document.querySelector("#interior-controls").hidden = true;
    this.renderTown();
    this.update();
  }

  takeStairs(direction) {
    if (
      !this.venue ||
      this.floor + direction < 0 ||
      this.floor + direction >= this.venue.zones.length
    )
      return;
    this.pendingFloor = this.floor + direction;
    this.stairsDirection = direction;
    this.target =
      direction > 0
        ? this.floorPlaces().length * this.roomWidth() + this.tileWidth() * 0.5
        : -this.tileWidth() * 0.5;
    this.direction = 0;
  }

  frame(timestamp) {
    const delta = Math.min((timestamp - this.last) / 1000 || 0, 0.05);
    this.last = timestamp;
    let direction = this.direction;
    if (this.target !== null) {
      direction = Math.sign(this.target - this.position);
      if (Math.abs(this.target - this.position) < 6) {
        this.target = null;
        direction = 0;
        if (this.pendingFloor !== undefined) {
          this.floor = this.pendingFloor;
          this.pendingFloor = undefined;
          this.position =
            this.stairsDirection > 0
              ? this.roomWidth() * 0.5
              : (this.floorPlaces().length - 0.5) * this.roomWidth();
          renderInterior(this);
        }
      }
    }
    if (this.panel.dialog.open || document.hidden) direction = 0;
    const next = this.venue
      ? Math.max(
          -this.tileWidth() * 0.55,
          Math.min(
            this.roomWidth() * this.floorPlaces().length +
              this.tileWidth() * 0.55,
            this.position + direction * delta * 310,
          ),
        )
      : (this.position + direction * delta * 310 + TOWN_LENGTH) % TOWN_LENGTH;
    const moving = next !== this.position;
    this.character.classList.toggle("walking", moving);
    if (direction) this.character.style.setProperty("--facing", direction);
    if (!moving && direction && !this.panel.dialog.open) this.target = null;
    this.position = next;
    if (
      !this.venue &&
      this.target !== null &&
      Math.abs(this.target - this.position) > TOWN_LENGTH / 2
    ) {
      this.target += this.target < this.position ? TOWN_LENGTH : -TOWN_LENGTH;
    }
    this.update();
    requestAnimationFrame(this.frame);
  }

  update() {
    this.root.scrollLeft = 0;
    this.root.scrollTop = 0;
    const key = `${this.position}:${this.root.clientWidth}:${this.root.clientHeight}:${this.venue?.id ?? "town"}`;
    if (key === this.renderKey) return;
    this.renderKey = key;
    this.world.style.transform = `translateX(${this.root.clientWidth / 2 - this.position}px)`;
    this.landscape.style.backgroundPositionX = `${-this.position * 0.12}px`;
    this.character.style.setProperty("--floor", this.venue ? this.floor : 0);
    if (!this.venue) this.store.state.position = this.position;
  }

  setTime(minutes) {
    this.root.classList.toggle(
      "night",
      minutes % 1440 < 420 || minutes % 1440 >= 1200,
    );
  }
}
