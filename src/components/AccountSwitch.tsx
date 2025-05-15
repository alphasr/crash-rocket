import React from 'react';
import { useAccount, AccountType } from '../context/AccountContext';

const AccountSwitch: React.FC = () => {
  const { account, switchAccount } = useAccount();

  return (
    <div className='flex items-center'>
      {/* Account Switch Tabs */}
      <div className='flex rounded-md overflow-hidden bg-gray-900'>
        <button
          onClick={() => switchAccount(AccountType.DEMO)}
          className={`py-2 px-3 text-sm font-medium flex items-center transition-colors duration-200 ${
            account.type === AccountType.DEMO
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <svg
            className='w-4 h-4 mr-1'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'></path>
            <circle cx='12' cy='7' r='4'></circle>
          </svg>
          Demo
        </button>
        <button
          onClick={() => switchAccount(AccountType.REAL)}
          className={`py-2 px-3 text-sm font-medium flex items-center transition-colors duration-200 ${
            account.type === AccountType.REAL
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <svg
            className='w-4 h-4 mr-1'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='2' y='5' width='20' height='14' rx='2'></rect>
            <line x1='2' y1='10' x2='22' y2='10'></line>
          </svg>
          Real
        </button>
      </div>

      {/* Mode Indicator */}
      {account.type === AccountType.DEMO ? (
        <div className='ml-2 py-1 px-2 bg-blue-900/90 text-blue-200 rounded-md text-xs'>
          Demo Mode
        </div>
      ) : (
        <div className='ml-2 py-1 px-2 bg-green-900/90 text-green-200 rounded-md text-xs'>
          Real Mode
        </div>
      )}
    </div>
  );
};

export default AccountSwitch;
