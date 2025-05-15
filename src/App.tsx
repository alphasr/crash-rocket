import React from 'react';
import { AccountProvider } from './context/AccountContext';
import { GameProvider } from './context/GameContext';
import GameContainer from './components/GameContainer';
import AccountSelectionModal from './modal/AccountSelectionModal';

function App() {
  return (
    <AccountProvider>
      <AccountSelectionModal />
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </AccountProvider>
  );
}

export default App;
