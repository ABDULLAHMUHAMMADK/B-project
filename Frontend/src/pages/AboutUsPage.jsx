// src/pages/AboutUsPage.jsx
import React, { useState } from 'react';
import {
  Globe,
  Target,
  Coins,
  Users,
  Award,
  DollarSign,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Toast from '../components/common/Toast';

const AboutUsPage = () => {
  const logout = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

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
          {/* Main Hero Header */}
          <div className="relative overflow-hidden rounded-2xl neon-card p-6 mb-6 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Trade yield EXCHANGE
              </span>
              <span className="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full border border-cyan-700">
                Official Corporate Profile
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Globe className="w-7 h-7 text-cyan-400" /> About Trade yield EXCHANGE
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Your Gateway to Digital Financial Markets — Professional multi-asset trading, automated yields, and secure account management.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Section 1: Who We Are & Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="neon-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" /> Who We Are
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Trade yield EXCHANGE is a digital trading and investment platform focused on Forex, Gold (XAUUSD), Currency Pairs, and Cryptocurrencies. Our platform aims to provide users with a simple and accessible way to manage their accounts, explore financial market services, and participate in our investment program.
                </p>
              </div>

              <div className="neon-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" /> Our Mission
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Our mission is to make digital financial services accessible through an organized platform, professional trading operations, and convenient account management.
                </p>
              </div>

              <div className="neon-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Our Vision
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Our vision is to develop Trade yield EXCHANGE into a recognized digital financial platform by providing accessible trading services, organized investment management, and a user-friendly experience.
                </p>
              </div>
            </div>

            {/* Section 2: Trading Services & Professional Team */}
            <div className="neon-card p-6 rounded-2xl border border-purple-500/20">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" /> Trading Services & Professional Trading Team
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Our platform works with experienced trading professionals who conduct market research and manage trading activities according to the platform's trading strategies across four core markets:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-sm mb-1">Forex Trading</span>
                  <span className="text-slate-400 text-xs">Major global currency pairs execution</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-sm mb-1">Gold Trading (XAUUSD)</span>
                  <span className="text-slate-400 text-xs">Precious metals spot arbitrage</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-sm mb-1">Currency Pairs</span>
                  <span className="text-slate-400 text-xs">Multi-currency liquidity management</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-sm mb-1">Bitcoin & Crypto</span>
                  <span className="text-slate-400 text-xs">Digital assets & USDT yield pools</span>
                </div>
              </div>
            </div>

            {/* Section 3: Investment Program & Payment System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="neon-card p-6 rounded-2xl border border-cyan-500/20">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" /> Our Investment Program
                </h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Trade yield EXCHANGE offers an investment program with a stated daily return of 1% on qualifying investments.
                </p>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>Minimum Investment:</strong> $300 USDT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Stated Daily Return:</strong> 1% daily yield</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>Profit Activation:</strong> 24 Hours after deposit confirmation</span>
                  </div>
                </div>
              </div>

              <div className="neon-card p-6 rounded-2xl border border-emerald-500/20">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" /> Our Payment System
                </h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  We use USDT through the TRON (TRC20) network for deposits and withdrawals. Users can send and receive payments through compatible external wallets, while the platform manages its designated Binance wallet.
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
                  • Deposit Network: USDT TRC20 | Minimum Deposit: $300<br />
                  • Admin Portal: Official Binance Wallet
                </div>
              </div>
            </div>

            {/* Section 4: Referral Program */}
            <div className="neon-card p-6 rounded-2xl border border-blue-500/20">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Direct Referral Program
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                We offer a direct referral reward program to compensate users who introduce new qualifying investors:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="font-bold text-blue-400 block text-sm mb-1">$50 One-Time Bonus</span>
                  <span className="text-xs text-slate-400">For each qualifying direct referral depositing at least $300.</span>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-400 block text-sm mb-1">$0.20 Daily Reward</span>
                  <span className="text-xs text-slate-400">Continuous daily reward for active referred investors.</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] mt-3">
                * Rewards are available only to the direct referrer. No rewards are paid to higher generations from indirect referrals.
              </p>
            </div>

            {/* Section 5: Core Values */}
            <div className="neon-card p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Our Core Values
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 font-semibold">
                  Efficient Trading System
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 font-semibold">
                  Security-Focused Operations
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 font-semibold">
                  Quality Customer Support
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 font-semibold">
                  Transparent Policies
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 font-semibold">
                  Convenient Payment Services
                </div>
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

export default AboutUsPage;