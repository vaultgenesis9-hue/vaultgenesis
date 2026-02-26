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

    const drawStickMan = (x: number, y: number, walkPhase: number, carryingBox: boolean) => {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      // Head
      const headRadius = 10;
      ctx.beginPath();
      ctx.arc(x, y - 50, headRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Body vertical position changes based on walk phase (up and down motion)
      const bodyY = y - 40 + Math.sin(walkPhase * Math.PI) * 3;

      // Body
      ctx.beginPath();
      ctx.moveTo(x, y - 50 + headRadius);
      ctx.lineTo(x, bodyY + 20);
      ctx.stroke();

      // Calculate leg positions based on walk phase
      // Phase 0: Contact (legs spread)
      // Phase 0.25: Down (both legs bent)
      // Phase 0.5: Passing (one leg forward, one back)
      // Phase 0.75: Up (pushing off)

      let leftLegX, leftLegY, rightLegX, rightLegY;

      if (walkPhase < 0.25) {
        // Contact to Down
        const t = walkPhase / 0.25;
        leftLegX = x - 15 + t * 5;
        leftLegY = y + 15 - t * 8;
        rightLegX = x + 15 - t * 5;
        rightLegY = y + 15 - t * 8;
      } else if (walkPhase < 0.5) {
        // Down to Passing
        const t = (walkPhase - 0.25) / 0.25;
        leftLegX = x - 10 + t * 25;
        leftLegY = y + 7 - t * 12;
        rightLegX = x + 20 - t * 25;
        rightLegY = y + 7 - t * 12;
      } else if (walkPhase < 0.75) {
        // Passing to Up
        const t = (walkPhase - 0.5) / 0.25;
        leftLegX = x + 15 - t * 20;
        leftLegY = y - 5 + t * 15;
        rightLegX = x - 5 + t * 20;
        rightLegY = y - 5 + t * 15;
      } else {
        // Up to Contact
        const t = (walkPhase - 0.75) / 0.25;
        leftLegX = x - 5 + t * 10;
        leftLegY = y + 10 - t * 8;
        rightLegX = x + 15 - t * 10;
        rightLegY = y + 10 - t * 8;
      }

      // Left leg (with knee bend)
      ctx.beginPath();
      ctx.moveTo(x, bodyY + 20);
      const leftKneeX = (x + leftLegX) / 2 + Math.sin(walkPhase * Math.PI) * 5;
      const leftKneeY = (bodyY + 20 + leftLegY) / 2 + 8;
      ctx.lineTo(leftKneeX, leftKneeY);
      ctx.lineTo(leftLegX, leftLegY);
      ctx.stroke();

      // Right leg (with knee bend)
      ctx.beginPath();
      ctx.moveTo(x, bodyY + 20);
      const rightKneeX = (x + rightLegX) / 2 - Math.sin(walkPhase * Math.PI) * 5;
      const rightKneeY = (bodyY + 20 + rightLegY) / 2 + 8;
      ctx.lineTo(rightKneeX, rightKneeY);
      ctx.lineTo(rightLegX, rightLegY);
      ctx.stroke();

      // Arms swing opposite to legs
      const armSwing = Math.sin(walkPhase * Math.PI) * 15;

      // Left arm
      ctx.beginPath();
      ctx.moveTo(x, bodyY + 5);
      ctx.lineTo(x - armSwing, bodyY + 15);
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(x, bodyY + 5);
      ctx.lineTo(x + armSwing, bodyY + 15);
      ctx.stroke();

      // Draw treasure box if carrying (white outline only)
      if (carryingBox) {
        const boxX = x + armSwing - 8;
        const boxY = bodyY + 10;
        const boxWidth = 16;
        const boxHeight = 14;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
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
      const vaultWidth = 40;
      const vaultHeight = 50;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      // Vault body
      ctx.strokeRect(x - vaultWidth / 2, y - vaultHeight / 2, vaultWidth, vaultHeight);

      // Vault door circle
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Vault lock (small circle in center)
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    };

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cycleTime = 200; // Animation cycle in frames
      const normalizedTime = time % cycleTime;
      const walkPhase = (normalizedTime % 100) / 100; // 0 to 1 for walk cycle

      // Phase 1: Walk to treasure (0-50 frames)
      if (normalizedTime < 50) {
        const progress = normalizedTime / 50;
        const stickManX = 60 + progress * 120;
        drawStickMan(stickManX, 140, walkPhase, false);
      }
      // Phase 2: Pick up treasure and walk back (50-150 frames)
      else if (normalizedTime < 150) {
        const progress = (normalizedTime - 50) / 100;
        const stickManX = 180 - progress * 120;
        drawStickMan(stickManX, 140, walkPhase, true);
      }
      // Phase 3: Back at vault (150-200 frames)
      else {
        drawStickMan(60, 140, walkPhase, false);
      }

      // Draw vault
      drawVault(55, 140);

      // Draw treasure pile (starting position)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(200, 155);
      ctx.lineTo(215, 155);
      ctx.lineTo(207.5, 140);
      ctx.closePath();
      ctx.stroke();

      time++;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex justify-center py-6">
      <div className="flex flex-col items-center gap-0">
        <canvas
          ref={canvasRef}
          width={300}
          height={180}
          className="bg-transparent"
        />
        <div className="w-80 h-px bg-white/20"></div>
      </div>
    </div>
  );
}
