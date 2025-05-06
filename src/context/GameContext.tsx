import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Define game phases
export enum GamePhase {
  BETTING = 'betting',
  RUNNING = 'running',
  CRASHED = 'crashed',
}

// Define game state
interface GameState {
  phase: GamePhase;
  balance: number;
  currentBet: number;
  autoCashout: number | null;
  multiplier: number;
  crashPoint: number | null;
  roundHistory: { multiplier: number; won: boolean }[];
  hasBet: boolean;
  isCashedOut: boolean;
  winAmount: number;
  countdown: number;
}

// Define action types
type GameAction =
  | { type: 'PLACE_BET'; amount: number; autoCashout: number | null }
  | { type: 'START_GAME'; crashPoint: number }
  | { type: 'UPDATE_MULTIPLIER'; multiplier: number }
  | { type: 'CASH_OUT' }
  | { type: 'CRASH' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_COUNTDOWN'; countdown: number };

// Initial game state
const initialState: GameState = {
  phase: GamePhase.BETTING,
  balance: 1000, // Starting balance
  currentBet: 10,
  autoCashout: null,
  multiplier: 1.00,
  crashPoint: null,
  roundHistory: [],
  hasBet: false,
  isCashedOut: false,
  winAmount: 0,
  countdown: 5,
};

// Game reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_BET':
      return {
        ...state,
        currentBet: action.amount,
        autoCashout: action.autoCashout,
        hasBet: true,
        balance: state.balance - action.amount,
      };
    case 'START_GAME':
      return {
        ...state,
        phase: GamePhase.RUNNING,
        crashPoint: action.crashPoint,
        multiplier: 1.00,
        isCashedOut: false,
        winAmount: 0,
      };
    case 'UPDATE_MULTIPLIER':
      // Auto cashout logic
      if (state.autoCashout && action.multiplier >= state.autoCashout && !state.isCashedOut && state.hasBet) {
        return {
          ...state,
          multiplier: action.multiplier,
          isCashedOut: true,
          balance: state.balance + (state.currentBet * action.multiplier),
          winAmount: state.currentBet * action.multiplier,
        };
      }
      return { ...state, multiplier: action.multiplier };
    case 'CASH_OUT':
      if (state.phase === GamePhase.RUNNING && state.hasBet && !state.isCashedOut) {
        const winAmount = state.currentBet * state.multiplier;
        return {
          ...state,
          isCashedOut: true,
          balance: state.balance + winAmount,
          winAmount,
        };
      }
      return state;
    case 'CRASH':
      const won = state.isCashedOut && state.hasBet;
      const history = [
        { multiplier: state.multiplier, won },
        ...state.roundHistory.slice(0, 9), // Keep last 10 rounds
      ];
      
      return {
        ...state,
        phase: GamePhase.CRASHED,
        roundHistory: history,
      };
    case 'RESET_GAME':
      return {
        ...state,
        phase: GamePhase.BETTING,
        hasBet: false,
        isCashedOut: false,
        multiplier: 1.00,
        crashPoint: null,
        countdown: 5,
      };
    case 'UPDATE_COUNTDOWN':
      return { ...state, countdown: action.countdown };
    default:
      return state;
  }
}

// Create context
interface GameContextType {
  state: GameState;
  placeBet: (amount: number, autoCashout: number | null) => void;
  cashOut: () => void;
  startGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Game provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const placeBet = (amount: number, autoCashout: number | null) => {
    if (state.phase === GamePhase.BETTING && amount <= state.balance) {
      dispatch({ type: 'PLACE_BET', amount, autoCashout });
    }
  };

  const cashOut = () => {
    dispatch({ type: 'CASH_OUT' });
  };

  const startGame = () => {
    // Generate a random crash point
    // The house edge is implemented here
    // Higher values = lower chance of high multipliers
    const houseEdge = 0.99;
    const randomValue = Math.random() * houseEdge;
    // This formula creates an exponential distribution favoring lower values
    const crashPoint = Math.max(1.00, (1 / randomValue) * houseEdge);
    
    dispatch({ type: 'START_GAME', crashPoint });
    
    let currentMultiplier = 1.00;
    let lastUpdateTime = Date.now();
    
    const gameInterval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdateTime) / 1000; // Time in seconds
      lastUpdateTime = now;
      
      // Increase multiplier over time (adjust growth rate as needed)
      // This formula creates an exponential growth curve
      currentMultiplier += currentMultiplier * delta * 0.5;
      
      // Round to 2 decimal places for display
      const roundedMultiplier = Math.floor(currentMultiplier * 100) / 100;
      
      dispatch({ type: 'UPDATE_MULTIPLIER', multiplier: roundedMultiplier });
      
      // Check if we've reached the crash point
      if (roundedMultiplier >= state.crashPoint!) {
        clearInterval(gameInterval);
        dispatch({ type: 'CRASH' });
        
        // Reset game after crash
        setTimeout(() => {
          dispatch({ type: 'RESET_GAME' });
          
          // Start countdown for next round
          let count = 5;
          dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });
          
          const countdownInterval = setInterval(() => {
            count--;
            dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });
            
            if (count <= 0) {
              clearInterval(countdownInterval);
              startGame();
            }
          }, 1000);
        }, 2000);
      }
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(gameInterval);
  };

  // Start first game
  useEffect(() => {
    if (state.phase === GamePhase.BETTING && state.countdown === 5) {
      let count = state.countdown;
      const countdownInterval = setInterval(() => {
        count--;
        dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });
        
        if (count <= 0) {
          clearInterval(countdownInterval);
          startGame();
        }
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, placeBet, cashOut, startGame }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}