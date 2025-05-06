import React, { useEffect, useRef } from 'react';
import { useGame, GamePhase } from '../context/GameContext';

const MultiplierDisplay: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const rocketRef = useRef<HTMLDivElement>(null);

  // Calculate a color based on the multiplier
  const getMultiplierColor = () => {
    if (state.multiplier < 0.9) return 'text-gray-400'; // Below break-even is gray
    if (state.multiplier < 1.1) return 'text-white'; // Near break-even is white
    if (state.multiplier < 1.3) return 'text-blue-400'; // Small profit is blue
    if (state.multiplier < 1.6) return 'text-green-400'; // Medium profit is green
    if (state.multiplier < 1.8) return 'text-yellow-400'; // Good profit is yellow
    return 'text-red-400'; // Near crash point is red - warning!
  };

  // Get animation classes based on phase and multiplier
  const getAnimationClass = () => {
    if (state.phase === GamePhase.CRASHED) return 'animate-scale-crash';
    if (state.phase === GamePhase.RUNNING) {
      if (state.multiplier < 1.0) return '';
      if (state.multiplier < 1.3) return 'animate-glow';
      if (state.multiplier < 1.6) return 'animate-glow animate-pulse';
      return 'animate-glow animate-pulse animate-scale-crash';
    }
    return 'animate-countdown';
  };

  // Calculate rocket size based on multiplier (smaller at start, grows as it goes up)
  const getRocketSize = () => {
    const baseSize = 12; // Base size when multiplier is 0.5
    const maxSize = 24; // Max size when multiplier is 2.0

    // Linear interpolation between baseSize and maxSize based on multiplier
    const multiplierRange = 2.0 - 0.5; // Range from 0.5 to 2.0
    const sizeRange = maxSize - baseSize; // Range from baseSize to maxSize
    const progress = Math.min(
      1,
      Math.max(0, (state.multiplier - 0.5) / multiplierRange)
    );

    return Math.round(baseSize + sizeRange * progress);
  };

  // Draw the rocket path
  useEffect(() => {
    if (!canvasRef.current || !rocketRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rocket = rocketRef.current;

    if (!ctx) return;

    // Set canvas to full size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawPath = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (
        state.phase === GamePhase.RUNNING ||
        state.phase === GamePhase.CRASHED
      ) {
        // Draw path (curved line)
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        // Controls how steep the curve is
        const curveIntensity = 0.6;

        // Create curved path
        ctx.bezierCurveTo(
          canvas.width * 0.3,
          canvas.height * (1 - curveIntensity * 0.5),
          canvas.width * 0.6,
          canvas.height * (1 - curveIntensity),
          canvas.width,
          0
        );

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.stroke();

        // Start progress at 0 for 0.5x multiplier (beginning of path)
        // Normalize progress to be 0 at 0.5x and 1 at 2.0x
        const normalizedProgress = Math.min(
          1,
          Math.max(0, (state.multiplier - 0.5) / 1.5)
        );

        // Position the rocket along the path
        if (state.phase === GamePhase.RUNNING) {
          // Use the progress to calculate the position along the Bezier curve
          // t is the parameter that goes from 0 to 1 along the curve
          const t = normalizedProgress;

          // Calculate the point coordinates using the Bezier formula
          // P = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
          const startX = 0;
          const startY = canvas.height;
          const cp1x = canvas.width * 0.3;
          const cp1y = canvas.height * (1 - curveIntensity * 0.5);
          const cp2x = canvas.width * 0.6;
          const cp2y = canvas.height * (1 - curveIntensity);
          const endX = canvas.width;
          const endY = 0;

          // Calculate Bezier point
          const mt = 1 - t;
          const mt2 = mt * mt;
          const mt3 = mt2 * mt;
          const t2 = t * t;
          const t3 = t2 * t;

          const x =
            mt3 * startX + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * endX;
          const y =
            mt3 * startY + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * endY;

          // Calculate the tangent to determine rotation
          // Tangent = d/dt[B(t)] evaluated at the current t
          // = 3(1-t)^2 * (P1-P0) + 6(1-t)t * (P2-P1) + 3t^2 * (P3-P2)
          const tx =
            3 * mt2 * (cp1x - startX) +
            6 * mt * t * (cp2x - cp1x) +
            3 * t2 * (endX - cp2x);
          const ty =
            3 * mt2 * (cp1y - startY) +
            6 * mt * t * (cp2y - cp1y) +
            3 * t2 * (endY - cp2y);

          // Calculate angle in radians and convert to degrees
          const angle = Math.atan2(ty, tx) * (180 / Math.PI);

          // Update rocket size based on multiplier
          const rocketSize = getRocketSize();

          // Position and rotate the rocket
          rocket.style.display = 'block';
          rocket.style.left = `${x}px`;
          rocket.style.top = `${y}px`;
          rocket.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

          // Update rocket size
          rocket.style.width = `${rocketSize}px`;
          rocket.style.height = `${rocketSize}px`;

          // More intense trail for higher multipliers
          const trailIntensity = Math.min(1, (state.multiplier - 0.5) / 1.0);
          const trailLength = 0.05 + trailIntensity * 0.15; // Trail gets longer at higher multipliers

          // Draw trail
          const gradient = ctx.createLinearGradient(
            x - tx * trailLength,
            y - ty * trailLength,
            x,
            y
          );
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
          gradient.addColorStop(
            0.5,
            `rgba(59, 130, 246, ${0.2 + trailIntensity * 0.3})`
          );
          gradient.addColorStop(
            1,
            `rgba(59, 130, 246, ${0.5 + trailIntensity * 0.4})`
          );

          ctx.beginPath();
          ctx.lineWidth = 3 + trailIntensity * 3; // Line gets thicker at higher multipliers
          ctx.strokeStyle = gradient;
          ctx.moveTo(x - tx * trailLength, y - ty * trailLength);
          ctx.lineTo(x, y);
          ctx.stroke();

          // Add particles for the trail - more particles at higher multipliers
          const particleCount = Math.round(3 + trailIntensity * 7);
          for (let i = 0; i < particleCount; i++) {
            const trailDist = (trailLength / particleCount) * (i + 1);
            const px = x - tx * trailDist;
            const py = y - ty * trailDist;

            // Add jitter
            const jitterX = (Math.random() - 0.5) * 3 * trailIntensity;
            const jitterY = (Math.random() - 0.5) * 3 * trailIntensity;

            // Ensure particle radius is always positive
            const particleRadius = Math.max(0.5, 2 - i * 0.3 * trailIntensity);

            ctx.beginPath();
            ctx.arc(px + jitterX, py + jitterY, particleRadius, 0, Math.PI * 2);

            // Vary the particle colors
            const colors = [
              'rgba(59, 130, 246, 0.9)',
              'rgba(96, 165, 250, 0.8)',
              'rgba(147, 197, 253, 0.7)',
            ];
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
          }
        } else if (state.phase === GamePhase.CRASHED) {
          // Hide the rocket when crashed
          rocket.style.display = 'none';

          // Draw explosion effect at crash point
          const crashProgress = normalizedProgress;

          // Calculate the crash point coordinates using the same Bezier formula
          const t = crashProgress;
          const mt = 1 - t;
          const mt2 = mt * mt;
          const mt3 = mt2 * mt;
          const t2 = t * t;
          const t3 = t2 * t;

          const startX = 0;
          const startY = canvas.height;
          const cp1x = canvas.width * 0.3;
          const cp1y = canvas.height * (1 - curveIntensity * 0.5);
          const cp2x = canvas.width * 0.6;
          const cp2y = canvas.height * (1 - curveIntensity);
          const endX = canvas.width;
          const endY = 0;

          const crashX =
            mt3 * startX + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * endX;
          const crashY =
            mt3 * startY + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * endY;

          // Larger explosion for higher multipliers
          const explosionSize = 20 + normalizedProgress * 15;
          const colors = ['#ff5252', '#ffeb3b', '#ff9800'];

          // Draw explosion particles
          for (let i = 0; i < 15 + Math.round(normalizedProgress * 15); i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * explosionSize;
            const x = crashX + Math.cos(angle) * distance;
            const y = crashY + Math.sin(angle) * distance;

            // Ensure particle radius is always positive
            const particleRadius = Math.max(0.5, Math.random() * 3 + 1);

            ctx.beginPath();
            ctx.arc(x, y, particleRadius, 0, Math.PI * 2);
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fill();
          }

          // Draw explosion glow
          const glow = ctx.createRadialGradient(
            crashX,
            crashY,
            0,
            crashX,
            crashY,
            explosionSize
          );
          glow.addColorStop(0, 'rgba(255, 82, 82, 0.8)');
          glow.addColorStop(0.5, 'rgba(255, 82, 82, 0.3)');
          glow.addColorStop(1, 'rgba(255, 82, 82, 0)');

          ctx.beginPath();
          ctx.fillStyle = glow;
          ctx.arc(crashX, crashY, explosionSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Hide rocket in betting phase
        if (rocket) {
          rocket.style.display = 'none';
        }
      }

      animationFrameRef.current = requestAnimationFrame(drawPath);
    };

    drawPath();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [state.phase, state.multiplier]);

  return (
    <div className='relative w-full h-40 flex items-center justify-center'>
      <canvas
        ref={canvasRef}
        className='absolute inset-0 w-full h-full'
      ></canvas>

      {/* Rocket Element - Positioned Absolutely */}
      <div
        ref={rocketRef}
        className={`absolute ${getMultiplierColor()} z-10`}
        style={{ display: 'none' }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='rocket-icon'
        >
          <path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'></path>
          <path d='m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'></path>
          <path d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0'></path>
          <path d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'></path>
        </svg>
      </div>

      {state.phase === GamePhase.BETTING && (
        <div className='text-center z-10'>
          <div className='text-xl font-bold text-white mb-2'>
            Round starting in
          </div>
          <div className='text-6xl font-bold text-blue-400 animate-countdown'>
            {state.countdown}s
          </div>
        </div>
      )}

      {(state.phase === GamePhase.RUNNING ||
        state.phase === GamePhase.CRASHED) && (
        <div className='text-center z-10 flex flex-col items-center'>
          {state.phase === GamePhase.CRASHED && (
            <div className='mb-2 text-lg font-bold text-red-500 animate-scale-crash'>
              CRASHED AT
            </div>
          )}

          <div
            className={`font-bold text-6xl ${getMultiplierColor()} ${getAnimationClass()} transition-all duration-200`}
          >
            {state.multiplier.toFixed(2)}x
          </div>

          {state.isCashedOut && state.hasBet && (
            <div className='mt-2 text-lg font-bold text-green-400 animate-win-pop'>
              + {state.winAmount.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiplierDisplay;
