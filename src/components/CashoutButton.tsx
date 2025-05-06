import React from 'react';
import { useGame, GamePhase } from '../context/GameContext';

const CashoutButton: React.FC = () => {
  const { state, cashOut } = useGame();

  const isActive =
    state.phase === GamePhase.RUNNING && state.hasBet && !state.isCashedOut;

  // Calculate the potential win
  const potentialWin = state.currentBet * state.multiplier;

  return (
    <button
      onClick={cashOut}
      disabled={!isActive}
      className={`
        w-full h-12 rounded-md font-bold text-lg uppercase 
        transition-all duration-200 transform hover:scale-105
        flex flex-col items-center justify-center relative
        ${
          isActive
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 border border-green-400 animate-cash-pulse'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }
      `}
    >
      {/* Add glowing effect for active button */}
      {isActive && (
        <div className='absolute inset-0 -z-10 bg-green-500 blur-md opacity-30 rounded-md'></div>
      )}

      <span>Cash Out</span>
      {isActive && (
        <span className='text-xs font-normal animate-pulse'>
          {potentialWin.toFixed(2)}
        </span>
      )}
    </button>
  );
};

export default CashoutButton;
