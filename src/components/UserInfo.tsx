import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAccount, AccountType } from '../context/AccountContext';
import { PlusCircle } from 'lucide-react';
import AccountModal from '../modal/AccountModal';
const UserInfo: React.FC = () => {
  const { state } = useGame();
  const { account } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAccountModal = () => {
    setIsModalOpen(true);
  };

  const closeAccountModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Balance Display */}
      <div className='bg-blue-600 rounded-md px-2 py-1 text-sm'>
        <div className='text-xs text-blue-200'>Balance</div>
        <div className='font-bold text-white'>
          $
          {account.type === AccountType.DEMO
            ? account.demoBalance.toFixed(2)
            : account.realBalance.toFixed(2)}
          {/* Add funds button (only for real account) */}
          {account.type === AccountType.REAL && (
            <button
              onClick={openAccountModal}
              className='ml-1 p-0.5 rounded-full text-blue-200 hover:text-white transition-colors'
            >
              <PlusCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Account Modal */}
      <AccountModal isOpen={isModalOpen} onClose={closeAccountModal} />
    </>
  );
};

export default UserInfo;
