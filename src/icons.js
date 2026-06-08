// Простые, плоские иконки-наклейки. Космос / машинки / медицина.
// Каждая принимает { s (size), c (color) }.
(function () {
  const S = (props, children) => {
    const { s = 24, c = 'currentColor', ...rest } = props;
    return React.createElement(
      'svg',
      { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', ...rest },
      children
    );
  };
  const P = (d, extra = {}) =>
    React.createElement('path', { d, ...extra });

  const ICONS = {
    star: (p) =>
      S(p, P('M12 2.6l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.1 19.6l1.3-6.2-4.7-4.3 6.3-.7z', { fill: p.c })),

    rocket: (p) =>
      S(p, [
        P('M12 2.2c2.7 1.9 4.2 4.9 4.2 8.2 0 1.7-.4 3.2-1.1 4.6h-6.2C8.4 13.6 8 12.1 8 10.4c0-3.3 1.5-6.3 4-8.2z', { fill: p.c, key: 'b' }),
        React.createElement('circle', { cx: 12, cy: 9, r: 1.9, fill: '#fff', key: 'w' }),
        P('M8.9 15.4c-1.5.6-2.4 1.7-2.6 3.3 1.5-.2 2.6-.8 3.3-1.9zM15.1 15.4c1.5.6 2.4 1.7 2.6 3.3-1.5-.2-2.6-.8-3.3-1.9z', { fill: p.c, key: 'f' }),
        P('M11 18.5h2l-1 3z', { fill: p.c, opacity: 0.5, key: 'fl' }),
      ]),

    planet: (p) =>
      S(p, [
        React.createElement('circle', { cx: 12, cy: 12, r: 5.6, fill: p.c, key: 'b' }),
        React.createElement('ellipse', { cx: 12, cy: 12, rx: 9.4, ry: 3.1, fill: 'none', stroke: p.c, strokeWidth: 1.8, transform: 'rotate(-22 12 12)', key: 'r' }),
      ]),

    moon: (p) =>
      S(p, P('M15.2 3.3a8.2 8.2 0 1 0 5.6 11.6A6.8 6.8 0 0 1 15.2 3.3z', { fill: p.c })),

    car: (p) =>
      S(p, [
        P('M3.5 13.5l1.4-3.7A2.2 2.2 0 0 1 7 8.3h6.8c.9 0 1.7.5 2.1 1.3l1.8 3.4', { fill: 'none', stroke: p.c, strokeWidth: 1.8, strokeLinejoin: 'round', key: 'top' }),
        React.createElement('rect', { x: 2.6, y: 13, width: 18.8, height: 4.4, rx: 2.2, fill: p.c, key: 'body' }),
        React.createElement('circle', { cx: 7.2, cy: 18, r: 2, fill: '#fff', stroke: p.c, strokeWidth: 1.6, key: 'w1' }),
        React.createElement('circle', { cx: 16.8, cy: 18, r: 2, fill: '#fff', stroke: p.c, strokeWidth: 1.6, key: 'w2' }),
      ]),

    bolt: (p) =>
      S(p, P('M13.5 2L4.5 13.2H10l-1.3 8.8L19 10.4h-5.8z', { fill: p.c })),

    drop: (p) =>
      S(p, P('M12 2.8c3.2 4.3 5.2 7 5.2 9.6a5.2 5.2 0 0 1-10.4 0c0-2.6 2-5.3 5.2-9.6z', { fill: p.c })),

    balloon: (p) =>
      S(p, [
        React.createElement('ellipse', { cx: 12, cy: 9, rx: 5.6, ry: 6.6, fill: p.c, key: 'b' }),
        P('M12 15.6l-1.2 1.9 1.2 1 1.2-1z', { fill: p.c, key: 'k' }),
        P('M12 18.4c0 1.6-1.8 1.8-1.8 3.4', { fill: 'none', stroke: p.c, strokeWidth: 1.4, strokeLinecap: 'round', key: 's' }),
      ]),

    pill: (p) =>
      S(p, [
        React.createElement('rect', { x: 3.6, y: 8.6, width: 16.8, height: 6.8, rx: 3.4, fill: p.c, key: 'b' }),
        React.createElement('line', { x1: 12, y1: 9, x2: 12, y2: 15, stroke: '#fff', strokeWidth: 1.6, key: 'l' }),
      ]),

    heart: (p) =>
      S(p, P('M12 20.4S3.8 15 3.8 9.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.2 2.4C20.2 15 12 20.4 12 20.4z', { fill: p.c })),

    sun: (p) =>
      S(p, [
        React.createElement('circle', { cx: 12, cy: 12, r: 4.4, fill: p.c, key: 'c' }),
        React.createElement('g', { stroke: p.c, strokeWidth: 1.8, strokeLinecap: 'round', key: 'r' }, [
          React.createElement('line', { x1: 12, y1: 2.4, x2: 12, y2: 4.6, key: 1 }),
          React.createElement('line', { x1: 12, y1: 19.4, x2: 12, y2: 21.6, key: 2 }),
          React.createElement('line', { x1: 2.4, y1: 12, x2: 4.6, y2: 12, key: 3 }),
          React.createElement('line', { x1: 19.4, y1: 12, x2: 21.6, y2: 12, key: 4 }),
          React.createElement('line', { x1: 5.2, y1: 5.2, x2: 6.8, y2: 6.8, key: 5 }),
          React.createElement('line', { x1: 17.2, y1: 17.2, x2: 18.8, y2: 18.8, key: 6 }),
          React.createElement('line', { x1: 5.2, y1: 18.8, x2: 6.8, y2: 17.2, key: 7 }),
          React.createElement('line', { x1: 17.2, y1: 6.8, x2: 18.8, y2: 5.2, key: 8 }),
        ]),
      ]),

    cloud: (p) =>
      S(p, P('M7 18a4 4 0 0 1-.4-8 5.2 5.2 0 0 1 10 .6A3.6 3.6 0 0 1 16.5 18z', { fill: p.c })),

    check: (p) =>
      S(p, P('M4.5 12.5l4.5 4.5L19.5 6.5', { fill: 'none', stroke: p.c, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' })),

    cross: (p) =>
      S(p, React.createElement('path', { d: 'M9.4 3.4h5.2v6h6v5.2h-6v6H9.4v-6h-6V9.4h6z', fill: p.c })),
  };

  const ICON_LIST = ['star', 'rocket', 'planet', 'moon', 'car', 'bolt', 'drop', 'balloon', 'pill', 'heart', 'sun', 'cloud'];

  function StickerIcon({ name, s = 24, c = 'currentColor' }) {
    const fn = ICONS[name] || ICONS.star;
    return fn({ s, c });
  }

  Object.assign(window, { ICONS, ICON_LIST, StickerIcon });
})();
