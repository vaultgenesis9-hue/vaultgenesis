import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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

    // Generate hexagon vertices in 3D
    const generateHexagon = (radius: number, depth: number): Point3D[] => {
      const points: Point3D[] = [];
      
      // Front face
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
          z: depth,
        });
      }
      
      // Back face
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

    // Draw 3D vault
    const draw3DVault = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.12;
      const depth = radius * 0.8;
      const perspective = 500;

      // Clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Draw glow background
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 3);
      glowGradient.addColorStop(0, "rgba(0, 255, 0, 0.2)");
      glowGradient.addColorStop(0.5, "rgba(0, 255, 0, 0.05)");
      glowGradient.addColorStop(1, "rgba(0, 255, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Generate and transform vertices
      let vertices = generateHexagon(radius, depth);
      
      // Apply rotations
      vertices = vertices.map((v) => {
        let p = rotateX(v, rotationX);
        p = rotateY(p, rotationY);
        p = rotateZ(p, rotationZ);
        return p;
      });

      // Project to 2D
      const projected = vertices.map((v) => {
        const p = project(v, perspective);
        return {
          x: centerX + p.x,
          y: centerY + p.y,
          z: p.z,
        };
      });

      // Draw back face (darker)
      ctx.strokeStyle = "rgba(0, 200, 0, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const p = projected[i + 6];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw connecting edges with gradient
      for (let i = 0; i < 6; i++) {
        const front = projected[i];
        const back = projected[i + 6];
        
        // Create gradient for depth effect
        const gradient = ctx.createLinearGradient(front.x, front.y, back.x, back.y);
        gradient.addColorStop(0, "rgba(0, 255, 0, 0.8)");
        gradient.addColorStop(1, "rgba(0, 150, 0, 0.3)");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(front.x, front.y);
        ctx.lineTo(back.x, back.y);
        ctx.stroke();
      }

      // Draw front face (brighter with glow)
      ctx.shadowColor = "rgba(0, 255, 0, 0.8)";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "rgba(0, 255, 0, 1)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const p = projected[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw inner hexagon for depth
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
      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const p = projectedInner[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw keyhole in center with 3D effect
      const keyholeFront = project({ x: 0, y: 0, z: depth }, perspective);
      const keyholeBack = project({ x: 0, y: 0, z: -depth }, perspective);

      // Keyhole glow
      const keyholeGlow = ctx.createRadialGradient(
        centerX + keyholeFront.x,
        centerY + keyholeFront.y,
        0,
        centerX + keyholeFront.x,
        centerY + keyholeFront.y,
        radius * 0.25
      );
      keyholeGlow.addColorStop(0, "rgba(0, 255, 0, 0.9)");
      keyholeGlow.addColorStop(0.7, "rgba(0, 255, 0, 0.4)");
      keyholeGlow.addColorStop(1, "rgba(0, 255, 0, 0)");

      ctx.fillStyle = keyholeGlow;
      ctx.shadowColor = "rgba(0, 255, 0, 1)";
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(centerX + keyholeFront.x, centerY + keyholeFront.y, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Inner keyhole (black)
      ctx.fillStyle = "#000000";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(centerX + keyholeFront.x, centerY + keyholeFront.y, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Update rotations for smooth animation
      rotationY += 0.01;
      rotationX = 0.3 + Math.sin(rotationY * 0.5) * 0.2;
      rotationZ += 0.003;

      animationId = requestAnimationFrame(draw3DVault);
    };

    draw3DVault();

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
      {/* Animated 3D Vault Canvas */}
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
