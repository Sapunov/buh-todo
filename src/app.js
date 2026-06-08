// Основное приложение: неделя, сетка, клетки, сохранение.
(function () {
  const { useState, useEffect, useRef, useCallback } = React;

  const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const STORE_KEY = 'vanya-cal-v2';
  const SET_KEY = 'vanya-cal-settings-v1';
  const PAL = window.ROW_PALETTE;
  const softOf = (c) => (PAL.find((p) => p.c === c) || PAL[0]).soft;

  // ---- даты ----
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const getMonday = (d) => { const x = startOfDay(d); const k = (x.getDay() + 6) % 7; x.setDate(x.getDate() - k); return x; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const keyOf = (d) => { const x = startOfDay(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const weekLabel = (mon) => {
    const end = addDays(mon, 6);
    if (mon.getMonth() === end.getMonth()) return mon.getDate() + '–' + end.getDate() + ' ' + MON[end.getMonth()];
    return mon.getDate() + ' ' + MON[mon.getMonth()] + ' – ' + end.getDate() + ' ' + MON[end.getMonth()];
  };

  // ---- хранилище ----
  const load = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const uid = () => Math.random().toString(36).slice(2, 9);

  const EMOJI_FALLBACK = ['🎉', '⭐', '🚀', '🌟', '✨', '🎈', '🍭', '🦄', '🌈', '💫'];
  const parseEmojis = (str) => {
    if (!str || !str.trim()) return EMOJI_FALLBACK;
    try {
      const seg = new Intl.Segmenter('ru', { granularity: 'grapheme' });
      const out = [...seg.segment(str.trim())].map((s) => s.segment.trim()).filter(Boolean);
      return out.length ? out : EMOJI_FALLBACK;
    } catch (e) {
      const out = Array.from(str.trim()).filter((c) => c.trim());
      return out.length ? out : EMOJI_FALLBACK;
    }
  };

  function isDayComplete(week, day) {
    if (!week || !week.rituals.length) return false;
    return week.rituals.every((r) => week.done[r.id] && week.done[r.id][day]);
  }
  function dayCount(week, day) {
    if (!week) return 0;
    return week.rituals.reduce((n, r) => n + (week.done[r.id] && week.done[r.id][day] ? 1 : 0), 0);
  }

  // ---- звук ----
  let _ac = null;
  const ac = () => { try { _ac = _ac || new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; } catch (e) { return null; } };
  const tone = (f, t0, dur, type, g) => {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), gn = c.createGain();
    o.type = type; o.frequency.value = f;
    o.connect(gn); gn.connect(c.destination);
    const t = c.currentTime + t0;
    gn.gain.setValueAtTime(0, t);
    gn.gain.linearRampToValueAtTime(g, t + 0.02);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  };
  const playDing = () => { tone(660, 0, 0.16, 'sine', 0.14); tone(880, 0.06, 0.2, 'sine', 0.12); };
  const playFanfare = () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.32, 'triangle', 0.12)); };

  // ---- клетка ----
  function Cell({ done, color, icon, onToggle, label, gridColumn, gridRow }) {
    const [anim, setAnim] = useState(false);
    const prev = useRef(done);
    useEffect(() => {
      if (done && !prev.current) { setAnim(true); const t = setTimeout(() => setAnim(false), 620); prev.current = done; return () => clearTimeout(t); }
      prev.current = done;
    }, [done]);
    return React.createElement('button', {
      type: 'button', className: 'cell' + (done ? ' done' : '') + (anim ? ' pop' : ''),
      style: Object.assign({ gridColumn, gridRow }, done ? { background: softOf(color), borderColor: color } : null),
      onClick: onToggle, 'aria-pressed': done, 'aria-label': label,
    }, [
      anim ? React.createElement('span', { key: 'ring', className: 'cell-ring', style: { borderColor: color } }) : null,
      React.createElement('span', { key: 'dot', className: 'cell-dot' }),
      React.createElement('span', { key: 'st', className: 'cell-sticker', style: { color } },
        React.createElement(window.StickerIcon, { name: icon, s: '70%', c: color })),
    ]);
  }

  // ---- приложение ----
  function App() {
    const today = startOfDay(new Date());
    const [weekStart, setWeekStart] = useState(() => getMonday(today));
    const [store, setStore] = useState(() => load(STORE_KEY, { weeks: {} }));
    const [settings, setSettings] = useState(() => ({ fireworks: true, sound: false, big: false, logo: 'rocket', eyebrow: 'космодром', title: 'Ваня', emojis: '🎉⭐🚀🌟✨🎈🍭🦄🌈💫', emojisTask: '🎉⭐🚀🌟✨🎈🍭🦄🌈💫', emojisDay: '🎉⭐🚀🌟✨🎈🍭🦄🌈💫', ...load(SET_KEY, {}) }));
    const [editor, setEditor] = useState(null); // {mode, id, initial}
    const [showSet, setShowSet] = useState(false);
    const gridRef = useRef(null);
    const { Canvas, emojiBurst, emojiFountain } = window.useFireworks();
    const emojiTaskList = parseEmojis(settings.emojisTask ?? settings.emojis);
    const emojiDayList = parseEmojis(settings.emojisDay ?? settings.emojis);

    const key = keyOf(weekStart);
    useEffect(() => { save(STORE_KEY, store); }, [store]);
    useEffect(() => { save(SET_KEY, settings); }, [settings]);

    // Недели стартуют пустыми — материализуются при первом действии
    // (saveRitual / toggle пишут s.weeks[key]). Авто-переноса дел нет:
    // в пустой неделе показываем кнопку «предзаполнить с прошлой недели».
    const week = store.weeks[key] || { rituals: [], done: {} };
    const prevKey = keyOf(addDays(weekStart, -7));
    const prevWeek = store.weeks[prevKey];
    const canPrefill = week.rituals.length === 0 && prevWeek && prevWeek.rituals.length > 0;
    const todayIndex = (() => {
      const diff = Math.round((today - weekStart) / 86400000);
      return diff >= 0 && diff <= 6 ? diff : -1;
    })();

    const celebrate = useCallback(() => {
      if (settings.sound) playFanfare();
      if (!settings.fireworks) return;
      emojiFountain(emojiDayList);
    }, [settings, emojiFountain, emojiDayList]);

    const toggle = (rid, day, ev) => {
      const cellRect = ev && ev.currentTarget ? ev.currentTarget.getBoundingClientRect() : null;
      setStore((s) => {
        const w = s.weeks[key] || { rituals: [], done: {} };
        const before = isDayComplete(w, day);
        const dprev = w.done[rid] || {};
        const becoming = !dprev[day];
        const ndone = { ...w.done, [rid]: { ...dprev } };
        if (ndone[rid][day]) delete ndone[rid][day]; else ndone[rid][day] = true;
        const nweek = { ...w, done: ndone };
        const completes = !before && isDayComplete(nweek, day);
        if (becoming && settings.sound) playDing();
        // фонтанчик у клетки при отметке — но не на тапе, завершающем день (там полноэкранный)
        if (becoming && settings.fireworks && cellRect && !completes) {
          const cx = cellRect.left + cellRect.width / 2;
          const cy = cellRect.top + cellRect.height * 0.4;
          requestAnimationFrame(() => emojiBurst(cx, cy, { emojis: emojiTaskList }));
        }
        if (completes) requestAnimationFrame(() => celebrate());
        return { ...s, weeks: { ...s.weeks, [key]: nweek } };
      });
    };

    const saveRitual = ({ name, color, icon, pos }) => {
      setStore((s) => {
        const w = s.weeks[key] || { rituals: [], done: {} };
        let rituals;
        if (editor.mode === 'edit') {
          rituals = w.rituals.map((r) => (r.id === editor.id ? { ...r, name, color, icon } : r));
          if (typeof pos === 'number') {
            const from = rituals.findIndex((r) => r.id === editor.id);
            const clamped = Math.max(0, Math.min(rituals.length - 1, pos));
            if (from !== -1 && clamped !== from) {
              const [moved] = rituals.splice(from, 1);
              rituals.splice(clamped, 0, moved);
            }
          }
        } else {
          rituals = [...w.rituals, { id: uid(), name, color, icon }];
        }
        return { ...s, weeks: { ...s.weeks, [key]: { ...w, rituals } } };
      });
      setEditor(null);
    };
    const deleteRitual = () => {
      setStore((s) => {
        const w = s.weeks[key]; if (!w) return s;
        const rituals = w.rituals.filter((r) => r.id !== editor.id);
        const done = { ...w.done }; delete done[editor.id];
        return { ...s, weeks: { ...s.weeks, [key]: { rituals, done } } };
      });
      setEditor(null);
    };
    const clearWeek = () => {
      setStore((s) => ({ ...s, weeks: { ...s.weeks, [key]: { ...s.weeks[key], done: {} } } }));
      setShowSet(false);
    };
    const prefillFromPrev = () => {
      setStore((s) => {
        const w = s.weeks[key] || { rituals: [], done: {} };
        if (w.rituals.length) return s;
        const src = s.weeks[prevKey];
        if (!src || !src.rituals.length) return s;
        const rituals = src.rituals.map((r) => ({ id: uid(), name: r.name, color: r.color, icon: r.icon }));
        return { ...s, weeks: { ...s.weeks, [key]: { rituals, done: {} } } };
      });
    };

    const isThisWeek = keyOf(getMonday(today)) === key;
    const todayDone = todayIndex >= 0 ? dayCount(week, todayIndex) : 0;
    const todayFull = todayIndex >= 0 && isDayComplete(week, todayIndex);

    // ---- сетка ----
    const cols = [];
    // слой подсветки колонок
    for (let d = 0; d < 7; d++) {
      const complete = isDayComplete(week, d);
      cols.push(React.createElement('div', {
        key: 'hi' + d, 'data-col': d,
        className: 'colhi' + (d === todayIndex ? ' today' : '') + (complete ? ' complete' : ''),
        style: { gridColumn: d + 2 },
      }));
    }

    const headerCells = [React.createElement('div', { key: 'corner', className: 'corner', style: { gridColumn: 1, gridRow: 1 } })];
    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d);
      const complete = isDayComplete(week, d);
      const count = dayCount(week, d);
      const total = week.rituals.length;
      const showRing = count > 0 && !complete;
      const R = 18, C = 2 * Math.PI * R;
      headerCells.push(React.createElement('div', {
        key: 'wd' + d, className: 'wd' + (d === todayIndex ? ' today' : '') + (complete ? ' done' : ''),
        style: { gridColumn: d + 2, gridRow: 1 },
      }, [
        React.createElement('span', { key: 'n', className: 'wd-name' }, complete ? 'ГОТОВО' : WD[d]),
        React.createElement('span', { key: 'd', className: 'wd-date' }, [
          showRing ? React.createElement('svg', { key: 'ring', className: 'wd-ring', viewBox: '0 0 44 44' }, [
            React.createElement('circle', { key: 't', className: 'wd-ring-track', cx: 22, cy: 22, r: R }),
            React.createElement('circle', {
              key: 'b', className: 'wd-ring-bar', cx: 22, cy: 22, r: R,
              style: { strokeDasharray: C, strokeDashoffset: C * (1 - count / total) },
            }),
          ]) : null,
          React.createElement('span', { key: 'num', className: 'wd-num' }, date.getDate()),
          complete ? React.createElement('span', { key: 'st', className: 'wd-badge' },
            React.createElement(window.StickerIcon, { name: 'star', s: 16, c: '#fff' })) : null,
        ]),
      ]));
    }

    const rows = [];
    week.rituals.forEach((r, ri) => {
      const gr = ri + 2;
      rows.push(React.createElement('button', {
        key: 'lbl' + r.id, type: 'button', className: 'rlabel',
        style: { gridColumn: 1, gridRow: gr },
        onClick: () => setEditor({ mode: 'edit', id: r.id, initial: r, index: ri, count: week.rituals.length }),
      }, [
        React.createElement('span', { key: 'chip', className: 'rchip', style: { background: r.color } },
          React.createElement(window.StickerIcon, { name: r.icon, s: 22, c: '#fff' })),
        React.createElement('span', { key: 'nm', className: 'rname' }, r.name),
        React.createElement('span', { key: 'pen', className: 'rpen' }, '✎'),
      ]));
      for (let d = 0; d < 7; d++) {
        const done = !!(week.done[r.id] && week.done[r.id][d]);
        rows.push(React.createElement(Cell, {
          key: r.id + '-' + d, done, color: r.color, icon: r.icon, gridColumn: d + 2, gridRow: gr,
          label: r.name + ', ' + WD[d], onToggle: (e) => toggle(r.id, d, e),
        }));
      }
    });

    return React.createElement('div', { className: 'app' + (settings.big ? ' big' : '') }, [
      Canvas({ key: 'fx' }),

      // ---- хедер ----
      React.createElement('header', { className: 'top', key: 'top' }, [
        React.createElement('div', { className: 'brand', key: 'br' }, [
          React.createElement('div', { className: 'brand-mark', key: 'm' },
            React.createElement(window.StickerIcon, { name: settings.logo || 'rocket', s: 26, c: '#fff' })),
          React.createElement('div', { className: 'brand-text' + ((settings.eyebrow || '').trim() ? '' : ' no-eyebrow'), key: 'tx' }, [
            (settings.eyebrow || '').trim()
              ? React.createElement('div', { className: 'brand-eyebrow', key: 'e' }, settings.eyebrow)
              : null,
            React.createElement('div', { className: 'brand-title', key: 't' }, settings.title || ''),
          ]),
        ]),

        React.createElement('div', { className: 'weeknav', key: 'wn' }, [
          React.createElement('button', { key: 'p', type: 'button', className: 'navbtn', 'aria-label': 'предыдущая неделя', onClick: () => setWeekStart((w) => addDays(w, -7)) },
            React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' },
              React.createElement('path', { d: 'M15 5l-7 7 7 7', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
          React.createElement('div', { className: 'weekinfo', key: 'wi' }, [
            React.createElement('div', { className: 'weekrange', key: 'r' }, weekLabel(weekStart)),
            React.createElement('div', { className: 'weeknote', key: 'n' }, isThisWeek ? 'эта неделя' : 'другая неделя'),
          ]),
          React.createElement('button', { key: 'n', type: 'button', className: 'navbtn', 'aria-label': 'следующая неделя', onClick: () => setWeekStart((w) => addDays(w, 7)) },
            React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' },
              React.createElement('path', { d: 'M9 5l7 7-7 7', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
        ]),

        React.createElement('div', { className: 'top-right', key: 'tr' }, [
          !isThisWeek ? React.createElement('button', { key: 'td', type: 'button', className: 'today-btn', onClick: () => setWeekStart(getMonday(today)) }, 'Сегодня') : null,
          todayIndex >= 0 && week.rituals.length
            ? React.createElement('div', { key: 'sum', className: 'today-sum' + (todayFull ? ' full' : '') },
                todayFull ? 'Сегодня всё готово!' : ('Сегодня: ' + todayDone + ' из ' + week.rituals.length))
            : null,
          React.createElement('button', { key: 'set', type: 'button', className: 'iconbtn', 'aria-label': 'настройки', onClick: () => setShowSet(true) }, '⚙'),
        ]),
      ]),

      // ---- доска ----
      React.createElement('main', { className: 'board', key: 'board' },
        React.createElement('div', { className: 'grid', ref: gridRef, style: { gridTemplateColumns: 'var(--label-w) repeat(7, minmax(0,1fr))' } }, [
          ...cols,
          ...headerCells,
          ...rows,
          week.rituals.length === 0
            ? React.createElement('div', { key: 'empty', className: 'empty', style: { gridColumn: '1 / -1' } }, [
                React.createElement('div', { className: 'empty-mark', key: 'm' },
                  React.createElement(window.StickerIcon, { name: 'planet', s: 46, c: '#b9b5c6' })),
                React.createElement('div', { className: 'empty-title', key: 't' }, 'Пока пусто'),
                React.createElement('div', { className: 'empty-sub', key: 's' }, 'Добавь первое дело — например «промыть нос»'),
                canPrefill
                  ? React.createElement('button', {
                      key: 'prefill', type: 'button', className: 'addbtn', style: { marginTop: 14 },
                      onClick: prefillFromPrev,
                    }, [
                      React.createElement('span', { key: 'p', className: 'addplus' }, '↺'),
                      React.createElement('span', { key: 't' }, 'Предзаполнить с прошлой недели'),
                    ])
                  : null,
              ])
            : null,
        ])
      ),

      // ---- кнопка добавления ----
      React.createElement('div', { className: 'addbar', key: 'add' },
        React.createElement('button', { type: 'button', className: 'addbtn', onClick: () => setEditor({ mode: 'new', initial: null }) }, [
          React.createElement('span', { key: 'p', className: 'addplus' },
            React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' },
              React.createElement('path', { d: 'M12 5v14M5 12h14', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' }))),
          React.createElement('span', { key: 't' }, 'Добавить дело'),
        ])
      ),

      React.createElement(window.RitualEditor, {
        key: 'ed', open: !!editor, mode: editor?.mode, initial: editor?.initial,
        index: editor?.index, count: editor?.count,
        onSave: saveRitual, onDelete: deleteRitual, onClose: () => setEditor(null),
      }),
      React.createElement(window.SettingsSheet, {
        key: 'st', open: showSet, settings, setSettings, onClearWeek: clearWeek, onClose: () => setShowSet(false),
      }),
    ]);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
