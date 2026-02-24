import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import RealisticSun from "./RealisticSun";

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  life: number;
  maxLife: number;
}

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let animationId: number;
    let time = 0;

    const shootingStars: ShootingStar[] = [];
    const rockets: Rocket[] = [];
    const particles: { x: number; y: number; size: number; opacity: number }[] = [];

    // Create initial stars
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight * 0.7,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    // Create a shooting star periodically
    const createShootingStar = () => {
      if (Math.random() < 0.02) {
        shootingStars.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight * 0.6,
          vx: Math.random() * 3 + 2,
          vy: Math.random() * 2 - 1,
          length: Math.random() * 80 + 40,
          opacity: 1,
          life: Math.random() * 80 + 40,
        });
      }
    };

    // Create a rocket periodically
    const createRocket = () => {
      if (Math.random() < 0.01) {
        rockets.push({
          x: Math.random() * canvas.offsetWidth,
          y: canvas.offsetHeight * 0.8,
          vx: Math.random() * 0.5 + 0.3,
          vy: -Math.random() * 1.5 - 1,
          angle: Math.atan2(-Math.random() * 1.5 - 1, Math.random() * 0.5 + 0.3),
          life: 300,
          maxLife: 300,
        });
      }
    };

    // Draw rocket
    const drawRocket = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Rocket body
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(0, -8, 20, 16);

      // Rocket nose
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(20, -8);
      ctx.lineTo(28, 0);
      ctx.lineTo(20, 8);
      ctx.closePath();
      ctx.fill();

      // Rocket flame
      ctx.fillStyle = "rgba(255, 100, 0, 0.8)";
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-8, -10);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-8, 10);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(-4, -7);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-4, 7);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // Draw space background
    const drawBackground = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Gradient background (dark grey to black)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "#2a2a3e");
      bgGradient.addColorStop(0.3, "#1a1a2e");
      bgGradient.addColorStop(1, "#0f0f1e");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Nebula effect
      const nebula = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, width * 0.6);
      nebula.addColorStop(0, "rgba(255, 150, 0, 0.15)");
      nebula.addColorStop(0.5, "rgba(255, 100, 0, 0.05)");
      nebula.addColorStop(1, "rgba(255, 100, 0, 0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      // Draw static stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      for (const star of particles) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        
        star.x += star.vx;
        star.y += star.vy;
        star.life--;
        star.opacity = (star.life / 100) * 0.8;

        const gradient = ctx.createLinearGradient(
          star.x - star.vx * 10,
          star.y - star.vy * 10,
          star.x,
          star.y
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(255, 200, 100, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x - star.vx * star.length, star.y - star.vy * star.length);
        ctx.lineTo(star.x, star.y);
        ctx.stroke();

        if (star.life <= 0) {
          shootingStars.splice(i, 1);
        }
      }

      // Draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        
        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
        rocket.life--;

        drawRocket(rocket.x, rocket.y, rocket.angle);

        const glowGradient = ctx.createRadialGradient(rocket.x, rocket.y, 0, rocket.x, rocket.y, 40);
        glowGradient.addColorStop(0, `rgba(255, 150, 0, ${0.3 * (rocket.life / rocket.maxLife)})`);
        glowGradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 40, 0, Math.PI * 2);
        ctx.fill();

        if (rocket.life <= 0) {
          rockets.splice(i, 1);
        }
      }

      createShootingStar();
      createRocket();
    };

    // Draw vault (simplified, centered)
    const draw3DVault = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.08;

      // Vault hexagon outline
      ctx.strokeStyle = "rgba(255, 200, 0, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Vault glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
      glowGradient.addColorStop(0, "rgba(255, 200, 0, 0.3)");
      glowGradient.addColorStop(1, "rgba(255, 100, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Keyhole
      ctx.fillStyle = "rgba(255, 200, 0, 0.8)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      drawBackground();
      draw3DVault();
      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden pt-20">
      {/* Canvas for background, stars, rockets, and vault */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Realistic 3D Sun using Three.js */}
      <div className="absolute top-20 right-20 w-64 h-64 z-5">
        <RealisticSun />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container text-center px-4">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-7xl md:text-8xl font-black mb-4 text-foreground tracking-tighter">
            VAULT
          </h1>
          <h1 className="text-7xl md:text-8xl font-black text-foreground tracking-tighter">
            GENESIS
          </h1>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Launch your meme coin, stake tokens, and trade with AI-powered bots
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/token-creator">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-accent font-bold px-8 py-6 text-lg"
            >
              CREATE TOKEN
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold px-8 py-6 text-lg"
          >
            CONNECT WALLET
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>TOKENS LAUNCHED: 314+</p>
          <p>TOTAL VOLUME: $2.4M+</p>
          <p>ACTIVE USERS: 1,200+</p>
        </div>
      </div>
    </section>
  );
}
