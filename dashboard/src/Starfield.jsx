/* ═══════════════════════════════════════════════════════════
   Starfield Canvas — animated background of stars + CMB glow
   ═══════════════════════════════════════════════════════════ */
import { useEffect, useRef } from 'react';
import './Starfield.css';

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;
    let stars = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      const count = Math.floor((W * H) / 6000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: randomBetween(0.3, 1.6),
          alpha: randomBetween(0.2, 1),
          speed: randomBetween(0.0002, 0.001),
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);

      // CMB glow — large radial gradient (Monochrome for TrinaryVM)
      const gx = W * 0.35, gy = H * 0.3;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 0.6);
      grad.addColorStop(0,   'rgba(237, 237, 245, 0.03)');
      grad.addColorStop(0.5, 'rgba(74, 74, 92, 0.02)');
      grad.addColorStop(1,   'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237, 237, 245, ${a})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    initStars();
    animId = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => { resize(); initStars(); });
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
