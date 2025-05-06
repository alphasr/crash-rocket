import React from 'react';
import { useGame } from '../context/GameContext';

const UserInfo: React.FC = () => {
  const { state } = useGame();
  
  return (
    <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-3 shadow-lg">
      <div>
        <div className="text-sm text-gray-400">Balance</div>
        <div className="text-xl font-bold text-white">${state.balance.toFixed(2)}</div>
      </div>
      
      {state.phase === 'running' && state.hasBet && !state.isCashedOut && (
        <div>
          <div className="text-sm text-green-400">Current Bet</div>
          <div className="text-xl font-bold text-green-400">${state.currentBet.toFixed(2)}</div>
        </div>
      )}
      
      {state.isCashedOut && state.winAmount > 0 && (
        <div>
          <div className="text-sm text-green-400">Won</div>
          <div className="text-xl font-bold text-green-400">+${state.winAmount.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;