import React from 'react';
import MultiplierDisplay from './MultiplierDisplay';
import BettingPanel from './BettingPanel';
import CashoutButton from './CashoutButton';
import GameHistory from './GameHistory';
import UserInfo from './UserInfo';
import AccountSwitch from './AccountSwitch';
import { useGame, GamePhase } from '../context/GameContext';

const GameContainer: React.FC = () => {
  const { state } = useGame();

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      {/* Game Header */}
      <header className='border-b border-gray-800 p-3'>
        <div className='max-w-md mx-auto'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-green-400'>
              Crash Game
            </h1>
            <div className='flex items-center space-x-2'>
              <AccountSwitch />
              <UserInfo />
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area - Single Column Layout */}
      <main className='max-w-md mx-auto py-2 px-3'>
        <div className='space-y-3'>
          {/* Game Display */}
          <div className='bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg'>
            <MultiplierDisplay />

            {/* Game Status */}
            <div className='mt-2 text-center'>
              {state.phase === GamePhase.CRASHED && (
                <div className='text-xl font-bold text-red-500 animate-pulse'>
                  CRASHED AT {state.multiplier.toFixed(2)}x
                </div>
              )}

              {state.phase === GamePhase.RUNNING && <CashoutButton />}
            </div>
          </div>

          {/* Betting Interface */}
          <BettingPanel />

          {/* Game History */}
          <GameHistory />
        </div>
      </main>

      {/* Footer */}
      <footer className='border-t border-gray-800 py-2 mt-3 relative'>
        <div className='max-w-md mx-auto px-3 text-center text-gray-500 text-xs'>
          <p>This is a demo game. No real money is involved.</p>
        </div>
        <div className='absolute w-full h-1 top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-50 blur-sm'></div>
      </footer>
    </div>
  );
};

export default GameContainer;
