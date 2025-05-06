import React, { useState } from 'react';
import { useGame, GamePhase } from '../context/GameContext';

const BettingPanel: React.FC = () => {
  const { state, placeBet } = useGame();
  const [betAmount, setBetAmount] = useState(state.currentBet.toString());
  const [autoCashout, setAutoCashout] = useState<string>('');
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);

  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > state.balance) return;
    
    const autoCashoutValue = isAutoCashoutEnabled && autoCashout ? 
      parseFloat(autoCashout) : null;
      
    placeBet(amount, autoCashoutValue);
  };

  const increaseBet = () => {
    const current = parseFloat(betAmount) || 0;
    setBetAmount((current + 1).toString());
  };

  const decreaseBet = () => {
    const current = parseFloat(betAmount) || 0;
    if (current > 1) {
      setBetAmount((current - 1).toString());
    }
  };

  const handleMaxBet = () => {
    setBetAmount(state.balance.toString());
  };

  const handleHalfBet = () => {
    const current = parseFloat(betAmount) || 0;
    setBetAmount((current / 2).toString());
  };

  const handleDoubleBet = () => {
    const current = parseFloat(betAmount) || 0;
    const doubled = current * 2;
    if (doubled <= state.balance) {
      setBetAmount(doubled.toString());
    } else {
      setBetAmount(state.balance.toString());
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg w-full max-w-sm">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Place Bet</h2>
      
      <div className="space-y-4">
        {/* Bet Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Bet Amount</label>
          <div className="relative">
            <input
              type="text"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button 
                onClick={decreaseBet}
                disabled={state.phase !== GamePhase.BETTING || state.hasBet}
                className="h-full px-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                -
              </button>
              <button 
                onClick={increaseBet}
                disabled={state.phase !== GamePhase.BETTING || state.hasBet}
                className="h-full px-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleHalfBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              1/2
            </button>
            <button 
              onClick={handleDoubleBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              2x
            </button>
            <button 
              onClick={handleMaxBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Max
            </button>
          </div>
        </div>
        
        {/* Auto Cashout Option */}
        <div>
          <div className="flex items-center">
            <input
              id="auto-cashout"
              type="checkbox"
              checked={isAutoCashoutEnabled}
              onChange={() => setIsAutoCashoutEnabled(!isAutoCashoutEnabled)}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4 bg-gray-800 border-gray-700"
            />
            <label htmlFor="auto-cashout" className="ml-2 block text-sm font-medium text-gray-400">
              Auto Cash Out
            </label>
          </div>
          
          {isAutoCashoutEnabled && (
            <div className="mt-2">
              <input
                type="text"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                placeholder="e.g. 2.00"
                disabled={state.phase !== GamePhase.BETTING || state.hasBet}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        
        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={state.phase !== GamePhase.BETTING || state.hasBet || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > state.balance}
          className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            state.phase === GamePhase.BETTING && !state.hasBet
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {state.hasBet ? 'Bet Placed' : 'Place Bet'}
        </button>
        
        {/* Round Status */}
        {state.phase === GamePhase.BETTING && !state.hasBet && (
          <div className="text-sm text-center text-gray-400">
            Next round in {state.countdown}s
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingPanel;