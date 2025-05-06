import React from 'react';
import { AccountProvider } from './context/AccountContext';
import { GameProvider } from './context/GameContext';
import GameContainer from './components/GameContainer';

function App() {
  return (
    <AccountProvider>
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </AccountProvider>
  );
}

export default App;
