import React, { useEffect, useRef } from 'react';
import { RoomId } from '../../types/game';

interface AtmosphereCanvasProps {
  roomId: RoomId;
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({
  roomId,
  reducedMotion = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle themes per room
    const particleCount = roomId === 'room2_frost' ? 65 : 45;
    const particles: Particle[] = [];

    const getRoomColor = () => {
      switch (roomId) {
        case 'room1_arrival':
          return 'rgba(0, 229, 255, ';
        case 'room2_frost':
          return 'rgba(186, 230, 253, ';
        case 'room3_server':
          return 'rgba(168, 85, 247, ';
        case 'room4_mirror':
          return 'rgba(236, 72, 153, ';
        case 'room5_protocol':
          return 'rgba(234, 179, 8, ';
        default:
          return 'rgba(56, 189, 248, ';
      }
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: roomId === 'room2_frost' ? Math.random() * 0.8 + 0.2 : (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.5 + 0.1,
        color: getRoomColor()
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [roomId, reducedMotion]);

  if (reducedMotion) return null;

  return <canvas ref={canvasRef} className="atmosphere-canvas" />;
};
