import React from 'react';
import { useGame } from '../context/GameContext';

const GameHistory: React.FC = () => {
  const { state } = useGame();

  const getMultiplierColor = (multiplier: number, won: boolean) => {
    if (won) return 'text-green-400';
    if (multiplier < 1.5) return 'text-white';
    if (multiplier < 2) return 'text-blue-400';
    if (multiplier < 3) return 'text-green-400';
    if (multiplier < 5) return 'text-yellow-400';
    if (multiplier < 10) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className='bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg'>
      <h2 className='text-xl font-bold text-white mb-3 pb-2 border-b border-gray-800'>
        Game History
      </h2>

      {state.roundHistory.length === 0 ? (
        <div className='text-gray-500 text-center py-4'>
          No games played yet
        </div>
      ) : (
        <div className='space-y-1'>
          {state.roundHistory.map((round, index) => (
            <div
              key={index}
              className='flex justify-between items-center text-sm py-1'
            >
              <div className='text-gray-500'>#{index + 1}</div>
              <div
                className={`font-medium ${getMultiplierColor(
                  round.multiplier,
                  round.won
                )}`}
              >
                {round.multiplier.toFixed(2)}x
              </div>
              <div>
                {round.won ? (
                  <span className='px-2 py-0.5 rounded-full text-xs bg-green-900 text-green-400'>
                    Won
                  </span>
                ) : (
                  <span className='px-2 py-0.5 rounded-full text-xs bg-red-900 text-red-400'>
                    Crashed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHistory;
