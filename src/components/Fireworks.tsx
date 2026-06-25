import { useEffect, useRef } from 'react';

// Classic 8-bit palette subset for fireworks bursts
const COLORS = ['#ffffff', '#000000', '#ff0000', '#00cc00', '#0000ff', '#ffff00', '#ff8800'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

function burst(x: number, y: number): Particle[] {
  const count = 28;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: 1,
      size: 4,
    };
  });
}

interface FireworksProps {
  onDone: () => void;
}

export function Fireworks({ onDone }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    let particles: Particle[] = [];
    let frameId: number;
    let elapsed = 0;
    let lastBurst = 0;

    const DURATION = 5000; // ms
    const BURST_INTERVAL = 500; // ms between bursts
    const start = performance.now();

    function frame(now: number) {
      elapsed = now - start;
      // Spawn a new burst every interval
      if (elapsed - lastBurst > BURST_INTERVAL && elapsed < DURATION - 600) {
        const x = 60 + Math.random() * (canvas!.width - 120);
        const y = 60 + Math.random() * (canvas!.height * 0.6);
        particles.push(...burst(x, y));
        lastBurst = elapsed;
      }

      // Clear with slight fade for trails
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Update and draw particles
      particles = particles.filter(p => p.life > 0.05);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.life -= 0.018;
        p.vx *= 0.98;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        // Chunky pixel squares — classic 8-bit look
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;

      if (elapsed < DURATION) {
        frameId = requestAnimationFrame(frame);
      } else {
        // Final clear
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        onDone();
      }
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [onDone]);

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />;
}
