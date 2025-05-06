import React, { useState, useEffect } from 'react';
import { useGame, GamePhase } from '../context/GameContext';
import { useAccount, AccountType } from '../context/AccountContext';

const BettingPanel: React.FC = () => {
  const { state, placeBet, getBalance } = useGame();
  const { account } = useAccount();
  const [betAmount, setBetAmount] = useState(state.currentBet.toString());
  const [autoCashout, setAutoCashout] = useState<string>('1.5');
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(true);

  // Update bet amount when account changes (to handle max bet constraints)
  useEffect(() => {
    const currentBet = parseFloat(betAmount);
    if (currentBet > getBalance()) {
      setBetAmount(getBalance().toString());
    }
  }, [account.type, account.demoBalance, account.realBalance]);

  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > getBalance()) return;

    const autoCashoutValue =
      isAutoCashoutEnabled && autoCashout ? parseFloat(autoCashout) : null;

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

  const handleHalfBet = () => {
    const current = parseFloat(betAmount) || 0;
    setBetAmount(Math.max(1, Math.floor(current / 2)).toString());
  };

  const handleDoubleBet = () => {
    const current = parseFloat(betAmount) || 0;
    const doubled = current * 2;
    if (doubled <= getBalance()) {
      setBetAmount(doubled.toString());
    } else {
      setBetAmount(getBalance().toString());
    }
  };

  const handleMaxBet = () => {
    setBetAmount(getBalance().toString());
  };

  return (
    <div className='bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg'>
      <h2 className='text-xl font-bold text-white mb-3 pb-2 border-b border-gray-800'>
        Place Bet
      </h2>

      <div className='space-y-3'>
        {/* Bet Amount Input */}
        <div>
          <label className='block text-sm font-medium text-gray-400 mb-1'>
            Bet Amount
          </label>
          <div className='flex items-center mb-2'>
            <input
              type='text'
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className='flex-1 bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
            <button
              onClick={decreaseBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className='ml-1 px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              -
            </button>
            <button
              onClick={increaseBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className='ml-1 px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              +
            </button>
          </div>

          <div className='flex gap-1'>
            <button
              onClick={handleHalfBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className='flex-1 py-1 rounded-md text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
            >
              1/2
            </button>
            <button
              onClick={handleDoubleBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className='flex-1 py-1 rounded-md text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
            >
              2x
            </button>
            <button
              onClick={handleMaxBet}
              disabled={state.phase !== GamePhase.BETTING || state.hasBet}
              className='flex-1 py-1 rounded-md text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
            >
              Max
            </button>
          </div>
        </div>

        {/* Auto Cashout Option - Enabled by default for faster gameplay */}
        <div className='flex items-center'>
          <input
            id='auto-cashout'
            type='checkbox'
            checked={isAutoCashoutEnabled}
            onChange={() => setIsAutoCashoutEnabled(!isAutoCashoutEnabled)}
            disabled={state.phase !== GamePhase.BETTING || state.hasBet}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800'
          />
          <label
            htmlFor='auto-cashout'
            className='ml-2 block text-sm text-gray-400'
          >
            Auto Cash Out
          </label>

          <input
            type='text'
            value={autoCashout}
            onChange={(e) => setAutoCashout(e.target.value)}
            placeholder='1.50'
            disabled={
              !isAutoCashoutEnabled ||
              state.phase !== GamePhase.BETTING ||
              state.hasBet
            }
            className='ml-2 w-16 bg-gray-800 text-white px-2 py-1 text-sm rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>

        {/* Quick Auto Cashout Presets */}
        {isAutoCashoutEnabled &&
          state.phase === GamePhase.BETTING &&
          !state.hasBet && (
            <div className='flex flex-wrap gap-1'>
              <button
                onClick={() => setAutoCashout('1.2')}
                className='py-1 px-2 rounded-md text-xs bg-gray-800 text-gray-300 hover:bg-gray-700'
              >
                1.2x
              </button>
              <button
                onClick={() => setAutoCashout('1.5')}
                className='py-1 px-2 rounded-md text-xs bg-gray-800 text-gray-300 hover:bg-gray-700'
              >
                1.5x
              </button>
              <button
                onClick={() => setAutoCashout('1.8')}
                className='py-1 px-2 rounded-md text-xs bg-gray-800 text-gray-300 hover:bg-gray-700'
              >
                1.8x
              </button>
            </div>
          )}

        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={
            state.phase !== GamePhase.BETTING ||
            state.hasBet ||
            parseFloat(betAmount) <= 0 ||
            parseFloat(betAmount) > getBalance()
          }
          className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none transition-colors ${
            state.phase === GamePhase.BETTING && !state.hasBet
              ? 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {state.hasBet ? 'Bet Placed' : 'Place Bet'}
        </button>

        {/* Round Status - Show in milliseconds for fast gameplay */}
        {state.phase === GamePhase.BETTING && !state.hasBet && (
          <div className='text-sm text-center text-gray-400'>
            Next round in {state.countdown}s
            {state.countdown < 1 && (
              <span className='text-yellow-400 animate-pulse'>
                {' '}
                (Starting...)
              </span>
            )}
          </div>
        )}

        {/* Win Rate Warning */}
        <div className='text-xs text-gray-500 text-center pt-2'>
          Only ~30% of games allow winning. Time your cash out carefully!
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;
