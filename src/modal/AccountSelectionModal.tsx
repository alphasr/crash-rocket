import React, { useEffect } from 'react';
import { useAccount, AccountType } from '../context/AccountContext';

const AccountSelectionModal: React.FC = () => {
  const { account, switchAccount, isFirstVisit, setIsFirstVisit } =
    useAccount();

  // Check for first visit on component mount
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, [setIsFirstVisit]);

  const handleSelectAccount = (type: AccountType) => {
    switchAccount(type);
    setIsFirstVisit(false); // Close modal after selection
  };

  if (!isFirstVisit) {
    return null; // Don't render if not the first visit
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-gray-800 p-6 rounded-lg shadow-xl text-white max-w-sm w-full'>
        <h2 className='text-2xl font-bold mb-4 text-center'>
          Select Account Mode
        </h2>
        <p className='text-gray-300 mb-6 text-center'>
          Welcome! Please choose whether you'd like to play in Demo or Real
          mode.
        </p>
        <div className='flex justify-center space-x-4'>
          <button
            onClick={() => handleSelectAccount(AccountType.DEMO)}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200'
          >
            Demo Mode
          </button>
          <button
            onClick={() => handleSelectAccount(AccountType.REAL)}
            className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200'
          >
            Real Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSelectionModal;
