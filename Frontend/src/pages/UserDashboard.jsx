import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Vault,
  TrendingUp,
  UserPlus,
  Wallet,
  PlusCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

import axiosInstance from '../api/axiosInstance';
import { initSocket, disconnectSocket } from '../api/socket';
import { useAuthStore } from '../store/useAuthStore';

// Layout & Modular Components
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import StatCard from '../components/common/StatCard';
import Toast from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Dashboard Specific Components
import GrowthChart from '../components/dashboard/GrowthChart';
import LedgerTable from '../components/dashboard/LedgerTable';
import MarketOverviewWidget from '../components/dashboard/MarketOverviewWidget';

// Modals
import DepositModal from '../components/modals/DepositModal';
import WithdrawModal from '../components/modals/WithdrawModal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const UserDashboard = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeChartFilter, setActiveChartFilter] = useState('7D');

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await axiosInstance.get('/wallet/me');
      return res.data.data;
    },
  });

  useEffect(() => {
    const socket = initSocket();

    if (socket) {
      socket.on('WALLET_UPDATED', () => {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        showToast('Wallet balance updated in real-time!');
      });

      socket.on('YIELD_PAID', (data) => {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        showToast(`Daily yield credited: +$${data.amount} USDT`);
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [queryClient]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }, []);

  const mainBalance = wallet?.mainBalance || 0;
  const profitBalance = wallet?.profitBalance || 0;
  const referralBalance = wallet?.referralBalance || 0;
  const totalWithdrawable = mainBalance + profitBalance + referralBalance;

  const chartData = useMemo(() => {
    const labels = activeChartFilter === '7D'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : activeChartFilter === '1M'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const dataPoints = activeChartFilter === '7D'
      ? [mainBalance * 0.9, mainBalance * 0.93, mainBalance * 0.95, mainBalance * 0.97, mainBalance * 0.98, mainBalance * 0.99, totalWithdrawable]
      : [mainBalance * 0.8, mainBalance * 0.85, mainBalance * 0.92, totalWithdrawable];

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Valuation (USDT)',
          data: dataPoints,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0088ff',
          pointBorderColor: '#ffffff',
        },
      ],
    };
  }, [activeChartFilter, mainBalance, totalWithdrawable]);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Managed Capital Account</span>
                  <span className="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full border border-cyan-700">Auto-Yield On</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome, {user?.name || 'Investor'}</h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Real-time off-chain investment ledger & Binance yield portal.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setDepositOpen(true)}
                  className="flex-1 sm:flex-none btn-neon-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => setWithdrawOpen(true)}
                  className="flex-1 sm:flex-none btn-neon-outline px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Investment"
              value={`$${mainBalance.toFixed(2)}`}
              unit="USDT"
              icon={Vault}
              subText="Capital Locked"
              badgeText="Active"
            />
            <StatCard
              title="Profit Earnings"
              value={`$${profitBalance.toFixed(2)}`}
              unit="USDT"
              icon={TrendingUp}
              subText="Daily 1% Compounding"
              badgeText="Daily"
              accentColor="emerald"
            />
            <StatCard
              title="Referral Commission"
              value={`$${referralBalance.toFixed(2)}`}
              unit="USDT"
              icon={UserPlus}
              subText="Direct & Passive Rewards"
              badgeText="Network"
              accentColor="blue"
            />
            <StatCard
              title="Withdrawable Balance"
              value={`$${totalWithdrawable.toFixed(2)}`}
              unit="USDT"
              icon={Wallet}
              subText="Binance Cashout"
              badgeText="Ready"
              highlight
            />
          </div>

          <MarketOverviewWidget />

          <div className="mb-6">
            <ErrorBoundary>
              <GrowthChart
                chartData={chartData}
                activeFilter={activeChartFilter}
                onFilterChange={setActiveChartFilter}
              />
            </ErrorBoundary>
          </div>

          <LedgerTable transactions={wallet?.history || []} />
        </main>
      </div>

      <BottomNav />
      <Toast message={toastMsg} />

      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} onShowToast={showToast} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} onShowToast={showToast} />
    </div>
  );
};

export default UserDashboard;