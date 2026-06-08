// Салют + конфетти на одном fullscreen canvas. Тихий, не агрессивный.
(function () {
  const PALETTE = ['#5B8DEF', '#EF7E5B', '#4FB286', '#8A78E0', '#E8B23E', '#E08AB0', '#3FB0C4'];

  function useFireworks() {
    const canvasRef = React.useRef(null);
    const partsRef = React.useRef([]);
    const rafRef = React.useRef(0);
    const runningRef = React.useRef(false);
    const lastRef = React.useRef(0);

    const resize = React.useCallback(() => {
      const cv = canvasRef.current;
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }, []);

    React.useEffect(() => {
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, [resize]);

    const star = (ctx, x, y, r, rot) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = rot + (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const a2 = a + Math.PI / 5;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.lineTo(x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45);
      }
      ctx.closePath();
      ctx.fill();
    };

    const tick = React.useCallback((now) => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      // Шаг по времени, нормализованный к 60 fps. Это делает анимацию
      // независимой от частоты кадров: на 120 Гц не ускоряется, при
      // просадке кадров не «дёргается». f — сколько «эталонных» кадров
      // прошло с прошлого тика.
      const last = lastRef.current || now;
      lastRef.current = now;
      let f = ((now - last) / 1000) * 60;
      if (!(f > 0)) f = 1;          // первый кадр / некорректный timestamp
      if (f > 2.5) f = 2.5;         // после лага или возврата вкладки — не телепортируем
      ctx.clearRect(0, 0, cv.width, cv.height);
      const ps = partsRef.current;
      const fr = Math.pow(0.985, f); // трение за прошедшее время
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += f;
        p.vy += p.g * f;
        p.vx *= fr;
        p.x += p.vx * f;
        p.y += p.vy * f;
        p.rot += p.vr * f;
        const t = p.life / p.max;
        const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        if (p.shape === 'star') {
          star(ctx, p.x, p.y, p.size, p.rot);
        } else if (p.shape === 'rect') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
          ctx.restore();
        } else if (p.shape === 'emoji') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.font = p.size + 'px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 7);
          ctx.fill();
        }
        if (p.life >= p.max) ps.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      if (ps.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
      }
    }, []);

    const ensure = React.useCallback(() => {
      if (!runningRef.current) {
        runningRef.current = true;
        lastRef.current = 0; // первый кадр получит f = 1, без скачка по dt
        rafRef.current = requestAnimationFrame(tick);
      }
    }, [tick]);

    // Взрыв салюта в точке (x,y) экрана + падающее конфетти сверху колонки.
    const burst = React.useCallback((x, y, opts = {}) => {
      const ps = partsRef.current;
      const colW = opts.colWidth || 80;
      const shapes = ['star', 'rect', 'circle'];
      // лучи салюта — резкий быстрый разлёт
      const n = 30;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
        const sp = 5 + Math.random() * 5;
        ps.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2.5,
          g: 0.16,
          size: 2.6 + Math.random() * 2.4,
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
          shape: i % 5 === 0 ? 'star' : 'circle',
          life: 0, max: 30 + Math.random() * 14,
          rot: Math.random() * 7, vr: (Math.random() - 0.5) * 0.6,
        });
      }
      // второй, меньший круг
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2.5 + Math.random() * 3.5;
        ps.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, g: 0.15,
          size: 1.8 + Math.random() * 1.8,
          color: '#fff', shape: 'circle', life: 0, max: 22 + Math.random() * 12,
          rot: 0, vr: 0,
        });
      }
      // конфетти, сыплется сверху колонки
      for (let i = 0; i < 22; i++) {
        ps.push({
          x: x + (Math.random() - 0.5) * colW,
          y: y - 50 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 2,
          vy: 3 + Math.random() * 3,
          g: 0.14,
          size: 6 + Math.random() * 5,
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
          shape: shapes[(Math.random() * shapes.length) | 0],
          life: 0, max: 46 + Math.random() * 22,
          rot: Math.random() * 7, vr: (Math.random() - 0.5) * 0.6,
        });
      }
      ensure();
    }, [ensure]);

    // Фонтанчик эмодзи у клетки — небольшой, вверх с лёгким разлётом.
    const emojiBurst = React.useCallback((x, y, opts = {}) => {
      const list = opts.emojis && opts.emojis.length ? opts.emojis : ['🎉', '⭐', '✨'];
      const ps = partsRef.current;
      const n = opts.count || 10;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.1; // в основном вверх
        const sp = 3.5 + Math.random() * 3.5;
        ps.push({
          x: x + (Math.random() - 0.5) * 14, y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5,
          g: 0.18, size: 18 + Math.random() * 12,
          char: list[(Math.random() * list.length) | 0],
          color: '#000', shape: 'emoji',
          life: 0, max: 34 + Math.random() * 16,
          rot: (Math.random() - 0.5) * 0.5, vr: (Math.random() - 0.5) * 0.18,
        });
      }
      ensure();
    }, [ensure]);

    // Полноэкранный фонтан эмодзи — несколько форсунок снизу + лёгкий дождь сверху.
    const emojiFountain = React.useCallback((emojis) => {
      const list = emojis && emojis.length ? emojis : ['🎉', '⭐', '🚀', '🌟', '✨'];
      const ps = partsRef.current;
      const W = window.innerWidth, H = window.innerHeight;
      const jets = 5;
      for (let j = 0; j < jets; j++) {
        const jx = (W * (j + 0.5)) / jets;
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
          const sp = 11 + Math.random() * 7; // мощный взлёт
          ps.push({
            x: jx + (Math.random() - 0.5) * 40, y: H + 10,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            g: 0.22, size: 22 + Math.random() * 16,
            char: list[(Math.random() * list.length) | 0],
            color: '#000', shape: 'emoji',
            life: 0, max: 90 + Math.random() * 40,
            rot: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 0.22,
          });
        }
      }
      for (let i = 0; i < 24; i++) {
        ps.push({
          x: Math.random() * W, y: -20 - Math.random() * 80,
          vx: (Math.random() - 0.5) * 1.5, vy: 2 + Math.random() * 2.5,
          g: 0.12, size: 20 + Math.random() * 14,
          char: list[(Math.random() * list.length) | 0],
          color: '#000', shape: 'emoji',
          life: 0, max: 80 + Math.random() * 40,
          rot: (Math.random() - 0.5) * 0.4, vr: (Math.random() - 0.5) * 0.15,
        });
      }
      ensure();
    }, [ensure]);

    React.useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    const Canvas = React.useCallback(
      (props) =>
        React.createElement('canvas', {
          ref: canvasRef,
          className: 'fx-canvas',
          ...props,
        }),
      []
    );

    return { Canvas, burst, emojiBurst, emojiFountain };
  }

  Object.assign(window, { useFireworks, FX_PALETTE: PALETTE });
})();
