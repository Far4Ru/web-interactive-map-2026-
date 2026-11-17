export const STORAGE_KEY = "quiet-town.v1";

export class Storage {
  constructor(report) {
    this.report = report;
    this.warned = false;
  }
  read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      this.report(
        "Не удалось прочитать сохранение. Город работает в этой вкладке; сохранение можно сбросить в профиле.",
      );
      return null;
    }
  }
  write(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!this.warned)
        this.report(
          "Хранилище недоступно или заполнено. Изменения работают только до закрытия страницы.",
        );
      this.warned = true;
    }
  }
}
