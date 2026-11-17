export const bookingTemplate = /* HTML */ ` <p class="muted description"></p>
  <div class="booking-layout">
    <section class="selection-area" aria-label="Выбор мест">
      <div class="filters">
        <label>Событие / время<select id="session"></select></label
        ><label
          >Категория<select id="category">
            <option value="">Все категории</option>
          </select></label
        ><label
          >Цена до, ₽<input
            id="max-price"
            type="number"
            min="0"
            step="1"
            placeholder="Любая" /></label
        ><button id="reset-filters" class="text-button">Сбросить</button>
      </div>
      <p class="legend">
        <span>○ Свободно</span><span>✓ Выбрано</span><span>× Занято</span>
      </p>
      <div class="stage-label" id="stage-label"></div>
      <div id="place-grid" class="place-grid"></div>
      <p id="filter-result" class="muted" role="status"></p>
      <details class="place-details">
        <summary>Список всех подходящих мест</summary>
        <div id="place-list" class="place-list"></div>
      </details>
    </section>
    <form id="booking-form" class="booking-summary" novalidate>
      <span class="eyebrow">ВАШ МАЛЕНЬКИЙ ПЛАН</span>
      <h3>Детали бронирования</h3>
      <p id="selection-summary">Выберите места на схеме</p>
      <label
        >Количество гостей<input
          id="guests"
          type="number"
          min="1"
          value="1"
          step="1"
          aria-describedby="guests-error" /><span
          class="field-error"
          id="guests-error"
        ></span
      ></label>
      <label id="nights-label"
        >Количество ночей<input
          id="nights"
          type="number"
          min="1"
          max="30"
          value="1"
          step="1"
          aria-describedby="nights-error" /><span
          class="field-error"
          id="nights-error"
        ></span
      ></label>
      <label
        >Время в пути, минут <small>Необязательно, от 0 до 120</small
        ><input
          id="travel"
          type="number"
          min="0"
          max="120"
          step="1"
          placeholder="0"
          aria-describedby="travel-error" /><span
          class="field-error"
          id="travel-error"
        ></span
      ></label>
      <div class="total"><span>Итого</span><strong id="total">0 ₽</strong></div>
      <p class="muted" id="available-balance"></p>
      <p id="booking-error" class="field-error" role="alert"></p>
      <button class="primary" type="submit" id="confirm-booking">
        Подтвердить и оплатить</button
      ><small class="muted">Только учебный баланс. Без банковской карты.</small>
    </form>
  </div>`;
