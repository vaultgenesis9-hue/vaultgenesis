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
    let rotation = 0;

    const drawVault = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const size = Math.min(width, height) * 0.15;

      // Clear canvas with black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Draw glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 2);
      gradient.addColorStop(0, "rgba(0, 255, 0, 0.15)");
      gradient.addColorStop(1, "rgba(0, 255, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw animated vault
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Outer hexagon with glow
      ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner hexagon
      ctx.strokeStyle = "rgba(0, 255, 0, 0.4)";
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = (size * 0.6) * Math.cos(angle);
        const y = (size * 0.6) * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Center keyhole with glow
      ctx.fillStyle = "rgba(0, 255, 0, 0.9)";
      ctx.shadowColor = "rgba(0, 255, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      rotation += 0.008;
      animationId = requestAnimationFrame(drawVault);
    };

    drawVault();

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
      {/* Animated Vault Canvas */}
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
