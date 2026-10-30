// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Users,
  DollarSign,
  PieChart,
  LogOut,
  Power,
  Check,
  X,
  Clock,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  Wallet,
  Vault,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';

// Common UI Components
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/common/StatCard';
import Toast from '../components/common/Toast';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { isMaintenanceMode, setMaintenanceMode } = useSystemStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'withdrawals', 'users'
  const [toastMsg, setToastMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // 1. Fetch admin statistics & user segmentation data
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/stats');
      return res.data.data;
    },
  });

  // 2. Fetch pending cashout requests queue
  const { data: pendingWithdrawals, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/withdrawals/pending');
      return res.data.data;
    },
  });

  // Withdrawal Approval / Rejection Mutation
  const withdrawalActionMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      setProcessingId(id);
      const res = await axiosInstance.put(`/admin/withdrawals/${id}/action`, { action });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast(data.message);
      setProcessingId(null);
    },
    onError: (err) => {
      showToast(err.response?.data?.error || 'Failed to process withdrawal action');
      setProcessingId(null);
    },
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const metrics = statsData?.metrics;
  const userList = statsData?.userInvestmentDetails || [];

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col relative pb-20 md:pb-6">
      {/* Navbar Header (Same as UserDashboard) */}
      <Navbar
        onMobileSidebarToggle={() => setSidebarOpen(true)}
        onOpenNotifications={() => showToast('No new notifications')}
      />

      <div className="max-w-7xl mx-auto w-full flex gap-6 px-4 py-6 md:px-8 flex-1">
        {/* Sidebar (Same structure as UserDashboard) */}
        <Sidebar
          isOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0">
          {/* Hero Banner (Designed exactly like UserDashboard Hero) */}
          <div className="relative overflow-hidden rounded-2xl neon-card p-6 mb-6 border border-purple-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Executive Administration</span>
                  <span className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-700">Live Portal</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-7 h-7 text-purple-400" /> Executive Control Center
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Live overview of platform liquidity, fee collections, user balances, and cashout approvals.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setMaintenanceMode(!isMaintenanceMode)}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                    isMaintenanceMode
                      ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{isMaintenanceMode ? 'Maintenance: ON' : 'Toggle Maintenance'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'withdrawals'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Cashout Queue</span>
              {metrics?.pendingWithdrawalsCount > 0 && (
                <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-extrabold ml-1">
                  {metrics.pendingWithdrawalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 StatCards matching UserDashboard exact design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Registered Users"
                  value={loadingStats ? '...' : (metrics?.totalUsers || 0).toString()}
                  unit="Users"
                  icon={Users}
                  subText="Registered Clients"
                  badgeText="Total"
                />
                <StatCard
                  title="System Liquidity"
                  value={`$${loadingStats ? '...' : (metrics?.totalLiquidity?.toFixed(2) || '0.00')}`}
                  unit="USDT"
                  icon={Vault}
                  subText="Invested Main Capital"
                  badgeText="Invested"
                  accentColor="cyan"
                />
                <StatCard
                  title="Total Withdrawable"
                  value={`$${loadingStats ? '...' : (metrics?.totalWithdrawableBalance?.toFixed(2) || '0.00')}`}
                  unit="USDT"
                  icon={Wallet}
                  subText="System Total Assets"
                  badgeText="Withdrawable"
                  accentColor="emerald"
                />
                <StatCard
                  title="20% Platform Revenue"
                  value={`$${loadingStats ? '...' : (metrics?.totalPlatformFeesCollected?.toFixed(2) || '0.00')}`}
                  unit="USDT"
                  icon={ArrowUpRight}
                  subText="Fee Collections"
                  badgeText="Revenue"
                  highlight
                />
              </div>

              {/* Investment Segmentation Card */}
              <div className="neon-card p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">User Investment Segmentation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-emerald-900/40">
                    <span className="text-xs text-slate-400">Fully Qualified (&ge; $300)</span>
                    <div className="text-xl font-extrabold text-emerald-400 mt-1">
                      {metrics?.segmentation?.fullyInvestedCount || 0} Users
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-900/40">
                    <span className="text-xs text-slate-400">Partially Invested (&lt; $300)</span>
                    <div className="text-xl font-extrabold text-amber-400 mt-1">
                      {metrics?.segmentation?.partiallyInvestedCount || 0} Users
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-rose-900/40">
                    <span className="text-xs text-slate-400">Uninvested ($0)</span>
                    <div className="text-xl font-extrabold text-rose-400 mt-1">
                      {metrics?.segmentation?.zeroInvestedCount || 0} Users
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CASHOUT APPROVAL QUEUE */}
          {activeTab === 'withdrawals' && (
            <div className="neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4">Pending Cashout Requests Queue</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-3">Investor Email</th>
                      <th className="py-3 px-3">Gross Amount</th>
                      <th className="py-3 px-3">Net Payout (20% Fee)</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loadingWithdrawals ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500">Loading pending requests...</td>
                      </tr>
                    ) : pendingWithdrawals?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500">No pending withdrawal requests.</td>
                      </tr>
                    ) : (
                      pendingWithdrawals?.map((w) => {
                        const isProcessingThis = processingId === w._id || withdrawalActionMutation.isPending;
                        return (
                          <tr key={w._id}>
                            <td className="py-3 px-3 font-semibold text-white">{w.user?.email}</td>
                            <td className="py-3 px-3 font-bold text-slate-300">${w.amount} USDT</td>
                            <td className="py-3 px-3 font-bold text-emerald-400">${w.netAmount} USDT</td>
                            <td className="py-3 px-3 text-right space-x-2">
                              <button
                                disabled={isProcessingThis}
                                onClick={() => withdrawalActionMutation.mutate({ id: w._id, action: 'APPROVE' })}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-bold transition inline-flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isProcessingThis ? 'Processing...' : 'Approve & Pay'}</span>
                              </button>
                              <button
                                disabled={isProcessingThis}
                                onClick={() => withdrawalActionMutation.mutate({ id: w._id, action: 'REJECT' })}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-bold transition inline-flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{isProcessingThis ? 'Processing...' : 'Reject'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER DIRECTORY & THRESHOLD DEFICIT */}
          {activeTab === 'users' && (
            <div className="neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4">User Investment Directory & Threshold Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-3">Name & Email</th>
                      <th className="py-3 px-3">Invested Capital</th>
                      <th className="py-3 px-3">Total Withdrawable</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Deficit Below $300</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {userList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">No registered users found.</td>
                      </tr>
                    ) : (
                      userList.map((u) => (
                        <tr key={u.userId}>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-3 font-bold text-cyan-400">${u.mainBalance.toFixed(2)} USDT</td>
                          <td className="py-3 px-3 font-bold text-emerald-400">${u.totalWithdrawable.toFixed(2)} USDT</td>
                          <td className="py-3 px-3">
                            {u.status === 'ACTIVE_QUALIFIED' && (
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                Qualified (&ge; $300)
                              </span>
                            )}
                            {u.status === 'BELOW_THRESHOLD' && (
                              <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                Below Threshold
                              </span>
                            )}
                            {u.status === 'UNINVESTED' && (
                              <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                Uninvested ($0)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                            {u.remainingToMinThreshold > 0 ? (
                              <span className="text-amber-400">Needs ${u.remainingToMinThreshold.toFixed(2)} USDT</span>
                            ) : (
                              <span className="text-emerald-400">Threshold Met</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      <Toast message={toastMsg} />
    </div>
  );
};

export default AdminDashboard;