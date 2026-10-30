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
  Vault,
  Wallet,
  User,
  Menu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';

// Common UI Components
import Navbar from '../components/layout/Navbar';
import StatCard from '../components/common/StatCard';
import Toast from '../components/common/Toast';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { isMaintenanceMode, setMaintenanceMode } = useSystemStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'withdrawals', 'users', 'profile'
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
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-cyan-600 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-2xl border border-cyan-400/30">
          {toastMsg}
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Embedded Sidebar Navigation */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#0a0f1d] border-r border-slate-800 p-5 z-50 flex flex-col justify-between transition-transform duration-300 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700 flex items-center justify-center text-purple-400 font-black">
                TY
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">TradeYield</h2>
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Admin Portal</span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('withdrawals');
                setSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeTab === 'withdrawals'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
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
              onClick={() => {
                setActiveTab('users');
                setSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
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

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 font-extrabold text-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-rose-900/30 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0b1222] p-6 mb-8 border border-slate-800">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 mr-1"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">System Administration</span>
                <span className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-700">Live Portal</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-purple-400" /> Executive Control Center
              </h1>
              <p className="text-xs text-slate-400 mt-1">Live overview of platform liquidity, fee collections, user balances, and cashout approvals.</p>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
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

            <div className="bg-[#0b1222] border border-slate-800 p-6 rounded-2xl">
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

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="bg-[#0b1222] border border-slate-800 p-6 rounded-2xl max-w-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" /> Admin Profile Settings
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Administrator Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || 'Administrator'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || 'admin@tradeyield.io'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Security Role</label>
                <div className="inline-block bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full text-[11px] font-bold">
                  Super Admin Access
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      <Toast message={toastMsg} />
    </div>
  );
};

export default AdminDashboard;