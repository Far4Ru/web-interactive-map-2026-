export const VENUES = [
  {
    id: "restaurant",
    name: "Крошка",
    type: "Ресторан",
    description:
      "Завтраки весь день, тёплые разговоры и самый вкусный пирог в городе.",
    unit: "стол",
    count: 12,
    columns: 4,
    price: 600,
    capacity: 4,
    duration: 60,
    sessions: ["Завтрак с друзьями", "Ужин под джаз"],
    zones: ["Основной зал", "У окна", "Терраса"],
    map: [17, 23],
    color: "coral",
  },
  {
    id: "hotel",
    name: "Облако",
    type: "Отель",
    description:
      "Уютные номера, мягкие подушки и вид на маленький город. Цена за номер за ночь.",
    unit: "номер",
    count: 12,
    columns: 4,
    price: 1800,
    capacity: 2,
    duration: 720,
    sessions: ["Заезд сегодня", "Заезд завтра"],
    zones: ["Первый этаж", "Второй этаж", "Третий этаж", "Люкс", "Пентхаус"],
    map: [50, 21],
    color: "mint",
  },
  {
    id: "cinema",
    name: "Луна",
    type: "Кинотеатр",
    description:
      "Большой экран, хрустящий попкорн и истории, которые остаются с вами.",
    unit: "место",
    count: 24,
    columns: 6,
    price: 300,
    capacity: 1,
    duration: 90,
    sessions: ["Приключения Мико", "Письма с Луны"],
    zones: ["Стандарт", "Комфорт", "Последний ряд"],
    map: [81, 24],
    color: "lavender",
  },
  {
    id: "theater",
    name: "Бархат",
    type: "Театр",
    description:
      "Сегодня занавес открывается для маленьких чудес. Партер и уютные балконы.",
    unit: "место",
    count: 24,
    columns: 6,
    price: 500,
    capacity: 1,
    duration: 100,
    sessions: ["Сказка о городе", "Вечер импровизаций"],
    zones: ["Партер", "Амфитеатр", "Балкон", "Ложи"],
    map: [15, 57],
    color: "coral",
  },
  {
    id: "stadium",
    name: "Зелёное поле",
    type: "Стадион",
    description:
      "Болейте за свою команду или пойте вместе с городом. Схема зависит от события.",
    unit: "место",
    count: 24,
    columns: 6,
    price: 400,
    capacity: 1,
    duration: 90,
    sessions: ["Матч: Лисы — Мишки", "Концерт на траве"],
    zones: ["Западная трибуна", "Восточная трибуна", "Центральная трибуна"],
    map: [39, 51],
    color: "mint",
  },
  {
    id: "university",
    name: "Росток",
    type: "Университет",
    description:
      "Никогда не поздно узнать что-то новое. Выберите аудиторию для занятия.",
    unit: "аудитория",
    count: 12,
    columns: 4,
    price: 200,
    capacity: 8,
    duration: 60,
    sessions: ["Искусство иллюстрации", "Городское садоводство"],
    zones: ["Библиотека", "Аудитории", "Мастерская", "Оранжерея"],
    map: [65, 55],
    color: "butter",
  },
  {
    id: "hospital",
    name: "Будь здоров",
    type: "Поликлиника",
    description:
      "Заботиться о себе — хорошая привычка. Учебная запись на приём в кабинет.",
    unit: "кабинет",
    count: 8,
    columns: 4,
    price: 700,
    capacity: 1,
    duration: 30,
    sessions: ["Утренний приём", "Дневной приём"],
    zones: [
      "Терапевт, 1 этаж",
      "Офтальмолог, 2 этаж",
      "Педиатр, 3 этаж",
      "Специалисты, 4 этаж",
    ],
    map: [87, 69],
    color: "lavender",
  },
].map((venue, index) => ({ ...venue, index, x: 650 + index * 760 }));

export const getVenue = (id) => VENUES.find((venue) => venue.id === id);

export function getPlaces(venue, session = 0) {
  return Array.from({ length: venue.count }, (_, i) => {
    const category = Math.min(
      venue.zones.length - 1,
      Math.floor((i * venue.zones.length) / venue.count),
    );
    return {
      id: i + 1,
      category,
      label: `${venue.unit} ${i + 1}`,
      capacity: venue.capacity,
      price: Math.round(venue.price * (1 + category * 0.4)),
      zone:
        venue.id === "stadium" && session === 1 && category === 2
          ? "Партер у сцены"
          : venue.zones[category],
      occupied: [2 + session, venue.count - session].includes(i + 1),
    };
  });
}
