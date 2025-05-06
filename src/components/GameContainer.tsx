import React from 'react';
import MultiplierDisplay from './MultiplierDisplay';
import BettingPanel from './BettingPanel';
import CashoutButton from './CashoutButton';
import GameHistory from './GameHistory';
import UserInfo from './UserInfo';
import { useGame, GamePhase } from '../context/GameContext';

const GameContainer: React.FC = () => {
  const { state } = useGame();
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Game Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-green-400">
              Crash Game
            </h1>
            <UserInfo />
          </div>
        </div>
      </header>
      
      {/* Main Game Area */}
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Game History */}
          <div className="lg:col-span-1 space-y-4 order-3 lg:order-1">
            <GameHistory />
          </div>
          
          {/* Center - Game Display */}
          <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg">
              <MultiplierDisplay />
              
              {/* Game Status */}
              <div className="mt-4 text-center">
                {state.phase === GamePhase.CRASHED && (
                  <div className="text-xl font-bold text-red-500 animate-pulse">
                    CRASHED AT {state.multiplier.toFixed(2)}x
                  </div>
                )}
                
                {state.phase === GamePhase.RUNNING && (
                  <CashoutButton />
                )}
              </div>
            </div>
          </div>
          
          {/* Right Side - Betting Interface */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-3">
            <BettingPanel />
          </div>
        </div>
      </main>
      
      {/* Footer with glow effect */}
      <footer className="border-t border-gray-800 py-4 relative">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>This is a demo game. No real money is involved.</p>
        </div>
        <div className="absolute w-full h-1 top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-50 blur-sm"></div>
      </footer>
    </div>
  );
};

export default GameContainer;