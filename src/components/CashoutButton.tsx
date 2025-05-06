import React from 'react';
import { useGame, GamePhase } from '../context/GameContext';

const CashoutButton: React.FC = () => {
  const { state, cashOut } = useGame();
  
  const isActive = state.phase === GamePhase.RUNNING && state.hasBet && !state.isCashedOut;
  
  // Calculate the potential win
  const potentialWin = state.currentBet * state.multiplier;
  
  return (
    <button
      onClick={cashOut}
      disabled={!isActive}
      className={`
        w-full h-16 rounded-lg font-bold text-xl uppercase 
        transition-all duration-200 transform hover:scale-105
        flex flex-col items-center justify-center
        ${isActive 
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400 animate-pulse' 
          : 'bg-gray-800 text-gray-600'}
      `}
    >
      <span>Cash Out</span>
      {isActive && (
        <span className="text-sm font-normal">
          {potentialWin.toFixed(2)}
        </span>
      )}
    </button>
  );
};

export default CashoutButton;