// src/components/modals/DepositModal.jsx
import React, { useState } from 'react';
import { X, ExternalLink, ShieldAlert, DollarSign } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const DepositModal = ({ isOpen, onClose, onShowToast }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Fetch current user's profile and wallet balance
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await axiosInstance.get('/auth/me');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const currentBalance = userData?.wallet?.mainBalance || 0;

  // Compute dynamic minimum deposit required
  let minRequired = 300;
  if (currentBalance > 0 && currentBalance < 300) {
    minRequired = 300 - currentBalance;
  } else if (currentBalance >= 300) {
    minRequired = 1;
  }

  // Deposit Mutation
  const depositMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/test-stripe/create-checkout', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        onShowToast('Redirecting to Stripe Test Checkout...');
        window.location.href = data.url;
      } else {
        onShowToast('Deposit initiated successfully!');
        handleClose();
      }
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to initiate deposit.');
    },
  });

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount < minRequired) {
      setError(`Minimum required deposit for your account is $${minRequired}.`);
      return;
    }

    depositMutation.mutate({ amount: depositAmount });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="neon-card bg-[#0b1322] max-w-md w-full p-6 rounded-2xl relative border border-cyan-500/40 shadow-2xl">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Deposit Capital</h3>
            <p className="text-xs text-slate-400">Add funds to activate or top up your 1% daily yield.</p>
          </div>
        </div>

        {/* Dynamic Minimum Indicator */}
        {loadingUser ? (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center mb-4">
            Checking wallet balance...
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-xs mb-4 flex justify-between items-center">
            <span className="text-slate-300">Minimum Required Deposit:</span>
            <span className="font-extrabold text-cyan-400 text-sm">${minRequired}.00 USD</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Deposit Amount (USD / USDT)</label>
            <input
              type="number"
              min={minRequired}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum $${minRequired}`}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
            <p className="text-[11px] text-cyan-400/80 mt-1">
              {currentBalance >= 300
                ? 'Your active capital is above $300. You can deposit any amount.'
                : `Current Balance: $${currentBalance.toFixed(2)}. Deposit $${minRequired} to reach active yield threshold.`}
            </p>
          </div>

          <button
            type="submit"
            disabled={depositMutation.isPending || loadingUser}
            className="w-full btn-neon-primary py-3 rounded-xl font-bold text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {depositMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Proceed to Stripe Checkout</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;