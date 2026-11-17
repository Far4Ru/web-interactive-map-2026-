import { getVenue } from "../data/venues.js";
import { el, sprite, money, eventTime } from "../core/format.js";
import { notify } from "./dialog.js";

export function openBookings(panel, store) {
  panel.open(
    "Мои бронирования",
    store.mode === "demo" ? "ДЕМО: ВАШИ ПЛАНЫ" : "РЕАЛЬНОЕ ВРЕМЯ: ВАШИ ПЛАНЫ",
  );
  if (!store.bookings.length) {
    const empty = el("div", "empty-state");
    empty.append(
      el("span", "empty-symbol", "♡"),
      el("h3", "", "Здесь скоро появятся планы"),
      el(
        "p",
        "muted",
        "Откройте карту, выберите любимое место и запланируйте маленькое приключение.",
      ),
    );
    const go = el("button", "primary", "Открыть карту");
    go.onclick = () => document.querySelector("#map-button").click();
    empty.append(go);
    panel.content.append(empty);
    return;
  }
  const groups = [
    {
      title: "Предстоящие",
      bookings: store.bookings.filter((b) =>
        ["upcoming", "travel"].includes(b.phase),
      ),
    },
    {
      title: "Начавшиеся",
      bookings: store.bookings.filter((b) => b.phase === "active"),
    },
    {
      title: "Завершённые",
      bookings: store.bookings.filter((b) => b.phase === "done"),
    },
  ];
  const createCard = (b) => {
    const venue = getVenue(b.venueId),
      card = el("article", "reservation");
    const info = el("div", "reservation-info");
    info.append(
      el("small", "eyebrow", `№ ${b.id.slice(0, 8).toUpperCase()}`),
      el("h3", "", `${venue.type} «${venue.name}»`),
      el(
        "p",
        "",
        `${venue.sessions[b.session]}. ${eventTime(b.start, b.mode)}`,
      ),
      el(
        "p",
        "muted",
        `Места: ${b.places.join(", ")}. Гостей: ${b.guests}${venue.id === "hotel" ? `. Ночей: ${b.quantity}` : ""}`,
      ),
      el(
        "small",
        "muted",
        `В пути: ${b.travel} мин. ${b.mode === "demo" ? "Демо" : "Учебный баланс / реальное время"}`,
      ),
    );
    const action = el("div", "reservation-action");
    action.append(el("strong", "", money(b.total)));
    const cancel = el("button", "danger-outline", "Отменить бронь");
    cancel.onclick = () => {
      if (
        !window.confirm(
          "Отменить бронь? Места освободятся, сумма вернётся на баланс этого режима (в пределах лимита).",
        )
      )
        return;
      store.cancel(b.id);
      notify("Бронь отменена. Места свободны, средства возвращены.");
      openBookings(panel, store);
    };
    if (b.phase !== "done") action.append(cancel);
    card.append(sprite(venue.index), info, action);
    return card;
  };
  panel.content.append(
    el(
      "p",
      "muted",
      "Показаны записи текущего режима. Отель остаётся забронированным до отмены. Возврат ограничен максимальным балансом режима.",
    ),
    ...groups
      .filter((group) => group.bookings.length)
      .map((group) => {
        const section = el("section", "reservation-group");
        section.append(
          el(
            "h3",
            "reservation-group-title",
            `${group.title} (${group.bookings.length})`,
          ),
        );
        const list = el("div", "reservations");
        [...group.bookings]
          .reverse()
          .forEach((booking) => list.append(createCard(booking)));
        section.append(list);
        return section;
      }),
  );
}
