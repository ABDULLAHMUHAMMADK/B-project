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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { isMaintenanceMode, setMaintenanceMode } = useSystemStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'withdrawals', 'users'
  const [toast, setToast] = useState('');
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
      setToast(data.message);
      setTimeout(() => setToast(''), 3000);
      setProcessingId(null);
    },
    onError: (err) => {
      setToast(err.response?.data?.error || 'Failed to process withdrawal action');
      setTimeout(() => setToast(''), 3000);
      setProcessingId(null);
    },
  });

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const metrics = statsData?.metrics;
  const userList = statsData?.userInvestmentDetails || [];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-cyan-600 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-2xl border border-cyan-400/30">
          {toast}
        </div>
      )}

      {/* Admin Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a0f1d] border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700 flex items-center justify-center text-purple-400 font-black">
              TY
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">TradeYield</h2>
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Admin Portal</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Overview Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeTab === 'withdrawals'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Cashout Queue</span>
              </div>
              {metrics?.pendingWithdrawalsCount > 0 && (
                <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                  {metrics.pendingWithdrawalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 border-t border-slate-800 space-y-3 mt-6">
          <button
            onClick={() => setMaintenanceMode(!isMaintenanceMode)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              isMaintenanceMode
                ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isMaintenanceMode ? 'Maintenance: ON' : 'Maintenance Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-rose-900/30 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Dashboard Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-purple-400" /> Executive Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">Live overview of platform liquidity, fee collections, user balances, and cashout approvals.</p>
          </div>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Financial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Total Registered Users
                </span>
                <div className="text-2xl font-extrabold text-white mt-2">{loadingStats ? '...' : metrics?.totalUsers || 0}</div>
              </div>

              <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Total System Liquidity (Invested)
                </span>
                <div className="text-2xl font-extrabold text-cyan-400 mt-2">
                  ${loadingStats ? '...' : metrics?.totalLiquidity?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Total Withdrawable Balance
                </span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-2">
                  ${loadingStats ? '...' : metrics?.totalWithdrawableBalance?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" /> Total 20% Fees Collected
                </span>
                <div className="text-2xl font-extrabold text-purple-400 mt-2">
                  ${loadingStats ? '...' : metrics?.totalPlatformFeesCollected?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Segmentation Breakdown */}
            <div className="bg-[#0b1222] border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4">User Investment Segmentation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-900/40">
                  <span className="text-xs text-slate-400">Fully Qualified (&ge; $300)</span>
                  <div className="text-xl font-extrabold text-emerald-400 mt-1">
                    {metrics?.segmentation?.fullyInvestedCount || 0} Users
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-900/40">
                  <span className="text-xs text-slate-400">Partially Invested (&lt; $300)</span>
                  <div className="text-xl font-extrabold text-amber-400 mt-1">
                    {metrics?.segmentation?.partiallyInvestedCount || 0} Users
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-rose-900/40">
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
          <div className="bg-[#0b1222] border border-slate-800 p-6 rounded-2xl">
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
          <div className="bg-[#0b1222] border border-slate-800 p-6 rounded-2xl">
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
  );
};

export default AdminDashboard;