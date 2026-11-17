# Иллюстрации

Все изображения созданы встроенным инструментом `image_gen`. Изображения находятся в проекте, внешние запросы при работе сайта не требуются. Используется оригинальный мультяшный стиль с пастельными цветами, тёплым контуром и мишкой Мико; узнаваемые персонажи чужих франшиз не копируются.

В `assets/` оставлены только изображения, которые загружает сайт. Все они в формате **WebP**; прозрачность в атласах сохранена.

| Файл                       | Назначение                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `town.webp`                | Иллюстрация для карточек событий                                                    |
| `town-painted.webp`        | Рисованный фон улицы, согласованный со стилем зданий                                |
| `signs-painted.webp`       | 4 × 2: семь вывесок с названиями и приветственная табличка                          |
| `map.webp`                 | Карта без зданий; кнопки располагаются поверх                                       |
| `buildings-clean.webp`     | 4 × 2: ресторан, отель, кинотеатр, театр, стадион, университет, поликлиника, дерево |
| `interiors.webp`           | Атлас миниатюр интерьеров для карточек событий                                      |
| `interior-restaurant.webp` | Панорама ресторана                                                                  |
| `interior-hotel.webp`      | Панорама отеля                                                                      |
| `interior-cinema.webp`     | Панорама кинотеатра                                                                 |
| `interior-theater.webp`    | Панорама театра                                                                     |
| `interior-stadium.webp`    | Панорама стадиона                                                                   |
| `interior-university.webp` | Панорама университета                                                               |
| `interior-hospital.webp`   | Панорама поликлиники                                                                |
| `interior-stairs.webp`     | Боковой модуль лестницы                                                             |
| `interior-exit.webp`       | Иллюстрация двери выхода из здания                                                  |
| `character.webp`           | 3 × 2: голова, корпус, руки и ноги Мико                                              |
| `icons.webp`               | 3 × 2: карта, билет, монета, профиль, часы, путеводитель                            |

Атласы не рисуются кодом: CSS выбирает прямоугольник готовой картинки. Каждый интерьерный модуль показывает отдельный фрагмент панорамы соответствующего этажа; соседние модули складываются в общую сцену. Шесть частей персонажа соединяются позиционированием; руки слегка качаются, ноги шагают параллельно дорожке.

## Использованные задания генерации

- **Фон:** “Original cozy flat cartoon town park, muted pastel mint, butter yellow, warm cream, terracotta outlines. Side-scrolling game front view. Upper 65% pastel blue sky with fluffy cream clouds, distant low mint hills and small round trees. Bottom 35% grassy ground with a broad horizontal cream walking path. No characters, no text.”
- **Здания:** “Game sprite atlas, 4 columns by 2 rows, 8 equally sized cells. Original charming flat cartoon style, soft muted pastel mint coral butter yellow lavender, rounded dark brown outlines, straight-on front elevation. Restaurant, hotel, cinema, theater; stadium, university, hospital, tree. No text, transparent background.”
- **Уточнение прозрачности:** “Remove the entire white background from this sprite atlas, output true alpha transparency with alpha exactly zero everywhere outside each building/tree. Preserve each of the eight buildings/tree in exactly its original position and dimensions within the 4 column 2 row grid. No shadow, halo or paper.”
- **Персонаж:** “Production 2D game character paper puppet sprite sheet. Exactly 6 separate disconnected body parts in a precise 3 columns x 2 rows grid. Original cute round cream colored little bear traveler, brown ink outline, flat pastel picture book style. Head; mint sweater torso; left arm; right arm; left leg with brown shoe; right leg with brown shoe. Transparent background, no labels.”
- **Карта:** “A cozy flat cartoon illustrated top down town map background. Mint green grassy island, winding butter cream paths, seven empty clearings, small pond, round trees, flowers, little bridge. No buildings, text, people or pins. Clearings at x/y percentages: 20/25, 50/20, 80/25, 15/60, 40/55, 65/60, 85/75.”
- **Интерьеры:** “Production game background atlas, exactly four columns and two rows. Flat pastel cozy cartoon, warm brown outlines, front-facing cutaway interiors. Restaurant rooms; hotel reception and three floors; cinema screen and seats; theater stage and balconies; stadium stands; university classrooms; hospital reception and doctors rooms; park. Empty walking floor, no people or text.”
- **Иконки:** “Tiny UI icon sprite atlas, 3 columns x 2 rows. Original cozy flat cartoon, sage green, butter yellow, terracotta brown outlines. Folded town map; admission ticket; gold coin with flower stamp; cream bear head avatar; analog clock; open guidebook. Transparent background, no labels.”
- **Рисованный фон:** “Wide background for a cozy side-scrolling Russian storybook town game. Warm cream and mint, thin dark brown ink outlines, watercolor texture; distant hills, complete cream clouds, grassy strip and wide beige walking path. No buildings, signs, people or text.”
- **Вывески:** “Transparent 4 × 2 sprite sheet of eight hand-painted storybook town plaques with exact Cyrillic words: Крошка, Облако, Луна, Бархат, Зелёное поле, Росток, Будь здоров, Добро пожаловать! No extra text.”
