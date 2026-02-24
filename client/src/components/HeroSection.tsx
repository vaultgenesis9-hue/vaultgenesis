import { useEffect, useRef } from "react";
import RealisticSun from "./RealisticSun";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Draw pure black to grey gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a0a0a");
      gradient.addColorStop(0.5, "#1a1a1a");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      for (let i = 0; i < 100; i++) {
        const x = (i * 73.5) % canvas.width;
        const y = (i * 41.7) % canvas.height;
        const size = Math.sin(i * 0.1) * 0.5 + 0.5;
        ctx.fillRect(x, y, size, size);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* 3D Sun and Rocket */}
      <div className="absolute bottom-0 right-0 w-96 h-96 z-10">
        <RealisticSun />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        {/* Main Title */}
        <h1 className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight">
          VAULT<br />GENESIS
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl">
          Launch your meme coin, stake tokens, and trade with AI-powered bots
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition uppercase text-sm">
            CREATE TOKEN
          </button>
          <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded hover:bg-white/10 transition uppercase text-sm">
            CONNECT WALLET
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 text-gray-400 text-sm space-y-2">
          <p>TOKENS LAUNCHED: 314+</p>
          <p>TOTAL VOLUME: $2.4M+</p>
        </div>
      </div>
    </div>
  );
}
