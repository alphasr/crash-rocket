import React from 'react';
import { useGame } from '../context/GameContext';

const ModeSelection: React.FC = () => {
  const { setMode } = useGame();

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl mb-4'>Select Mode</h1>
      <button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2'
        onClick={() => setMode('demo')}
      >
        Demo Mode
      </button>
      <button
        className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2'
        onClick={() => setMode('real')}
      >
        Real Mode
      </button>
    </div>
  );
};

export default ModeSelection;
