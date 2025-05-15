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
  multiplier: number; // Actual multiplier for game logic
  displayedMultiplier: number; // Multiplier shown to the user
  crashPoint: number | null;
  visualCrashPoint: number | null; // Visual crash point for display after cashout
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
  | {
      type: 'UPDATE_MULTIPLIER';
      multiplier: number;
      displayedMultiplier: number;
    }
  | { type: 'CASH_OUT' }
  | { type: 'CRASH' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_COUNTDOWN'; countdown: number }
  | { type: 'SET_VISUAL_CRASH_POINT'; visualCrashPoint: number | null };

// Initial game state
const initialState: GameState = {
  phase: GamePhase.BETTING,
  currentBet: 10,
  autoCashout: null,
  multiplier: 0.2, // Start from 0.2x
  displayedMultiplier: 0.2, // Start displayed multiplier at 0.2x
  crashPoint: null,
  roundHistory: [],
  hasBet: false,
  isCashedOut: false,
  winAmount: 0,
  countdown: 8, // Increased countdown to 8 seconds
  isJackpotRound: false,
  visualCrashPoint: null, // Add visual crash point to initial state
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
        multiplier: 0.2, // Always start from 0.2x
        displayedMultiplier: 0.2, // Reset displayed multiplier
        isCashedOut: false,
        winAmount: 0,
        isJackpotRound: action.isJackpot,
        visualCrashPoint: null, // Reset visual crash point
      };
    case 'UPDATE_MULTIPLIER':
      return {
        ...state,
        multiplier: action.multiplier,
        displayedMultiplier: action.displayedMultiplier,
      };
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
    case 'CRASH': {
      const won = state.isCashedOut && state.hasBet;
      const history = [
        { multiplier: state.multiplier, won },
        ...state.roundHistory.slice(0, 9), // Keep last 10 rounds
      ];

      // Deduct bet amount if the user had a bet and did NOT cash out
      if (state.hasBet && !state.isCashedOut) {
        // The bet amount was already deducted when placing the bet.
        // No further deduction needed here, just update history won status.
      }

      return {
        ...state,
        phase: GamePhase.CRASHED,
        roundHistory: history,
        visualCrashPoint: null, // Reset visual crash point on crash
      };
    }
    case 'RESET_GAME':
      return {
        ...state,
        phase: GamePhase.BETTING,
        hasBet: false,
        isCashedOut: false,
        multiplier: 0.2, // Reset to 0.2x
        displayedMultiplier: 0.2, // Reset displayed multiplier
        crashPoint: null,
        visualCrashPoint: null, // Reset visual crash point
        countdown: 8, // Increased countdown to 8 seconds
        isJackpotRound: false,
      };
    case 'UPDATE_COUNTDOWN':
      return { ...state, countdown: action.countdown };
    case 'SET_VISUAL_CRASH_POINT':
      return { ...state, visualCrashPoint: action.visualCrashPoint };
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
    if (
      state.phase === GamePhase.BETTING &&
      amount <= getBalance() &&
      !state.hasBet
    ) {
      dispatch({ type: 'PLACE_BET', amount, autoCashout });
      // Deduct the bet amount from the balance
      updateBalance(getBalance() - amount);
      // Start the game only after a bet is placed
      startGame();
    }
  };

  const cashOut = () => {
    if (
      state.phase === GamePhase.RUNNING &&
      state.hasBet &&
      !state.isCashedOut
    ) {
      const winAmount = state.currentBet * state.multiplier; // Calculate win amount before dispatch
      updateBalance(getBalance() + winAmount); // Update balance before dispatch
      dispatch({ type: 'CASH_OUT' }); // Dispatch CASH_OUT
    }
  };
  // Note: Bet deduction happens in placeBet function.
  // Loss (crash before cashout) means the initial deduction stands.
  // Win (cashout before crash) means the initial deduction is offset by adding winnings.

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

    let crashPoint: number;
    let isJackpotRound = false; // Assume not a jackpot round initially

    // Determine crash point based on probabilities to achieve ~20% win rate
    const randomValue = Math.random();

    if (randomValue < 0.8) {
      // 80% chance to crash below 1.0x (unwinnable for typical bets)
      crashPoint = 0.5 + Math.random() * 0.5; // Range 0.5x to 1.0x
    } else if (randomValue < 0.95) {
      // 15% chance to crash between 1.1x and 5.0x
      crashPoint = 1.1 + Math.random() * 3.9; // Range 1.1x to 5.0x
    } else {
      // 5% chance to crash between 5.1x and 200x (rare high multipliers)
      isJackpotRound = true;
      crashPoint = 5.1 + Math.random() * 194.9; // Range 5.1x to 200x
      console.log(
        '🎰 RARE HIGH MULTIPLIER! Crash point:',
        crashPoint.toFixed(2)
      );
    }

    dispatch({ type: 'START_GAME', crashPoint, isJackpot: isJackpotRound });

    let currentMultiplier = 0.2; // Start from 0.2x
    let lastUpdateTime = Date.now();

    // Adjust growth rate based on crash point for smoother animation
    // Faster growth for lower crash points, slower for higher
    const growthRate = crashPoint < 5 ? 1.2 : crashPoint < 20 ? 1.0 : 0.8;

    const gameInterval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdateTime) / 1000; // Time in seconds
      lastUpdateTime = now;

      // Faster multiplier increase
      currentMultiplier += currentMultiplier * delta * growthRate;

      // Round to 2 decimal places
      const roundedMultiplier = Math.floor(currentMultiplier * 100) / 100;

      // Update displayed multiplier
      let newDisplayedMultiplier = roundedMultiplier;
      if (state.isCashedOut && roundedMultiplier < state.crashPoint!) {
        // If cashed out before crash, continue increasing displayed multiplier visually
        // If cashed out before crash, continue increasing displayed multiplier visually
        // Generate a random visual crash point greater than the actual crash point if not already set
        const visualCrashPoint =
          state.visualCrashPoint ||
          state.crashPoint! + Math.random() * (200 - state.crashPoint!);
        newDisplayedMultiplier = Math.min(roundedMultiplier, visualCrashPoint); // Cap at visual crash point
        // Store the visual crash point in state if it was just generated
        if (!state.visualCrashPoint) {
          dispatch({ type: 'SET_VISUAL_CRASH_POINT', visualCrashPoint });
        }
      } else {
        // Reset visual crash point if not cashed out or if actual crash occurred
        if (state.visualCrashPoint !== null) {
          dispatch({ type: 'SET_VISUAL_CRASH_POINT', visualCrashPoint: null });
        }
      }

      dispatch({
        type: 'UPDATE_MULTIPLIER',
        multiplier: roundedMultiplier,
        displayedMultiplier: newDisplayedMultiplier,
      });

      // Check for auto cashout
      handleAutoCashout(roundedMultiplier);

      // Check if we've reached the crash point
      if (roundedMultiplier >= crashPoint) {
        clearInterval(gameInterval);

        // Deduct bet amount if the user had a bet and did NOT cash out
        if (state.hasBet && !state.isCashedOut) {
          updateBalance(getBalance() - state.currentBet);
        }

        dispatch({ type: 'CRASH' });

        // Reset game after crash (shorter delay)
        setTimeout(() => {
          dispatch({ type: 'RESET_GAME' });

          // Start countdown for next round (8 seconds)
          let count = 8; // Increased to 8 seconds
          dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });

          const countdownInterval = setInterval(() => {
            count--;
            dispatch({ type: 'UPDATE_COUNTDOWN', countdown: count });

            if (count <= 0) {
              clearInterval(countdownInterval);
              // Do not start game automatically, wait for bet
            }
          }, 500); // Faster countdown (500ms instead of 1000ms)
        }, 1000); // Shorter delay after crash (1s instead of 2s)
      }
    }, 30); // Update more frequently (30ms instead of 50ms)

    return () => clearInterval(gameInterval);
  };

  // Manage countdown timer
  useEffect(() => {
    let countdownInterval: number;

    if (state.phase === GamePhase.BETTING && state.countdown > 0) {
      countdownInterval = setInterval(() => {
        dispatch({ type: 'UPDATE_COUNTDOWN', countdown: state.countdown - 1 });
      }, 1000); // Countdown every 1 second
    } else if (state.phase === GamePhase.BETTING && state.countdown === 0) {
      // If countdown reaches 0 in betting phase and no bet placed, reset for next betting round
      dispatch({ type: 'RESET_GAME' });
    }

    return () => clearInterval(countdownInterval);
  }, [state.phase, state.countdown, dispatch]); // Depend on phase and countdown

  // Start initial countdown when component mounts
  useEffect(() => {
    dispatch({ type: 'UPDATE_COUNTDOWN', countdown: initialState.countdown });
  }, [dispatch]); // Only run on mount

  // Ensure game stops if phase changes unexpectedly
  useEffect(() => {
    if (state.phase !== GamePhase.RUNNING && state.multiplier > 0.5) {
      // If not running but multiplier is increasing, something is wrong. Reset.
      // This is a safeguard, should not happen with correct logic.
      // dispatch({ type: 'RESET_GAME' });
    }
  }, [state.phase, state.multiplier, dispatch]);

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
