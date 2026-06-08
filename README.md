# Космодром Вани — календарь дел

Недельный календарь дел для ребёнка. Весь стейт (дела и настройки) хранится в
`localStorage` браузера — бэкенда нет.

Стек: **Vite + React 18**. Дизайн перенесён из `design/` 1:1 (тот же CSS и тот же код
компонентов на `React.createElement`).

## Разработка

```bash
npm install
npm run dev       # http://localhost:5173
```

## Сборка

```bash
npm run build     # → dist/
npm run preview   # локальный просмотр прод-сборки
```

## Деплой на Vercel

Vercel автоопределяет Vite (framework preset «Vite», build `vite build`, output `dist`),
отдельный конфиг не нужен. Достаточно подключить репозиторий в Vercel UI.

## Структура

- `index.html` — разметка + весь CSS (дизайн).
- `src/main.jsx` — точка входа, грузит модули по порядку.
- `src/setup-globals.js` — кладёт React/ReactDOM в `window` до загрузки компонентов.
- `src/icons.js`, `src/effects.js`, `src/editor.js`, `src/app.js` — компоненты (копии из `design/`).
- `design/` — исходные файлы дизайна и скриншоты-референсы (на сборку не влияют).

Ключи localStorage: `vanya-cal-v2` (недели/дела), `vanya-cal-settings-v1` (настройки).
