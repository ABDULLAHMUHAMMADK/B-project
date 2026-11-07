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
  Clock,
  ArrowDownCircle,
  ArrowUpRight,
  PauseCircle,
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
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Trade yield EXCHANGE
              </span>
              <span className="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full border border-cyan-700">
                Official Investment & Policy Terms
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-cyan-400" /> Platform Terms & Investment Policy
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Your Gateway to Digital Financial Markets — Complete rules for deposits, yield processing, cashouts, and referrals.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* 1. Professional Trading Investment Program */}
            <div className="neon-card p-6 rounded-2xl border border-cyan-500/20">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Coins className="w-5 h-5 text-cyan-400" /> 1. Professional Trading Investment Program
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Trade yield EXCHANGE provides an investment platform focused on Forex, Gold (XAUUSD), Currency Pairs, and Cryptocurrencies. Our platform operates with a professional trading team and offers an investment program with a stated daily return of 1% on qualifying investments.
              </p>

              {/* Investment Rules Matrix Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Policy Parameter</th>
                      <th className="py-2.5 px-3">Rule Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Minimum Investment</td>
                      <td className="py-2.5 px-3 text-cyan-400 font-bold">$300 USDT</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Daily Stated Return</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">1% of qualifying investment</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Activation Period</td>
                      <td className="py-2.5 px-3 text-slate-300">24 Hours after deposit confirmation</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Payment Currency & Network</td>
                      <td className="py-2.5 px-3 text-slate-300">USDT (TRON TRC20 Network)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Admin Wallet Portal</td>
                      <td className="py-2.5 px-3 text-amber-400 font-semibold">Binance Admin Wallet</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Minimum Account Balance</td>
                      <td className="py-2.5 px-3 text-white font-bold">$300 USDT</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Profit Payment Frequency</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">Daily, according to the program</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Investment Conditions Bullet Points */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                <p className="font-bold text-white text-xs mb-1">Investment Conditions:</p>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>1. The minimum investment amount is strictly $300 USDT.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>2. A 24-hour activation period begins immediately after successful deposit confirmation.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>3. The stated daily return is 1% of the qualifying investment amount.</span>
                </div>
                <div className="flex items-start gap-2 text-amber-300">
                  <PauseCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>4. Minimum Balance Rule:</strong> If the account balance falls below $300, daily profit payments are paused until the balance is restored to the required minimum.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>5. All investment transactions must be recorded transparently in the user's account.</span>
                </div>
              </div>
            </div>

            {/* 2. Deposit Policy */}
            <div className="neon-card p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-400" /> 2. Secure USDT Deposit System
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Trade yield EXCHANGE accepts deposits in USDT through the TRON (TRC20) network. Users can send payments from their personal wallets to the platform's designated Binance admin wallet.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block">1. Network Standard</span>
                  <span className="text-[11px] text-slate-400">Only USDT TRC20 deposits are accepted.</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block">2. Deposit Floor</span>
                  <span className="text-[11px] text-slate-400">The minimum deposit is $300 USDT.</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block">3. Official Address</span>
                  <span className="text-[11px] text-slate-400">Users must send funds to the official Binance address displayed in-app.</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block">4. Transaction Proof</span>
                  <span className="text-[11px] text-slate-400">Users must submit their transaction hash ID (TXID).</span>
                </div>
              </div>
            </div>

            {/* 3. Withdrawal Policy */}
            <div className="neon-card p-6 rounded-2xl border border-amber-500/20">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" /> 3. Fast & Convenient Withdrawals
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Trade yield EXCHANGE provides USDT withdrawals through the TRC20 network. Withdrawal requests are processed through the platform's Binance admin wallet.
              </p>
              <ul className="space-y-2 text-slate-300 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Withdrawals are paid strictly in USDT TRC20.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Withdrawal Fee:</strong> The processing fee is 20% of the cashout request amount.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Processing Time:</strong> Fast stated execution within <strong>1 to 30 minutes</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Users must provide a valid USDT TRC20 wallet address for cashouts.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Every withdrawal request is subject to security verification.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>The initial withdrawal period begins within the first 24 hours after deposit.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>After the initial 24-hour period, the stated $50 profit threshold applies, subject to finalized terms.</span>
                </li>
              </ul>
            </div>

            {/* 4. Referral Policy */}
            <div className="neon-card p-6 rounded-2xl border border-blue-500/20">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> 4. Direct Referral Reward Program
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Trade yield EXCHANGE offers a referral program that rewards users for bringing new qualifying investors through their personal referral links.
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3">Reward Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Minimum Referral Deposit</td>
                      <td className="py-2.5 px-3 text-cyan-400 font-bold">$300 USDT</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">One-Time Referral Bonus</td>
                      <td className="py-2.5 px-3 text-blue-400 font-bold">$50 USDT flat</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Daily Referral Reward</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">$0.20 / day</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Bonus Activation</td>
                      <td className="py-2.5 px-3 text-slate-300">After 24-hour activation window</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-xs mb-1">Generation Rules:</p>
                <p>1. <strong>First Generation:</strong> The direct referrer receives a $50 one-time bonus and $0.20 daily reward.</p>
                <p>2. <strong>Second Generation:</strong> Only the Second Generation investor's direct referrer receives the $50 bonus and $0.20 daily reward.</p>
                <p>3. <strong>No Override Rule:</strong> First Generation users do not receive rewards from Second Generation investors.</p>
                <p>4. <strong>Direct Sponsor Exclusivity:</strong> Referral rewards are provided only for qualifying direct referrals.</p>
              </div>
            </div>

            {/* 5. Important Policy Notice */}
            <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-rose-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" /> 5. Important Policy Notice & Financial Disclaimer
              </h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                All investment amounts, return calculations, referral rewards, deposit records, and withdrawal transactions must be clearly displayed in the user's account ledger.
              </p>
              <p className="text-slate-300 leading-relaxed">
                The 1% daily return is a stated financial commitment of the platform. Its payment must be supported by verified funding and a legally authorized operating structure. Investment terms, fees, and withdrawal conditions are disclosed clearly before users deposit funds.
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