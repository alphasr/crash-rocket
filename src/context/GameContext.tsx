import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { useAccount } from './AccountContext';

// Define game phases
export enum GamePhase {
  BETTING = 'betting',
  RUNNING = 'running',
  CRASHED = 'crashed',
}

// Define game state
interface GameState {
  phase: GamePhase;
  currentBet: number;
  autoCashout: number | null;
  multiplier: number;
  crashPoint: number | null;
  roundHistory: { multiplier: number; won: boolean }[];
  hasBet: boolean;
  isCashedOut: boolean;
  winAmount: number;
  countdown: number;
  isJackpotRound: boolean;
}

// Define action types
type GameAction =
  | { type: 'PLACE_BET'; amount: number; autoCashout: number | null }
  | { type: 'START_GAME'; crashPoint: number; isJackpot: boolean }
  | { type: 'UPDATE_MULTIPLIER'; multiplier: number }
  | { type: 'CASH_OUT' }
  | { type: 'CRASH' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_COUNTDOWN'; countdown: number };

// Initial game state
const initialState: GameState = {
  phase: GamePhase.BETTING,
  currentBet: 10,
  autoCashout: null,
  multiplier: 0.5, // Start from 0.5x
  crashPoint: null,
  roundHistory: [],
  hasBet: false,
  isCashedOut: false,
  winAmount: 0,
  countdown: 3, // Shorter countdown
  isJackpotRound: false,
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
      };
    case 'START_GAME':
      return {
        ...state,
        phase: GamePhase.RUNNING,
        crashPoint: action.crashPoint,
        multiplier: 0.5, // Always start from 0.5x
        isCashedOut: false,
        winAmount: 0,
        isJackpotRound: action.isJackpot,
      };
    case 'UPDATE_MULTIPLIER':
      return { ...state, multiplier: action.multiplier };
    case 'CASH_OUT':
      if (
        state.phase === GamePhase.RUNNING &&
        state.hasBet &&
        !state.isCashedOut
      ) {
        const winAmount = state.currentBet * state.multiplier;
        return {
          ...state,
          isCashedOut: true,
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
        multiplier: 0.5, // Reset to 0.5x
        crashPoint: null,
        countdown: 3, // Shorter countdown
        isJackpotRound: false,
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
  getBalance: () => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Game provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { getBalance, updateBalance } = useAccount();

  const placeBet = (amount: number, autoCashout: number | null) => {
    if (state.phase === GamePhase.BETTING && amount <= getBalance()) {
      dispatch({ type: 'PLACE_BET', amount, autoCashout });
      // Deduct the bet amount from the balance
      updateBalance(getBalance() - amount);
    }
  };

  const cashOut = () => {
    dispatch({ type: 'CASH_OUT' });

    // Add winnings to balance if cashed out
    if (
      state.phase === GamePhase.RUNNING &&
      state.hasBet &&
      !state.isCashedOut
    ) {
      const winAmount = state.currentBet * state.multiplier;
      updateBalance(getBalance() + winAmount);
    }
  };

  const startGame = () => {
    // Auto cashout logic
    const handleAutoCashout = (currentMultiplier: number) => {
      if (
        state.autoCashout &&
        currentMultiplier >= state.autoCashout &&
        !state.isCashedOut &&
        state.hasBet
      ) {
        dispatch({ type: 'CASH_OUT' });
        const winAmount = state.currentBet * currentMultiplier;
        updateBalance(getBalance() + winAmount);
      }
    };

    // Check for rare jackpot round (1/1000 chance)
    const isJackpotRound = Math.random() < 0.001; // 0.1% chance

    let crashPoint: number;

    if (isJackpotRound) {
      // For jackpot rounds, set the crash point between 5.0x and 10.0x
      crashPoint = 5.0 + Math.random() * 5.0;
      console.log('🎰 JACKPOT ROUND! Crash point:', crashPoint.toFixed(2));
    } else {
      // For regular rounds with <30% win chance
      const winnableRound = Math.random() < 0.3;

      if (winnableRound) {
        // For winnable rounds, set the crash point between 1.1x and 2.0x
        crashPoint = 1.1 + Math.random() * 0.9;
      } else {
        // For unwinnable rounds, set the crash point between 0.8x and 1.0x
        crashPoint = 0.8 + Math.random() * 0.2;
      }
    }

    dispatch({ type: 'START_GAME', crashPoint, isJackpot: isJackpotRound });

    let currentMultiplier = 0.5; // Start from 0.5x
    let lastUpdateTime = Date.now();

    // Make the game faster by increasing the multiplier growth rate
    // Use a slower growth rate for jackpot rounds so players have more time to react
    const growthRate = isJackpotRound ? 0.8 : 1.2;

    const gameInterval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdateTime) / 1000; // Time in seconds
      lastUpdateTime = now;

      // Faster multiplier increase
      currentMultiplier += currentMultiplier * delta * growthRate;

      // Round to 2 decimal places for display
      const roundedMultiplier = Math.floor(currentMultiplier * 100) / 100;

      dispatch({ type: 'UPDATE_MULTIPLIER', multiplier: roundedMultiplier });

      // Check for auto cashout
      handleAutoCashout(roundedMultiplier);

      // Check if we've reached the crash point
      if (roundedMultiplier >= crashPoint) {
        clearInterval(gameInterval);
        dispatch({ type: 'CRASH' });

        // Reset game after crash (shorter delay)
        setTimeout(() => {
          dispatch({ type: 'RESET_GAME' });

          // Start countdown for next round (shorter)
          let count = 3; // Reduced from 5 to 3
          dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });

          const countdownInterval = setInterval(() => {
            count--;
            dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });

            if (count <= 0) {
              clearInterval(countdownInterval);
              startGame();
            }
          }, 500); // Faster countdown (500ms instead of 1000ms)
        }, 1000); // Shorter delay after crash (1s instead of 2s)
      }
    }, 30); // Update more frequently (30ms instead of 50ms)

    return () => clearInterval(gameInterval);
  };

  // Start first game
  useEffect(() => {
    if (state.phase === GamePhase.BETTING && state.countdown === 3) {
      let count = state.countdown;
      const countdownInterval = setInterval(() => {
        count--;
        dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });

        if (count <= 0) {
          clearInterval(countdownInterval);
          startGame();
        }
      }, 500); // Faster countdown (500ms)

      return () => clearInterval(countdownInterval);
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        placeBet,
        cashOut,
        startGame,
        getBalance,
      }}
    >
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
