import { useEffect, useRef } from 'react';

export default function StickManAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const drawStickMan = (x: number, y: number, carryingBox: boolean) => {
      const scale = 1.2;
      const headRadius = 12 * scale;
      const bodyHeight = 35 * scale;
      const limbLength = 25 * scale;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      // Head
      ctx.beginPath();
      ctx.arc(x, y - headRadius, headRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(x, y - headRadius);
      ctx.lineTo(x, y - headRadius + bodyHeight);
      ctx.stroke();

      // Left arm
      const leftArmX = x - Math.sin(time * 0.05) * limbLength * 0.7;
      const leftArmY = y - headRadius + bodyHeight * 0.3 + Math.cos(time * 0.05) * limbLength * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y - headRadius + bodyHeight * 0.3);
      ctx.lineTo(leftArmX, leftArmY);
      ctx.stroke();

      // Right arm
      const rightArmX = x + Math.sin(time * 0.05) * limbLength * 0.7;
      const rightArmY = y - headRadius + bodyHeight * 0.3 + Math.cos(time * 0.05) * limbLength * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y - headRadius + bodyHeight * 0.3);
      ctx.lineTo(rightArmX, rightArmY);
      ctx.stroke();

      // Left leg
      const leftLegX = x - Math.sin(time * 0.08) * limbLength * 0.6;
      const leftLegY = y - headRadius + bodyHeight + Math.abs(Math.cos(time * 0.08)) * limbLength * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y - headRadius + bodyHeight);
      ctx.lineTo(leftLegX, leftLegY);
      ctx.stroke();

      // Right leg
      const rightLegX = x + Math.sin(time * 0.08) * limbLength * 0.6;
      const rightLegY = y - headRadius + bodyHeight + Math.abs(Math.cos(time * 0.08)) * limbLength * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y - headRadius + bodyHeight);
      ctx.lineTo(rightLegX, rightLegY);
      ctx.stroke();

      // Draw treasure box if carrying (white outline only)
      if (carryingBox) {
        const boxX = rightArmX - 12;
        const boxY = rightArmY - 18;
        const boxWidth = 24;
        const boxHeight = 20;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Simple X pattern inside box
        ctx.beginPath();
        ctx.moveTo(boxX + 2, boxY + 2);
        ctx.lineTo(boxX + boxWidth - 2, boxY + boxHeight - 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX + boxWidth - 2, boxY + 2);
        ctx.lineTo(boxX + 2, boxY + boxHeight - 2);
        ctx.stroke();
      }
    };

    const drawVault = (x: number, y: number) => {
      const vaultWidth = 50;
      const vaultHeight = 60;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      // Vault body
      ctx.strokeRect(x - vaultWidth / 2, y - vaultHeight / 2, vaultWidth, vaultHeight);

      // Vault door circle
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Vault lock (small circle in center)
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.stroke();
    };

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cycleTime = 200; // Animation cycle in frames
      const normalizedTime = time % cycleTime;

      // Phase 1: Walk to treasure (0-50 frames)
      if (normalizedTime < 50) {
        const progress = normalizedTime / 50;
        const stickManX = 80 + progress * 140;
        drawStickMan(stickManX, 160, false);
      }
      // Phase 2: Pick up treasure and walk back (50-150 frames)
      else if (normalizedTime < 150) {
        const progress = (normalizedTime - 50) / 100;
        const stickManX = 220 - progress * 140;
        drawStickMan(stickManX, 160, true);
      }
      // Phase 3: Back at vault (150-200 frames)
      else {
        drawStickMan(80, 160, false);
      }

      // Draw vault
      drawVault(70, 160);

      // Draw treasure pile (starting position)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(230, 175);
      ctx.lineTo(250, 175);
      ctx.lineTo(240, 155);
      ctx.closePath();
      ctx.stroke();

      time++;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <canvas
          ref={canvasRef}
          width={350}
          height={220}
          className="border border-white/10 bg-black/30"
        />
        <p className="text-gray-500 text-xs uppercase tracking-wider">Secure Treasury System</p>
      </div>
    </div>
  );
}
