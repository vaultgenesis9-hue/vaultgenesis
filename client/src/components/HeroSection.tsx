import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

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
    let rotationX = 0.3;
    let rotationY = 0;
    let rotationZ = 0;
    let time = 0;

    const particles: Particle[] = [];
    const shootingStars: ShootingStar[] = [];
    const rockets: Rocket[] = [];

    // Create initial particles (stars)
    const createStars = () => {
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight * 0.7,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.6 + 0.2,
          life: 100,
        });
      }
    };

    createStars();

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

    // 3D point structure
    interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    interface Point2D {
      x: number;
      y: number;
      z: number;
    }

    // Generate sphere vertices for the sun
    const generateSphere = (radius: number, segments: number): Point3D[] => {
      const points: Point3D[] = [];
      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI;
        for (let j = 0; j <= segments; j++) {
          const theta = (j / segments) * Math.PI * 2;
          points.push({
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.sin(phi) * Math.sin(theta),
            z: radius * Math.cos(phi),
          });
        }
      }
      return points;
    };

    // Rotation matrices
    const rotateX = (point: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: point.x,
        y: point.y * cos - point.z * sin,
        z: point.y * sin + point.z * cos,
      };
    };

    const rotateY = (point: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: point.x * cos + point.z * sin,
        y: point.y,
        z: -point.x * sin + point.z * cos,
      };
    };

    const rotateZ = (point: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos,
        z: point.z,
      };
    };

    // Project 3D point to 2D
    const project = (point: Point3D, perspective: number): Point2D => {
      const scale = perspective / (perspective + point.z);
      return {
        x: point.x * scale,
        y: point.y * scale,
        z: point.z,
      };
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
        
        // Update shooting star
        star.x += star.vx;
        star.y += star.vy;
        star.life--;
        star.opacity = (star.life / 100) * 0.8;

        // Draw shooting star trail
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

        // Remove dead shooting stars
        if (star.life <= 0) {
          shootingStars.splice(i, 1);
        }
      }

      // Draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        
        // Update rocket
        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
        rocket.life--;

        // Draw rocket
        drawRocket(rocket.x, rocket.y, rocket.angle);

        // Draw rocket glow
        const glowGradient = ctx.createRadialGradient(rocket.x, rocket.y, 0, rocket.x, rocket.y, 40);
        glowGradient.addColorStop(0, `rgba(255, 150, 0, ${0.3 * (rocket.life / rocket.maxLife)})`);
        glowGradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 40, 0, Math.PI * 2);
        ctx.fill();

        // Remove dead rockets
        if (rocket.life <= 0) {
          rockets.splice(i, 1);
        }
      }

      // Create new shooting stars and rockets
      createShootingStar();
      createRocket();
    };

    // Draw 3D sun
    const draw3DSun = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const sunX = width * 0.75;
      const sunY = height * 0.25;
      const sunRadius = Math.min(width, height) * 0.15;
      const perspective = 800;

      // Generate sun sphere
      let sunVertices = generateSphere(sunRadius, 16);
      
      // Apply rotations
      sunVertices = sunVertices.map((v) => {
        let p = rotateX(v, rotationX);
        p = rotateY(p, rotationY);
        p = rotateZ(p, rotationZ);
        return p;
      });

      // Project to 2D
      const projectedSun = sunVertices.map((v) => {
        const p = project(v, perspective);
        return {
          x: sunX + p.x,
          y: sunY + p.y,
          z: p.z,
        };
      });

      // Draw sun surface with gradient
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 1.2);
      sunGradient.addColorStop(0, "rgba(255, 220, 0, 0.9)");
      sunGradient.addColorStop(0.4, "rgba(255, 150, 0, 0.8)");
      sunGradient.addColorStop(0.8, "rgba(255, 100, 0, 0.6)");
      sunGradient.addColorStop(1, "rgba(255, 50, 0, 0)");

      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw sun core
      const coreGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 0.6);
      coreGradient.addColorStop(0, "rgba(255, 255, 200, 0.8)");
      coreGradient.addColorStop(1, "rgba(255, 200, 0, 0.4)");
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Draw sun flares
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.002;
        const flareX = sunX + Math.cos(angle) * sunRadius * 1.3;
        const flareY = sunY + Math.sin(angle) * sunRadius * 1.3;
        const flareGradient = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, sunRadius * 0.3);
        flareGradient.addColorStop(0, "rgba(255, 200, 0, 0.6)");
        flareGradient.addColorStop(1, "rgba(255, 100, 0, 0)");
        ctx.fillStyle = flareGradient;
        ctx.beginPath();
        ctx.arc(flareX, flareY, sunRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update rotations
      rotationY += 0.005;
      rotationX = 0.2 + Math.sin(rotationY * 0.5) * 0.15;
      rotationZ += 0.002;
    };

    // Draw vault
    const draw3DVault = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.12;
      const depth = radius * 0.8;
      const perspective = 500;

      // Generate hexagon
      interface Point3D {
        x: number;
        y: number;
        z: number;
      }

      const generateHexagon = (radius: number, depth: number): Point3D[] => {
        const points: Point3D[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            z: depth,
          });
        }
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            z: -depth,
          });
        }
        return points;
      };

      let vertices = generateHexagon(radius, depth);
      
      vertices = vertices.map((v) => {
        let p = rotateX(v, rotationX);
        p = rotateY(p, rotationY);
        p = rotateZ(p, rotationZ);
        return p;
      });

      const projected = vertices.map((v) => {
        const p = project(v, perspective);
        return {
          x: centerX + p.x,
          y: centerY + p.y,
          z: p.z,
        };
      });

      // Draw vault with warm colors (orange/yellow instead of green)
      ctx.strokeStyle = "rgba(255, 150, 0, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const p = projected[i + 6];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const front = projected[i];
        const back = projected[i + 6];
        const gradient = ctx.createLinearGradient(front.x, front.y, back.x, back.y);
        gradient.addColorStop(0, "rgba(255, 200, 0, 0.8)");
        gradient.addColorStop(1, "rgba(255, 100, 0, 0.3)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(front.x, front.y);
        ctx.lineTo(back.x, back.y);
        ctx.stroke();
      }

      ctx.shadowColor = "rgba(255, 150, 0, 0.8)";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "rgba(255, 200, 0, 1)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const p = projected[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      const innerRadius = radius * 0.6;
      let innerVertices = generateHexagon(innerRadius, depth * 0.5);
      innerVertices = innerVertices.map((v) => {
        let p = rotateX(v, rotationX);
        p = rotateY(p, rotationY);
        p = rotateZ(p, rotationZ);
        return p;
      });

      const projectedInner = innerVertices.map((v) => {
        const p = project(v, perspective);
        return {
          x: centerX + p.x,
          y: centerY + p.y,
          z: p.z,
        };
      });

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 150, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const p = projectedInner[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      const keyholeFront = project({ x: 0, y: 0, z: depth }, perspective);
      const keyholeGlow = ctx.createRadialGradient(
        centerX + keyholeFront.x,
        centerY + keyholeFront.y,
        0,
        centerX + keyholeFront.x,
        centerY + keyholeFront.y,
        radius * 0.25
      );
      keyholeGlow.addColorStop(0, "rgba(255, 200, 0, 0.9)");
      keyholeGlow.addColorStop(0.7, "rgba(255, 150, 0, 0.4)");
      keyholeGlow.addColorStop(1, "rgba(255, 100, 0, 0)");

      ctx.fillStyle = keyholeGlow;
      ctx.shadowColor = "rgba(255, 150, 0, 1)";
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(centerX + keyholeFront.x, centerY + keyholeFront.y, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f0f1e";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(centerX + keyholeFront.x, centerY + keyholeFront.y, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      drawBackground();
      draw3DSun();
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
      {/* Animated Canvas with Space Background + 3D Sun + 3D Vault */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

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
