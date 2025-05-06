import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';

enum ModalTab {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>(ModalTab.DEPOSIT);
  const [amount, setAmount] = useState('');
  const { account, updateBalance } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) return;

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      updateBalance(account.realBalance + depositAmount);
      setIsProcessing(false);
      setShowSuccess(true);
      setAmount('');

      // Hide success message after a few seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (
      isNaN(withdrawAmount) ||
      withdrawAmount <= 0 ||
      withdrawAmount > account.realBalance
    )
      return;

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      updateBalance(account.realBalance - withdrawAmount);
      setIsProcessing(false);
      setShowSuccess(true);
      setAmount('');

      // Hide success message after a few seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900 rounded-lg shadow-xl max-w-sm w-full overflow-hidden border border-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between p-3 border-b border-gray-800'>
          <h2 className='text-lg font-bold text-white'>Account Management</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-800'>
          <button
            onClick={() => setActiveTab(ModalTab.DEPOSIT)}
            className={`flex-1 py-2 px-3 flex items-center justify-center space-x-1 transition-colors ${
              activeTab === ModalTab.DEPOSIT
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            <ArrowDownCircle size={16} />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab(ModalTab.WITHDRAW)}
            className={`flex-1 py-2 px-3 flex items-center justify-center space-x-1 transition-colors ${
              activeTab === ModalTab.WITHDRAW
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            <ArrowUpCircle size={16} />
            <span>Withdraw</span>
          </button>
        </div>

        {/* Content */}
        <div className='p-4 space-y-4'>
          {/* Current Balance */}
          <div className='bg-gray-800 p-3 rounded-lg'>
            <div className='text-xs text-gray-400 mb-1'>Current Balance</div>
            <div className='text-xl font-bold text-green-400'>
              ${account.realBalance.toFixed(2)}
            </div>
          </div>

          {showSuccess ? (
            <div className='bg-green-900/40 text-green-400 p-3 rounded-lg text-center animate-pulse'>
              {activeTab === ModalTab.DEPOSIT
                ? 'Deposit successful!'
                : 'Withdrawal successful!'}
            </div>
          ) : (
            <>
              {/* Amount Input */}
              <div>
                <label className='block text-sm font-medium text-gray-400 mb-1'>
                  {activeTab === ModalTab.DEPOSIT
                    ? 'Deposit Amount'
                    : 'Withdraw Amount'}
                </label>
                <div className='relative'>
                  <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400'>
                    $
                  </span>
                  <input
                    type='text'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='0.00'
                    disabled={isProcessing}
                    className='w-full bg-gray-800 text-white pl-8 pr-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>

                {activeTab === ModalTab.WITHDRAW &&
                  account.realBalance === 0 && (
                    <div className='mt-1 text-xs text-yellow-400 flex items-center space-x-1'>
                      <AlertTriangle size={12} />
                      <span>You have no funds to withdraw</span>
                    </div>
                  )}
              </div>

              {/* Quick Amount Buttons */}
              <div className='grid grid-cols-3 gap-2'>
                {[10, 25, 50, 100, 250, 500].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={
                      isProcessing ||
                      (activeTab === ModalTab.WITHDRAW &&
                        quickAmount > account.realBalance)
                    }
                    className={`py-1 px-2 rounded-md text-xs font-medium 
                      ${
                        activeTab === ModalTab.WITHDRAW &&
                        quickAmount > account.realBalance
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              {/* Payment Methods (Only for deposit) */}
              {activeTab === ModalTab.DEPOSIT && (
                <div>
                  <label className='block text-sm font-medium text-gray-400 mb-1'>
                    Payment Method
                  </label>
                  <div className='grid grid-cols-1 gap-2'>
                    <div className='flex items-center space-x-2 bg-gray-800 p-2 rounded-md border border-blue-700'>
                      <input
                        type='radio'
                        id='credit-card'
                        name='payment-method'
                        checked={true}
                        readOnly
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800'
                      />
                      <label
                        htmlFor='credit-card'
                        className='flex items-center space-x-1 text-sm'
                      >
                        <CreditCard size={16} className='text-blue-400' />
                        <span>Credit/Debit Card</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={
                  activeTab === ModalTab.DEPOSIT
                    ? handleDeposit
                    : handleWithdraw
                }
                disabled={
                  isProcessing ||
                  amount === '' ||
                  parseFloat(amount) <= 0 ||
                  (activeTab === ModalTab.WITHDRAW &&
                    parseFloat(amount) > account.realBalance)
                }
                className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-offset-2 ${
                  isProcessing
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : activeTab === ModalTab.DEPOSIT
                    ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                }`}
              >
                {isProcessing
                  ? 'Processing...'
                  : activeTab === ModalTab.DEPOSIT
                  ? 'Deposit Funds'
                  : 'Withdraw Funds'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className='bg-gray-800 p-2 text-xs text-gray-400'>
          <p>This is a demo application. No actual money is being processed.</p>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
