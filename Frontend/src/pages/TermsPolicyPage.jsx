// src/pages/TermsPolicyPage.jsx
import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Lock,
  DollarSign,
  Globe,
  Target,
  Users,
  Coins,
  Wallet,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Toast from '../components/common/Toast';

const TermsPolicyPage = () => {
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
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Trade Yield EXCHANGE</span>
              <span className="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full border border-cyan-700">
                Official Platform Policies
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-cyan-400" /> Platform Overview & Terms
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Your Gateway to Digital Financial Markets — Comprehensive policies, trading services, and program guidelines.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Section 1: Who We Are & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="neon-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" /> Who We Are
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Trade Yield EXCHANGE is a digital trading and investment platform focused on Forex, Gold (XAUUSD), Currency Pairs, and Cryptocurrencies. Our platform aims to provide users with a simple and accessible way to manage their accounts, explore financial market services, and participate in our investment program.
                </p>
              </div>

              <div className="neon-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" /> Our Mission & Vision
                </h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  <strong>Mission:</strong> To make digital financial services accessible through an organized platform, professional trading operations, and convenient account management.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Vision:</strong> To develop Trade Yield EXCHANGE into a recognized digital financial platform by providing accessible trading services, organized investment management, and a user-friendly experience.
                </p>
              </div>
            </div>

            {/* Section 2: Trading Services & Professional Team */}
            <div className="neon-card p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" /> Financial Trading Services & Professional Team
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Our platform works with experienced trading professionals who conduct market research and manage trading activities according to the platform's trading strategies across four primary financial markets:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">Forex Trading</span>
                  <span className="text-slate-400 text-[11px]">Major fiat currency pairs execution</span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">Gold Trading (XAUUSD)</span>
                  <span className="text-slate-400 text-[11px]">Precious metals spot arbitrage</span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">Currency Pairs</span>
                  <span className="text-slate-400 text-[11px]">Global exchange pair liquidity</span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">Bitcoin & Crypto</span>
                  <span className="text-slate-400 text-[11px]">Digital assets & USDT liquidity</span>
                </div>
              </div>
            </div>

            {/* Section 3: Investment Program & Capital Rules */}
            <div className="neon-card p-6 rounded-2xl border border-cyan-500/20">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" /> Investment Program & Capital Policy
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Trade Yield EXCHANGE offers an investment program with a stated daily return of 1% on qualifying investments. The minimum investment is $300, and the profit activation period is 24 hours after successful deposit confirmation.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Deposit Level</th>
                      <th className="py-2.5 px-3">Stated Daily Return</th>
                      <th className="py-2.5 px-3 text-right">Profit Activation Window</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$300 USDT (Minimum)</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">1% / day</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">24 Hours</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$500 USDT Tiers</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">1% / day</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">24 Hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Payment System & Network */}
            <div className="neon-card p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Payment & Withdrawal System
              </h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                We use USDT through the TRON (TRC20) network for deposits and withdrawals. Users can send and receive payments through compatible external wallets, while the platform manages its designated Binance wallet.
              </p>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>20% Withdrawal Fee:</strong> All withdrawal requests carry a standard 20% platform processing fee (e.g., a $100 cashout request yields a net $80 USDT payout).
                </span>
              </div>
            </div>

            {/* Section 5: Direct Referral Program */}
            <div className="neon-card p-6 rounded-2xl border border-blue-500/20">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Direct Referral Program Rules
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>$50 One-Time Bonus:</strong> Awarded for each qualifying direct referral depositing at least $300.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>$0.20 Daily Referral Reward:</strong> Ongoing daily reward for active referred investors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Direct Referrer Only:</strong> Rewards are available exclusively to the direct referrer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>No Indirect Overrides:</strong> No rewards are paid to higher generations from indirect referrals.</span>
                </li>
              </ul>
            </div>

            {/* Section 6: Core Values */}
            <div className="neon-card p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
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
                  Convenient Payments
                </div>
              </div>
            </div>

            {/* Section 7: Risk Disclosure */}
            <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-rose-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" /> Financial Risk Disclosure
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Trading in financial markets—including Forex, Gold, and Cryptocurrencies—involves risk of capital loss. While Trade Yield EXCHANGE target payouts are managed by algorithmic strategies and experienced professionals, market returns fluctuate based on liquidity conditions.
              </p>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
      <Toast message={toastMsg} />
    </div>
  );
};

export default TermsPolicyPage;