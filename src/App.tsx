import {useCallback, useEffect, useRef} from 'react';
import {ArrowUpRight, Mail} from 'lucide-react';
import {motion} from 'motion/react';

// 2025年11月10日 00:07:03 +08:00
const START_DATE = new Date('2025-11-10T00:07:03+08:00').getTime();
const TITLE_CHARS = ['旧', '域', '名', '/', '已', '迁', '移'];

// ── Clock ─────────────────────────────────────
function Clock() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (elRef.current) {
        const d = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        elRef.current.innerHTML = `<span>${d}</span><span class="cd">·</span><span>${h}:${m}:${s}</span>`;
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="clock"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.5, delay: 1.7}}
    >
      <div ref={elRef} />
    </motion.div>
  );
}

// ── Counter ───────────────────────────────────
function Counter() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (!elRef.current) return;
      const diff = Date.now() - START_DATE;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      elRef.current.innerHTML = `
        <div class="cn"><span class="cn-n">${pad(d)}</span><span class="cn-u">天</span><span class="cn-s"></span></div>
        <div class="cn"><span class="cn-n">${pad(h)}</span><span class="cn-u">时</span><span class="cn-s"></span></div>
        <div class="cn"><span class="cn-n">${pad(m)}</span><span class="cn-u">分</span><span class="cn-s"></span></div>
        <div class="cn"><span class="cn-n">${pad(s)}</span><span class="cn-u">秒</span></div>
      `;
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="counter"
      initial={{opacity: 0, scale: 0.96}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.5, delay: 1.3}}
    >
      <div ref={elRef} />
    </motion.div>
  );
}

// ── Shooting Stars (Canvas) ───────────────────
function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastSS = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Single RAF loop for all shooting stars
    // State lives in plain variables, React never touches it
    const stars: {
      sx: number; sy: number; ex: number; ey: number;
      progress: number; speed: number; width: number;
      color: string; brightness: number;
    }[] = [];

    const fire = () => {
      const sx = Math.random() * 35 + 5;
      const sy = Math.random() * 28 + 2;
      const angle = -(Math.random() * 18 + 22);
      const len = Math.random() * 90 + 55;
      const rad = (angle * Math.PI) / 180;
      const ww = canvas.width;
      const wh = canvas.height;
      stars.push({
        sx: (sx * ww) / 100,
        sy: (sy * wh) / 100,
        ex: ((sx + Math.cos(rad) * len) * ww) / 100,
        ey: ((sy + Math.sin(rad) * len) * wh) / 100,
        progress: 0,
        speed: Math.random() * 0.01 + 0.007,
        width: Math.random() * 1.0 + 0.5,
        color: Math.random() > 0.3 ? '#fff8e0' : '#ffd88a',
        brightness: Math.random() * 0.25 + 0.75,
      });
    };

    // Spawn interval
    const spawnId = setInterval(() => {
      if (Math.random() > 0.45) fire();
    }, 7000);

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Remove finished stars
      for (let i = stars.length - 1; i >= 0; i--) {
        if (stars[i].progress >= 1) {
          stars.splice(i, 1);
        }
      }

      for (const ss of stars) {
        if (ss.progress >= 1) continue;
        ss.progress = Math.min(1, ss.progress + ss.speed);

        const x = ss.sx + (ss.ex - ss.sx) * ss.progress;
        const y = ss.sy + (ss.ey - ss.sy) * ss.progress;
        const trailStart = Math.max(0, ss.progress - 0.3);
        const endProgress = trailStart + 0.28;

        // Trail gradient
        const grad = ctx.createLinearGradient(ss.sx, ss.sy, x, y);
        grad.addColorStop(0, 'rgba(255,248,224,0)');
        grad.addColorStop(endProgress * 0.7, `rgba(255,248,224,${ss.brightness * 0.08})`);
        grad.addColorStop(endProgress, ss.color);
        grad.addColorStop(1, '#ffffff');

        ctx.beginPath();
        ctx.moveTo(ss.sx, ss.sy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Head glow
        const headAlpha = 1 - ss.progress * 0.25;
        ctx.beginPath();
        ctx.arc(x, y, ss.width * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${headAlpha})`;
        ctx.shadowColor = '#fff8e0';
        ctx.shadowBlur = ss.width * 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(spawnId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
      aria-hidden="true"
    />
  );
}

// ── Starfield (Static HTML + CSS Animation) ───
// Stars are generated once as static markup — no React state, no re-renders
function generateStars(layer: number, count: number): string {
  const palettes = [
    ['#ffffff', '#d4e4ff', '#b8d0ff'],
    ['#ffffff', '#fff8e8', '#ffe4b8'],
    ['#ffd88a', '#e8c87a', '#fff0c0'],
  ];
  const colors = palettes[layer];
  const layerAlpha = [0.25, 0.45, 0.75][layer];
  const layerGlow = [0.05, 0.12, 0.35][layer];
  const layerR = [[0.5, 1.0, 1.8], [0.2, 0.5, 0.8], [0.2, 0.5, 0.8]][layer] as number[];
  const layerMaxR = [0.5, 1.0, 1.8][layer];

  let html = '';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const r = Math.random() * layerR[1] + layerR[0];
    const alpha = Math.random() * 0.25 + layerAlpha;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const glow = Math.random() < layerGlow;
    const dur = (Math.random() * 4 + 3).toFixed(2);
    const delay = (Math.random() * 6).toFixed(2);
    const size = r * 2;
    const zIndex = layer + 1;

    let boxShadow = 'none';
    if (layer === 1 && glow) {
      boxShadow = `0 0 ${r * 3}px ${color}55`;
    } else if (layer === 2) {
      boxShadow = glow
        ? `0 0 ${r * 4}px ${color}, 0 0 ${r * 8}px ${color}44`
        : `0 0 ${r * 2}px ${color}88`;
    }

    html += `<div class="star-far" style="
      left:${x.toFixed(2)}%;
      top:${y.toFixed(2)}%;
      width:${size.toFixed(2)}px;
      height:${size.toFixed(2)}px;
      background:${color};
      --ta:${alpha.toFixed(3)};
      --tb:${(alpha * 0.15).toFixed(3)};
      opacity:var(--ta);
      z-index:${zIndex};
      box-shadow:${boxShadow};
      animation:twinkle ${dur}s ease-in-out ${delay}s infinite;
      will-change:opacity;
    "></div>`;
  }
  return html;
}

// ── App ───────────────────────────────────────
export default function App() {
  // Generate static star HTML once
  const starsHTML = generateStars(0, 90) + generateStars(1, 60) + generateStars(2, 30);

  return (
    <div className="page">
      {/* Background layers */}
      <div className="bg-base" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      {/* Stars — pure HTML/CSS, zero JS re-renders */}
      <div
        className="stars-layer"
        aria-hidden="true"
        dangerouslySetInnerHTML={{__html: starsHTML}}
      />

      {/* Shooting stars — Canvas, zero React re-renders */}
      <ShootingStars />

      {/* Main content */}
      <div className="content">
        <motion.div
          className="kicker"
          initial={{opacity: 0, y: -10}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.15}}
        >
          <span className="kdot" />
          Domain Relay
          <span className="kdot" />
        </motion.div>

        <div className="title">
          {TITLE_CHARS.map((c, i) => (
            <motion.span
              key={i}
              className={`tc ${i >= 4 ? 'td' : ''}`}
              initial={{opacity: 0, y: 20, filter: 'blur(10px)'}}
              animate={{opacity: 1, y: 0, filter: 'blur(0px)'}}
              transition={{duration: 0.5, delay: 0.35 + i * 0.06}}
            >
              {c}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="links-section"
          initial={{opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: 0.9}}
        >
          <span className="links-hint">
            <span className="hint-dot" />
            新域名入口
          </span>
          <div className="links-row">
            <motion.a
              href="https://cot.wiki"
              target="_blank"
              rel="noreferrer"
              className="card card-a"
              initial={{opacity: 0, x: -16}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.5, delay: 1.0}}
              whileHover={{y: -3, scale: 1.015}}
              whileTap={{scale: 0.97, y: 0}}
            >
              <span className="ci">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <span className="cb">
                <strong>主站</strong>
                <em>cot.wiki</em>
              </span>
              <ArrowUpRight size={14} className="ca" />
            </motion.a>

            <motion.a
              href="https://blog.cot.wiki"
              target="_blank"
              rel="noreferrer"
              className="card card-b"
              initial={{opacity: 0, x: 16}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.5, delay: 1.1}}
              whileHover={{y: -3, scale: 1.015}}
              whileTap={{scale: 0.97, y: 0}}
            >
              <span className="ci">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              <span className="cb">
                <strong>博客</strong>
                <em>blog.cot.wiki</em>
              </span>
              <ArrowUpRight size={14} className="ca" />
            </motion.a>
          </div>
        </motion.div>

        <Counter />
        <Clock />

        <motion.footer
          className="footer"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5, delay: 2.0}}
        >
          <a href="mailto:Cotovo@163.com" className="fl">
            <Mail size={9} />
            Cotovo@163.com
          </a>
          <span className="fd">·</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="fl">
            鄂ICP备2025157857号
          </a>
        </motion.footer>
      </div>
    </div>
  );
}
