import { el, money } from "../core/format.js";
import { characterMarkup } from "../scene/character.js";
import { notify } from "./dialog.js";

export function openProfile(panel, store, onReset) {
  panel.open("Привет, путешественник!", "ВАШ УГОЛОК В ТИХОМ ГОРОДЕ");
  panel.content.innerHTML = `<div class="profile-intro"><div class="avatar"><div class="character">${characterMarkup()}</div></div><div><h3>Мико и вы</h3><p class="muted">Маленькие прогулки. Хорошие воспоминания.</p><span class="badge">Гость города без регистрации</span></div></div>
    <div class="balance-cards"><div><span class="eyebrow">ДЕМО-БАЛАНС</span><strong id="demo-wallet"></strong><small>+100 ₽/сек., максимум 100 000 ₽</small></div><div><span class="eyebrow">БАЛАНС РЕАЛЬНОГО ВРЕМЕНИ</span><strong id="real-wallet"></strong><small>Учебные средства, до 10 000 000 ₽</small></div></div>
    <p id="profile-coins" class="muted"></p><button id="show-topup">Пополнить текущий баланс</button>
    <div class="reset-section"><div><h3>Начать прогулку заново</h3><p class="muted">Удалить бронирования, сбросить оба баланса и монеты.</p></div><button class="danger-outline" id="reset-demo">Сбросить город</button></div>`;
  const $ = (s) => panel.content.querySelector(s);
  const refresh = () => {
    $("#demo-wallet").textContent = money(store.state.wallets.demo);
    $("#real-wallet").textContent = money(store.state.wallets.real);
    $("#profile-coins").textContent =
      `Монеты: ${store.state.coins}. За каждое завершённое событие — 10 монет. Это сувениры, они не тратятся.`;
  };
  refresh();
  store.addEventListener("change", refresh);
  panel.onClose = () => store.removeEventListener("change", refresh);
  $("#show-topup").onclick = () => openTopUp(panel, store, onReset);
  $("#reset-demo").onclick = () => {
    if (
      !window.confirm(
        "Сбросить весь учебный город? Все бронирования и монеты будут удалены в обоих режимах.",
      )
    )
      return;
    store.reset();
    onReset();
    panel.close();
    notify("Город готов к новой прогулке.");
  };
}

function openTopUp(panel, store, onReset) {
  panel.open("Пополнение баланса", "УЧЕБНЫЕ СРЕДСТВА");
  const mode = store.mode === "demo" ? "демо" : "реального времени";
  panel.content.innerHTML = `<div class="topup-screen"><button id="topup-back" class="text-button" type="button">Назад в профиль</button><p>Баланс режима ${mode}: <strong id="topup-balance"></strong></p><form id="topup-form" class="topup-form" novalidate><label>Сумма пополнения, ₽<input id="topup-amount" type="number" min="100" max="100000" step="1" value="5000" aria-describedby="topup-error"></label><p id="topup-error" class="field-error" role="alert"></p><button class="primary" type="submit">Подтвердить пополнение</button><small class="muted">Это имитация пополнения, настоящие деньги не нужны.</small></form></div>`;
  const $ = (s) => panel.content.querySelector(s);
  const refresh = () => {
    $("#topup-balance").textContent = money(store.balance);
  };
  refresh();
  store.addEventListener("change", refresh);
  panel.onClose = () => store.removeEventListener("change", refresh);
  $("#topup-back").onclick = () => openProfile(panel, store, onReset);
  $("#topup-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      store.topUp($("#topup-amount").value);
      notify("Учебный баланс пополнен.");
      openProfile(panel, store, onReset);
    } catch (error) {
      $("#topup-error").textContent = error.message;
    }
  };
  $("#topup-amount").focus();
}

export function openHelp(panel) {
  panel.open("Маленький путеводитель", "ДОБРО ПОЖАЛОВАТЬ");
  const list = el("ol", "help-list");
  [
    "Гуляйте клавишами влево и вправо или удержанием левой и правой половины экрана. Мико остаётся в центре, город движется вокруг.",
    "Карта (клавиша M) переносит к зданию. Внутри выбирайте места в комнатах; клавиши вверх и вниз ведут к лестнице на другой этаж.",
    "Выберите событие и свободные места. Категория и цена одновременно фильтруют схему и список. Знак × означает, что место занято.",
    "Проверьте гостей, ночи в отеле и время в пути. Подтвердите списание учебных средств. Свои записи можно отменить в «Моих бронированиях».",
    "В демо выберите скорость ×60 или ×360. Баланс растёт на 100 ₽/сек. В реальном времени минута длится минуту; баланс пополняется в профиле. Балансы и бронирования режимов раздельные.",
    "Когда пора выходить, появится напоминание. Его можно свернуть в кнопку с таймером. За завершённое событие вы получите 10 монет.",
    "Tab переключает элементы, Enter или пробел выбирает, Escape закрывает окно. Все места доступны и через список.",
    "Сохранение находится только в этом браузере. Демо-время при закрытой странице не идёт. Сайт не выполняет реальных платежей и записей.",
  ].forEach((text) => list.append(el("li", "", text)));
  panel.content.append(list);
}
