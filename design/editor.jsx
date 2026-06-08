// Нижние шторки: редактор ритуала и настройки.
(function () {
  const ROW_PALETTE = [
    { c: '#5B8DEF', soft: '#E7EEFC' },
    { c: '#EF7E5B', soft: '#FCEAE2' },
    { c: '#4FB286', soft: '#E1F3EB' },
    { c: '#8A78E0', soft: '#ECE8FB' },
    { c: '#E8B23E', soft: '#FBF1D6' },
    { c: '#E08AB0', soft: '#FBE8F1' },
    { c: '#3FB0C4', soft: '#DEF2F5' },
  ];

  function Sheet({ open, onClose, children, labelledBy }) {
    return React.createElement(
      'div',
      { className: 'sheet-wrap' + (open ? ' open' : ''), 'aria-hidden': !open },
      [
        React.createElement('div', { className: 'sheet-scrim', onClick: onClose, key: 'scrim' }),
        React.createElement(
          'div',
          { className: 'sheet', role: 'dialog', 'aria-modal': true, 'aria-labelledby': labelledBy, key: 'sheet' },
          [React.createElement('div', { className: 'sheet-grab', key: 'g' }), children]
        ),
      ]
    );
  }

  function RitualEditor({ open, mode, initial, onSave, onDelete, onClose }) {
    const [name, setName] = React.useState('');
    const [color, setColor] = React.useState(ROW_PALETTE[0].c);
    const [icon, setIcon] = React.useState('star');
    const inputRef = React.useRef(null);

    React.useEffect(() => {
      if (open) {
        setName(initial?.name || '');
        setColor(initial?.color || ROW_PALETTE[0].c);
        setIcon(initial?.icon || 'star');
        setTimeout(() => inputRef.current && inputRef.current.focus(), 280);
      }
    }, [open, initial]);

    const save = () => {
      const n = name.trim();
      if (!n) {
        inputRef.current && inputRef.current.focus();
        return;
      }
      onSave({ name: n, color, icon });
    };

    return React.createElement(
      Sheet,
      { open, onClose, labelledBy: 'editor-title' },
      React.createElement('div', { className: 'editor' }, [
        React.createElement('div', { className: 'editor-head', key: 'h' }, [
          React.createElement(
            'div',
            { className: 'editor-badge', style: { background: color }, key: 'b' },
            React.createElement(window.StickerIcon, { name: icon, s: 30, c: '#fff' })
          ),
          React.createElement('h2', { id: 'editor-title', className: 'editor-title', key: 't' },
            mode === 'edit' ? 'Изменить дело' : 'Новое дело'),
        ]),

        React.createElement('input', {
          key: 'in', ref: inputRef, className: 'editor-input', value: name,
          placeholder: 'Например: промыть нос',
          onChange: (e) => setName(e.target.value),
          onKeyDown: (e) => { if (e.key === 'Enter') save(); },
          maxLength: 40,
        }),

        React.createElement('div', { className: 'editor-label', key: 'cl' }, 'Цвет'),
        React.createElement('div', { className: 'swatches', key: 'sw' },
          ROW_PALETTE.map((p) =>
            React.createElement('button', {
              key: p.c, className: 'swatch' + (color === p.c ? ' on' : ''),
              style: { background: p.c }, onClick: () => setColor(p.c),
              'aria-label': 'цвет', type: 'button',
            }, color === p.c ? React.createElement(window.StickerIcon, { name: 'check', s: 20, c: '#fff' }) : null)
          )
        ),

        React.createElement('div', { className: 'editor-label', key: 'il' }, 'Наклейка'),
        React.createElement('div', { className: 'icon-grid', key: 'ig' },
          window.ICON_LIST.map((name) =>
            React.createElement('button', {
              key: name, className: 'icon-pick' + (icon === name ? ' on' : ''),
              style: icon === name ? { background: color, borderColor: color } : null,
              onClick: () => setIcon(name), type: 'button', 'aria-label': name,
            }, React.createElement(window.StickerIcon, { name, s: 26, c: icon === name ? '#fff' : '#6f6c7d' }))
          )
        ),

        React.createElement('div', { className: 'editor-actions', key: 'act' }, [
          mode === 'edit'
            ? React.createElement('button', { key: 'del', className: 'btn btn-ghost-danger', type: 'button', onClick: onDelete }, 'Удалить')
            : React.createElement('span', { key: 'sp' }),
          React.createElement('div', { className: 'editor-actions-right', key: 'r' }, [
            React.createElement('button', { key: 'c', className: 'btn btn-ghost', type: 'button', onClick: onClose }, 'Отмена'),
            React.createElement('button', { key: 's', className: 'btn btn-primary', type: 'button', onClick: save, style: { background: color } }, 'Готово'),
          ]),
        ]),
      ])
    );
  }

  function Toggle({ on, onClick, id }) {
    return React.createElement('button', {
      className: 'toggle' + (on ? ' on' : ''), role: 'switch', 'aria-checked': on,
      onClick, type: 'button', id,
    }, React.createElement('span', { className: 'toggle-knob' }));
  }

  function SettingsSheet({ open, settings, setSettings, onClearWeek, onClose }) {
    const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));
    const Row = (id, label, hint, key) =>
      React.createElement('div', { className: 'set-row', key }, [
        React.createElement('div', { key: 'l' }, [
          React.createElement('label', { htmlFor: id, className: 'set-label', key: 'a' }, label),
          hint ? React.createElement('div', { className: 'set-hint', key: 'b' }, hint) : null,
        ]),
        React.createElement(Toggle, { id, on: settings[id], onClick: () => set(id, !settings[id]), key: 't' }),
      ]);

    const LOGOS = [
      { name: 'rocket', label: 'Ракета' },
      { name: 'car', label: 'Машинка' },
      { name: 'cross', label: 'Крестик' },
    ];
    const curLogo = settings.logo || 'rocket';

    return React.createElement(
      Sheet,
      { open, onClose, labelledBy: 'set-title' },
      React.createElement('div', { className: 'editor' }, [
        React.createElement('h2', { id: 'set-title', className: 'editor-title', key: 't', style: { marginBottom: 6 } }, 'Настройки'),

        React.createElement('div', { className: 'editor-label', key: 'll' }, 'Логотип'),
        React.createElement('div', { className: 'logo-pick-row', key: 'lr' },
          LOGOS.map((o) =>
            React.createElement('button', {
              key: o.name, type: 'button',
              className: 'logo-pick' + (curLogo === o.name ? ' on' : ''),
              onClick: () => set('logo', o.name), 'aria-label': o.label,
            }, [
              React.createElement('span', { className: 'logo-pick-mark', key: 'm' },
                React.createElement(window.StickerIcon, { name: o.name, s: 26, c: '#fff' })),
              React.createElement('span', { className: 'logo-pick-label', key: 'l' }, o.label),
            ])
          )
        ),

        React.createElement('div', { className: 'editor-label', key: 'el' }, 'Верхняя строка'),
        React.createElement('input', {
          key: 'eb', className: 'editor-input', value: settings.eyebrow ?? '',
          placeholder: 'например: космодром (можно пусто)',
          onChange: (e) => set('eyebrow', e.target.value), maxLength: 24,
        }),

        React.createElement('div', { className: 'editor-label', key: 'tl' }, 'Нижняя строка'),
        React.createElement('input', {
          key: 'tt', className: 'editor-input', value: settings.title ?? '',
          placeholder: 'например: Ваня',
          onChange: (e) => set('title', e.target.value), maxLength: 24,
        }),

        React.createElement('div', { className: 'set-divider', key: 'dv' }),

        Row('fireworks', 'Салют за полный день', 'когда все дела сделаны', 'r1'),
        Row('sound', 'Звуки', 'тихий «дзынь» при отметке', 'r2'),
        Row('big', 'Крупные клетки', 'удобнее маленьким пальчикам', 'r3'),
        React.createElement('button', {
          key: 'clear', className: 'btn btn-ghost-danger wide', type: 'button',
          onClick: onClearWeek, style: { marginTop: 18 },
        }, 'Очистить эту неделю'),
      ])
    );
  }

  Object.assign(window, { RitualEditor, SettingsSheet, ROW_PALETTE });
})();
