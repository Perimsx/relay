import {useCallback, useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Mail} from 'lucide-react';
import {motion} from 'motion/react';

// 2025年11月10日 00:07:03 +08:00
const START_DATE = new Date('2025-11-10T00:07:03+08:00').getTime();
const TITLE_CHARS = ['旧', '域', '名', '/', '已', '迁', '移'];

// ── Star ──────────────────────────────────────
interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  color: string;
  glow: boolean;
  twinkleSpeed: number;
  twinklePhase: number;
}

function createStar(layer: number): Star {
  const palettes = [
    ['#ffffff', '#d4e4ff', '#b8d0ff'],
    ['#ffffff', '#fff8e8', '#ffe4b8'],
    ['#ffd88a', '#e8c87a', '#fff0c0'],
  ];
  const colors = palettes[layer];
  const layerAlpha = [0.25, 0.45, 0.75][layer];
  const layerGlow = [0.05, 0.12, 0.35][layer];

  return {
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * [0.5, 1.0, 1.8][layer] + [0.2, 0.5, 0.8][layer],
    alpha: Math.random() * 0.25 + layerAlpha,
    color: colors[Math.floor(Math.random() * colors.length)],
    glow: Math.random() < layerGlow,
    twinkleSpeed: Math.random() * 0.025 + 0.008,
    twinklePhase: Math.random() * Math.PI * 2,
  };
}

// ── Shooting Star ──────────────────────────────
interface ShootingStar {
  id: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  progress: number;
  speed: number;
  width: number;
  color: string;
  brightness: number;
}

function createClockTime() {
  const now = new Date();

  return {
    d: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`,
    h: String(now.getHours()).padStart(2, '0'),
    m: String(now.getMinutes()).padStart(2, '0'),
    s: String(now.getSeconds()).padStart(2, '0'),
  };
}

function makeSS(id: number): ShootingStar {
  const sx = Math.random() * 35 + 5;
  const sy = Math.random() * 28 + 2;
  const angle = -(Math.random() * 18 + 22);
  const len = Math.random() * 90 + 55;
  const rad = (angle * Math.PI) / 180;
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  return {
    id,
    sx: (sx * ww) / 100,
    sy: (sy * wh) / 100,
    ex: ((sx + Math.cos(rad) * len) * ww) / 100,
    ey: ((sy + Math.sin(rad) * len) * wh) / 100,
    progress: 0,
    speed: Math.random() * 0.01 + 0.007,
    width: Math.random() * 1.0 + 0.5,
    color: Math.random() > 0.3 ? '#fff8e0' : '#ffd88a',
    brightness: Math.random() * 0.25 + 0.75,
  };
}

// ── App ───────────────────────────────────────
export default function App() {
  const [farStars] = useState(() => Array.from({length: 120}, () => createStar(0)));
  const [midStars] = useState(() => Array.from({length: 80}, () => createStar(1)));
  const [nearStars] = useState(() => Array.from({length: 40}, () => createStar(2)));

  const [ssList, setSSList] = useState<ShootingStar[]>([]);
  const [tick, setTick] = useState(0);
  const ssIdRef = useRef(0);

  const [time, setTime] = useState(createClockTime);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => {
      setTime(createClockTime());
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Shooting stars
  const fireSS = useCallback(() => {
    ssIdRef.current += 1;
    const id = ssIdRef.current;
    const ss = makeSS(id);
    setSSList(prev => [...prev.slice(-4), ss]);
    setTimeout(() => {
      setSSList(prev => prev.filter(s => s.id !== id));
    }, 2000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.45) {
        fireSS();
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [fireSS]);

  // Animate shooting stars
  useEffect(() => {
    let raf: number;
    const animate = () => {
      setSSList(prev => prev.map(s => ({...s, progress: Math.min(1, s.progress + s.speed)})));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Calculate elapsed time
  const diff = Date.now() - START_DATE;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <div className="page">
      {/* Background */}
      <div className="bg-base" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      {/* Far stars */}
      {farStars.map((s, i) => {
        const a = s.alpha * (0.3 + 0.7 * Math.sin(tick * s.twinkleSpeed + s.twinklePhase));
        return (
          <div
            key={`far-${i}`}
            className="star star-far"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              background: s.color,
              opacity: Math.max(0.01, Math.min(1, a)),
            }}
            aria-hidden="true"
          />
        );
      })}

      {/* Mid stars */}
      {midStars.map((s, i) => {
        const a = s.alpha * (0.3 + 0.7 * Math.sin(tick * s.twinkleSpeed + s.twinklePhase));
        return (
          <div
            key={`mid-${i}`}
            className="star star-mid"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              background: s.color,
              opacity: Math.max(0.02, Math.min(1, a)),
              boxShadow: s.glow ? `0 0 ${s.r * 3}px ${s.color}55` : 'none',
            }}
            aria-hidden="true"
          />
        );
      })}

      {/* Near stars */}
      {nearStars.map((s, i) => {
        const a = s.alpha * (0.25 + 0.75 * Math.sin(tick * s.twinkleSpeed + s.twinklePhase));
        return (
          <div
            key={`near-${i}`}
            className="star star-near"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              background: s.color,
              opacity: Math.max(0.03, Math.min(1, a)),
              boxShadow: s.glow ? `0 0 ${s.r * 4}px ${s.color}, 0 0 ${s.r * 8}px ${s.color}44` : `0 0 ${s.r * 2}px ${s.color}88`,
            }}
            aria-hidden="true"
          />
        );
      })}

      {/* Shooting stars */}
      {ssList.map(ss => {
        if (ss.progress >= 1) {
          return null;
        }
        const x = ss.sx + (ss.ex - ss.sx) * ss.progress;
        const y = ss.sy + (ss.ey - ss.sy) * ss.progress;
        const trailStart = Math.max(0, ss.progress - 0.3);

        return (
          <div key={`ss-${ss.id}`} aria-hidden="true" style={{position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to right, transparent 0%, transparent ${trailStart * 100}%, rgba(255,248,220,${ss.brightness * 0.1}) ${trailStart * 100 + 10}%, ${ss.color} ${trailStart * 100 + 38}%, #ffffff 100%)`,
                clipPath: `polygon(${ss.sx}px ${ss.sy}px, ${x}px ${y}px, ${x + ss.width}px ${y}px, ${ss.sx + ss.width}px ${ss.sy}px)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x - ss.width * 2,
                top: y - ss.width * 2,
                width: ss.width * 4,
                height: ss.width * 4,
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: `0 0 ${ss.width * 10}px #fff8e0, 0 0 ${ss.width * 20}px ${ss.color}, 0 0 ${ss.width * 35}px rgba(255,216,138,0.25)`,
                opacity: 1 - ss.progress * 0.25,
              }}
            />
          </div>
        );
      })}

      {/* Main content - guaranteed above everything */}
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
              whileHover={{y: -4, scale: 1.02}}
              whileTap={{scale: 0.98}}
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
              whileHover={{y: -4, scale: 1.02}}
              whileTap={{scale: 0.98}}
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

        {/* Counter - precise to second */}
        <motion.div
          className="counter"
          initial={{opacity: 0, scale: 0.96}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: 0.5, delay: 1.3}}
        >
          {[
            {n: days, u: '天'},
            {n: hours, u: '时'},
            {n: minutes, u: '分'},
            {n: seconds, u: '秒'},
          ].map(({n, u}, i) => (
            <motion.div
              key={u}
              className="cn"
              initial={{opacity: 0, y: 6}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.35, delay: 1.4 + i * 0.06}}
            >
              <span className="cn-n">{String(n).padStart(2, '0')}</span>
              <span className="cn-u">{u}</span>
              {i < 3 && <span className="cn-s" />}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="clock"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5, delay: 1.7}}
        >
          <span>{time.d}</span>
          <span className="cd">·</span>
          <span>
            {time.h}:{time.m}:{time.s}
          </span>
        </motion.div>
      </div>

      {/* Footer */}
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
  );
}
