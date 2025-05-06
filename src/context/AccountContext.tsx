import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define account types
export enum AccountType {
  DEMO = 'demo',
  REAL = 'real',
}

// Define account state
interface AccountState {
  type: AccountType;
  demoBalance: number;
  realBalance: number;
}

// Define context type
interface AccountContextType {
  account: AccountState;
  switchAccount: (type: AccountType) => void;
  getBalance: () => number;
  updateBalance: (newBalance: number) => void;
}

// Create context
const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Initial account state
const initialAccountState: AccountState = {
  type: AccountType.DEMO, // Default to demo account
  demoBalance: 1000, // Starting demo balance
  realBalance: 0, // Starting real balance (would be fetched from server in a real app)
};

// Account provider component
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountState>(initialAccountState);

  const switchAccount = (type: AccountType) => {
    setAccount((prev) => ({
      ...prev,
      type,
    }));
  };

  const getBalance = () => {
    return account.type === AccountType.DEMO
      ? account.demoBalance
      : account.realBalance;
  };

  const updateBalance = (newBalance: number) => {
    setAccount((prev) => ({
      ...prev,
      ...(prev.type === AccountType.DEMO
        ? { demoBalance: newBalance }
        : { realBalance: newBalance }),
    }));
  };

  return (
    <AccountContext.Provider
      value={{ account, switchAccount, getBalance, updateBalance }}
    >
      {children}
    </AccountContext.Provider>
  );
}

// Custom hook to use the account context
export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
