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
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg w-full max-w-sm">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Game History</h2>
      
      <div className="space-y-2">
        {state.roundHistory.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No games played yet</div>
        ) : (
          <>
            <div className="grid grid-cols-5 text-sm text-gray-500">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Multiplier</div>
              <div className="col-span-2">Result</div>
            </div>
            
            {state.roundHistory.map((round, index) => (
              <div key={index} className="grid grid-cols-5 text-sm border-b border-gray-800 py-2">
                <div className="col-span-1 text-gray-500">{index + 1}</div>
                <div className={`col-span-2 font-medium ${getMultiplierColor(round.multiplier, round.won)}`}>
                  {round.multiplier.toFixed(2)}x
                </div>
                <div className="col-span-2">
                  {round.won ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-400">Won</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-900 text-red-400">Crashed</span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default GameHistory;