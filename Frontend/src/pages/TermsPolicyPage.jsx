// src/pages/TermsPolicyPage.jsx
import React, { useState } from 'react';
import { FileText, ShieldCheck, AlertTriangle, Lock, DollarSign } from 'lucide-react';
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
          <div className="relative overflow-hidden rounded-2xl neon-card p-6 mb-6 border border-cyan-500/30">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-cyan-400" /> Investment Policy & Platform Terms
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Official operating policies, capital rules, fee structures, and financial risk disclosures.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Section 1: Capital Requirements */}
            <div className="neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" /> 1. Minimum Capital & Daily Return Policy
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                The minimum required capital deposit to participate in the TradeYield investment program is $300 USDT.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Deposit Tier</th>
                      <th className="py-2.5 px-3">Promised Daily Return</th>
                      <th className="py-2.5 px-3 text-right">Profit Activation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$300 USDT</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">1% / day</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">24 Hours</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$500 USDT</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">1% / day</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">24 Hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Withdrawal Fee */}
            <div className="neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" /> 2. 20% Withdrawal Fee Policy
              </h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                All withdrawal requests carry a 20% platform processing fee.
              </p>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
                Example: A cashout request of $100 yields a net payout of $80 USDT ($20 platform fee).
              </div>
            </div>

            {/* Section 3: Risk Disclosure */}
            <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-rose-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" /> 3. Financial Risk Disclosure
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Trading in Forex, Gold (XAUUSD), and Cryptocurrencies carries inherent financial risks. Market returns fluctuate based on liquidity conditions.
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