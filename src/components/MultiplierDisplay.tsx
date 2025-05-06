import React, { useEffect, useRef } from 'react';
import { useGame, GamePhase } from '../context/GameContext';
import { Rocket } from 'lucide-react';

const MultiplierDisplay: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Calculate a color based on the multiplier
  const getMultiplierColor = () => {
    if (state.multiplier < 1.5) return 'text-white';
    if (state.multiplier < 2) return 'text-blue-400';
    if (state.multiplier < 3) return 'text-green-400';
    if (state.multiplier < 5) return 'text-yellow-400';
    if (state.multiplier < 10) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get the appropriate size based on multiplier
  const getMultiplierSize = () => {
    if (state.multiplier < 1.5) return 'text-6xl';
    if (state.multiplier < 3) return 'text-7xl';
    if (state.multiplier < 5) return 'text-8xl';
    return 'text-9xl';
  };

  // Draw the rocket path
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
      
      if (state.phase === GamePhase.RUNNING || state.phase === GamePhase.CRASHED) {
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
        
        // Calculate position along curve based on multiplier
        // The higher the multiplier, the further along the path
        const progress = Math.min(1, Math.log(state.multiplier) / Math.log(15));
        
        // Draw animated dots along the path
        if (state.phase === GamePhase.RUNNING) {
          for (let i = 0; i < 10; i++) {
            const dotProgress = Math.max(0, progress - (i * 0.03));
            if (dotProgress <= 0) continue;
            
            const t = dotProgress;
            const x = canvas.width * t;
            const y = canvas.height * (1 - curveIntensity * t);
            
            ctx.beginPath();
            ctx.arc(x, y, 3 - (i * 0.2), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${0.9 - i * 0.1})`;
            ctx.fill();
          }
        }
        
        // Draw crash effect
        if (state.phase === GamePhase.CRASHED) {
          // Explosion effect at crash point
          const explosionSize = 30;
          const colors = ['#ff5252', '#ffeb3b', '#ff9800'];
          
          const crashProgress = Math.min(1, Math.log(state.multiplier) / Math.log(15));
          const crashX = canvas.width * crashProgress;
          const crashY = canvas.height * (1 - curveIntensity * crashProgress);
          
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * explosionSize;
            const x = crashX + Math.cos(angle) * distance;
            const y = crashY + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fill();
          }
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
    <div className="relative w-full h-80 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
      
      {state.phase === GamePhase.BETTING && (
        <div className="text-center z-10">
          <div className="text-3xl font-bold text-white mb-4">Round starting in</div>
          <div className="text-7xl font-bold text-blue-400">{state.countdown}s</div>
        </div>
      )}
      
      {(state.phase === GamePhase.RUNNING || state.phase === GamePhase.CRASHED) && (
        <div className="text-center z-10 flex flex-col items-center">
          {state.phase === GamePhase.CRASHED ? (
            <div className="mb-4 text-2xl font-bold text-red-500 animate-pulse">
              CRASHED AT
            </div>
          ) : (
            <Rocket 
              className={`mb-4 ${getMultiplierColor()} animate-bounce`} 
              size={48} 
            />
          )}
          
          <div className={`font-bold ${getMultiplierSize()} ${getMultiplierColor()} transition-all duration-200`}>
            {state.multiplier.toFixed(2)}x
          </div>
          
          {state.isCashedOut && state.hasBet && (
            <div className="mt-4 text-2xl font-bold text-green-400 animate-pulse">
              + {state.winAmount.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiplierDisplay;