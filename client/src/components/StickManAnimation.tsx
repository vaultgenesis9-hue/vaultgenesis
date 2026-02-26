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
      const scale = 1.5;
      const headRadius = 15 * scale;
      const bodyHeight = 40 * scale;
      const limbLength = 30 * scale;

      // Head
      ctx.beginPath();
      ctx.arc(x, y - headRadius, headRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
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

      // Draw treasure box if carrying
      if (carryingBox) {
        const boxX = rightArmX - 15;
        const boxY = rightArmY - 20;
        const boxWidth = 30;
        const boxHeight = 25;

        // Box
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Treasure details
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(boxX + 5, boxY + 5, 8, 8);
        ctx.fillRect(boxX + 17, boxY + 5, 8, 8);
        ctx.fillRect(boxX + 5, boxY + 15, 8, 8);
        ctx.fillRect(boxX + 17, boxY + 15, 8, 8);
      }
    };

    const drawVault = (x: number, y: number) => {
      const vaultWidth = 60;
      const vaultHeight = 70;

      // Vault body
      ctx.fillStyle = '#808080';
      ctx.fillRect(x - vaultWidth / 2, y - vaultHeight / 2, vaultWidth, vaultHeight);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - vaultWidth / 2, y - vaultHeight / 2, vaultWidth, vaultHeight);

      // Vault door
      ctx.fillStyle = '#404040';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vault lock
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cycleTime = 200; // Animation cycle in frames
      const normalizedTime = time % cycleTime;

      // Phase 1: Walk to treasure (0-50 frames)
      if (normalizedTime < 50) {
        const progress = normalizedTime / 50;
        const stickManX = 100 + progress * 150;
        drawStickMan(stickManX, 200, false);
      }
      // Phase 2: Pick up treasure and walk back (50-150 frames)
      else if (normalizedTime < 150) {
        const progress = (normalizedTime - 50) / 100;
        const stickManX = 250 - progress * 150;
        drawStickMan(stickManX, 200, true);
      }
      // Phase 3: Load into vault (150-200 frames)
      else {
        drawStickMan(100, 200, false);
      }

      // Draw vault
      drawVault(80, 200);

      // Draw treasure pile (starting position)
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(270, 220);
      ctx.lineTo(290, 220);
      ctx.lineTo(280, 200);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
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
          className="border border-white/10 rounded-lg bg-black/30"
        />
        <p className="text-gray-500 text-xs uppercase tracking-wider">Secure Treasury System</p>
      </div>
    </div>
  );
}
