// src/pages/ReferralsPage.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Share2, Copy, Check, DollarSign, Award, ArrowUpRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Toast from '../components/common/Toast';

const ReferralsPage = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await axiosInstance.get('/wallet/me');
      return res.data.data;
    },
  });

  const { data: referralData } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const res = await axiosInstance.get('/referrals/my-tree');
      return res.data.data;
    },
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleCopyReferral = () => {
    const link = `https://tradeyield.io/register?ref=${referralData?.referralCode || user?.referralCode || ''}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    showToast('Referral invitation link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const referralBalance = wallet?.referralBalance || 0;

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col relative pb-20 md:pb-6">
      <Navbar
        onMobileSidebarToggle={() => setSidebarOpen(true)}
        onOpenNotifications={() => showToast('No new notifications')}
      />

      <div className="max-w-7xl mx-auto w-full flex gap-6 px-4 py-6 md:px-8 flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLogout={logout}
        />

        <main className="flex-1 min-w-0">
          <div className="relative overflow-hidden rounded-2xl neon-card p-6 mb-6 border border-cyan-500/30">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-cyan-400" /> 2-Generation Referral Program
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Earn direct bonus commissions ($25 / $50) plus $0.20 daily passive rewards for every active investor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-400" /> Share Your Invitation Link
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Send your unique referral URL to prospective investors. Rewards automatically credit after a referred client deposits $300+ and completes the 24-hour setup period.
              </p>

              <div className="flex items-center gap-2 mb-6">
                <input
                  type="text"
                  readOnly
                  value={`https://tradeyield.io/register?ref=${referralData?.referralCode || user?.referralCode || ''}`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyReferral}
                  className="btn-neon-primary px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>Copy</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Gen 1 ($300 Deposit)</span>
                  <span className="text-lg font-extrabold text-blue-400">$25 Bonus + $0.20/day</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Gen 1 ($500 Deposit)</span>
                  <span className="text-lg font-extrabold text-emerald-400">$50 Bonus + $0.20/day</span>
                </div>
              </div>
            </div>

            <div className="neon-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Network Earnings
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total Referred Clients</span>
                    <span className="text-sm font-bold text-white">{referralData?.totalReferredUsers || 0}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Earned Commission</span>
                    <span className="text-sm font-bold text-emerald-400">${referralBalance.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                • <strong>Direct Sponsor Rule:</strong> Second Generation referrals credit rewards to their immediate direct sponsor.
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
      <Toast message={toastMsg} />
    </div>
  );
};

export default ReferralsPage;