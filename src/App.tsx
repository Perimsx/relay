import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Mail, ShieldCheck, X} from 'lucide-react';
import {motion, AnimatePresence, useMotionValue, useSpring, useTransform} from 'motion/react';

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
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.8, delay: 1.7, ease: [0.19, 1, 0.22, 1]}}
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
      initial={{opacity: 0, y: 15, scale: 0.98}}
      animate={{opacity: 1, y: 0, scale: 1}}
      transition={{duration: 0.8, delay: 1.45, ease: [0.19, 1, 0.22, 1]}}
    >
      <div ref={elRef} style={{display: 'flex', alignItems: 'center'}} />
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
      const angle = -(Math.random() * 10 + 25);
      const len = Math.random() * 110 + 70;
      const rad = (angle * Math.PI) / 180;
      const ww = canvas.width;
      const wh = canvas.height;
      stars.push({
        sx: (sx * ww) / 100,
        sy: (sy * wh) / 100,
        ex: ((sx + Math.cos(rad) * len) * ww) / 100,
        ey: ((sy + Math.sin(rad) * len) * wh) / 100,
        progress: 0,
        speed: Math.random() * 0.008 + 0.005,
        width: Math.random() * 0.8 + 0.4,
        color: Math.random() > 0.3 ? '#94a3b8' : '#3b82f6',
        brightness: Math.random() * 0.1 + 0.3,
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
        grad.addColorStop(0, 'rgba(148,163,184,0)');
        grad.addColorStop(endProgress * 0.7, `rgba(59,130,246,${ss.brightness * 0.4})`);
        grad.addColorStop(endProgress, ss.color);
        grad.addColorStop(1, 'rgba(37,99,235, 0.4)');

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
    ['#cbd5e1', '#94a3b8', '#3b82f6'],
    ['#94a3b8', '#64748b', '#2563eb'],
    ['#3b82f6', '#2563eb', '#1d4ed8'],
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
function CustomCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ringX = useSpring(mouseX, {damping: 25, stiffness: 200});
  const ringY = useSpring(mouseY, {damping: 25, stiffness: 200});
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (['A', 'BUTTON', 'svg', 'path'].includes(target.tagName) || target.closest('a') || target.closest('button')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div 
        className="cursor-dot"
        style={{x: mouseX, y: mouseY, xPercent: -50, yPercent: -50}}
      />
      <motion.div 
        className="cursor-ring"
        animate={{
          scale: isHovered ? 2.5 : 1,
          backgroundColor: isHovered ? 'rgba(30, 64, 175, 0.15)' : 'rgba(30, 64, 175, 0)',
          borderColor: isHovered ? 'rgba(30, 64, 175, 0.4)' : 'rgba(30, 64, 175, 0.2)'
        }}
        style={{x: ringX, y: ringY, xPercent: -50, yPercent: -50}}
      />
    </>
  );
}

export default function App() {
  const starsHTML = generateStars(0, 90) + generateStars(1, 60) + generateStars(2, 30);
  const pageRef = useRef<HTMLDivElement>(null);
  const [showCert, setShowCert] = useState(false);

  // 3D Tilt Logic
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, {damping: 30, stiffness: 200});
  const springY = useSpring(mouseY, {damping: 30, stiffness: 200});
  const rotateX = useTransform(springY, [0, 1], [3, -3]);
  const rotateY = useTransform(springX, [0, 1], [-3, 3]);

  useEffect(() => {
    let lastX = 0.5, lastY = 0.5;
    let targetX = 0.5, targetY = 0.5;
    let rafId: number;

    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      targetX = x;
      targetY = y;
      mouseX.set(x);
      mouseY.set(y);
    };

    const update = () => {
      // Smooth interpolation for mouse movement
      lastX += (targetX - lastX) * 0.08;
      lastY += (targetY - lastY) * 0.08;
      
      // Auto-roaming if no movement (pseudo-random)
      const time = Date.now() * 0.0005;
      const roamX = Math.sin(time * 0.7) * 0.05 + lastX;
      const roamY = Math.cos(time * 0.5) * 0.05 + lastY;

      if (pageRef.current) {
        pageRef.current.style.setProperty('--mx', roamX.toFixed(4));
        pageRef.current.style.setProperty('--my', roamY.toFixed(4));
      }
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', handleMove);
    update();
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="page" ref={pageRef}>
      <CustomCursor />
      {/* Background layers */}
      <div className="bg-base" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />
      <div className="bg-interactive" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />

      {/* Side Decorations */}
      <div className="side-bar left-bar" aria-hidden="true">
        <div className="side-line" />
        <a href="mailto:Cotovo@163.com" className="side-action">
          <Mail size={12} />
          <span>CONTACT</span>
        </a>
      </div>

      <div className="side-bar right-bar" aria-hidden="true">
        <div className="side-stat">
          <div className="stat-dot" />
          <span className="stat-label">STATUS</span>
          <span className="stat-value active">ONLINE</span>
        </div>
        <div className="side-line" />
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCert && (
          <motion.div 
            className="cert-overlay"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setShowCert(false)}
          >
            <motion.div 
              className="cert-modal"
              initial={{scale: 0.9, y: 20, opacity: 0}}
              animate={{scale: 1, y: 0, opacity: 1}}
              exit={{scale: 0.9, y: 20, opacity: 0}}
              transition={{type: 'spring', damping: 25, stiffness: 300}}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="cert-close" onClick={() => setShowCert(false)}>
                <X size={20} />
              </button>
              <div className="cert-header">
                <h3>Domain Certificate</h3>
                <p>cot.wiki digital credential</p>
              </div>
              <div className="cert-img-wrap">
                <img src="./cot.wiki.jpg" alt="Domain Certificate" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stars layer with subtle parallax */}
      <div
        className="stars-layer"
        aria-hidden="true"
        dangerouslySetInnerHTML={{__html: starsHTML}}
      />

      {/* Shooting stars */}
      <ShootingStars />

      {/* Main content */}
      <motion.div 
        className="content"
        style={{rotateX, rotateY, perspective: 1000}}
      >
        <motion.button
          className="kicker cert-trigger-top"
          initial={{opacity: 0, scale: 0.9, y: -20}}
          animate={{opacity: 1, scale: 1, y: 0}}
          transition={{duration: 1.2, delay: 0.2, ease: [0.19, 1, 0.22, 1]}}
          onClick={() => setShowCert(true)}
        >
          <ShieldCheck size={12} />
          OFFICIAL DOMAIN CERTIFIED
        </motion.button>

        <div className="title">
          <div className="title-group">
            {"旧域名".split('').map((c, i) => (
              <motion.span
                key={i}
                className="tc"
                initial={{opacity: 0, y: 30, rotateX: 45, filter: 'blur(12px)'}}
                animate={{opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)'}}
                transition={{duration: 0.8, delay: 0.4 + i * 0.08, ease: [0.19, 1, 0.22, 1]}}
              >
                {c}
              </motion.span>
            ))}
          </div>
          <div className="title-group">
            {"/ 已迁移".split('').map((c, i) => (
              <motion.span
                key={i}
                className="tc td"
                initial={{opacity: 0, y: 30, rotateX: 45, filter: 'blur(12px)'}}
                animate={{opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)'}}
                transition={{duration: 0.8, delay: 0.8 + i * 0.08, ease: [0.19, 1, 0.22, 1]}}
              >
                {c}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          className="links-section"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1, delay: 1.1, ease: [0.19, 1, 0.22, 1]}}
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
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.8, delay: 1.3, ease: [0.19, 1, 0.22, 1]}}
              whileHover={{y: -5}}
              whileTap={{scale: 0.96}}
            >
              <span className="ci">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              initial={{opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.8, delay: 1.4, ease: [0.19, 1, 0.22, 1]}}
              whileHover={{y: -5}}
              whileTap={{scale: 0.96}}
            >
              <span className="ci">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        <motion.footer
          className="footer"
          initial={{opacity: 0, y: 15}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1, delay: 1.7, ease: [0.19, 1, 0.22, 1]}}
        >
          <Clock />
          <div className="footer-links">
            <a href="mailto:Cotovo@163.com" className="fl">
              <Mail size={10} />
              Cotovo@163.com
            </a>
            <span className="fd">·</span>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="fl">
              鄂ICP备2025157857号
            </a>
            <span className="fd">·</span>
            <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502008592" target="_blank" rel="noreferrer" className="fl">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '2px'}}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              鄂公网安备 42018502008592号
            </a>
            {/* Mobile-only cert link */}
            <span className="fd show-mobile">·</span>
            <button className="fl show-mobile" style={{background: 'none', border: 'none', cursor: 'pointer'}} onClick={() => setShowCert(true)}>
              <ShieldCheck size={10} />
              域名证书
            </button>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
}
