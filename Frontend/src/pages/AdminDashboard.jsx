// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Users,
  Power,
  Check,
  X,
  ArrowUpRight,
  Vault,
  Wallet,
  User,
  Key,
  Save,
  CheckCircle,
  Search,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/common/StatCard';
import Toast from '../components/common/Toast';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { isMaintenanceMode, toggleMaintenanceMode } = useSystemStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'withdrawals', 'users', 'profile'
  const [toastMsg, setToastMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // User Directory Search & Filter States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Admin Profile Form States
  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);

  // Admin Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // 1. Fetch system metrics & user segmentation details
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/stats');
      return res.data.data;
    },
  });

  // 2. Fetch pending withdrawal requests queue
  const { data: pendingWithdrawals, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/withdrawals/pending');
      return res.data.data;
    },
  });

  // Approve / Reject Cashout Request Mutation
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

  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    setSavingAdminProfile(true);
    try {
      const res = await axiosInstance.put('/user/profile', { name: adminName, email: adminEmail });
      if (updateUser && res.data?.data) {
        updateUser(res.data.data);
      }
      showToast('Admin profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update admin profile');
    } finally {
      setSavingAdminProfile(false);
    }
  };

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await axiosInstance.put('/user/change-password', {
        currentPassword,
        newPassword,
      });
      showToast('Admin password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to change admin password');
    } finally {
      setChangingPassword(false);
    }
  };

  const metrics = statsData?.metrics;
  const userList = statsData?.userInvestmentDetails || [];

  // Filter User Directory by Search Term (Name/Email) and Status
  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());

    const matchesStatus =
      userStatusFilter === 'ALL' || u.status === userStatusFilter;

    return matchesSearch && matchesStatus;
  });

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
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingWithdrawalsCount={metrics?.pendingWithdrawalsCount || 0}
        />

        <main className="flex-1 min-w-0">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl neon-card p-6 mb-6 border border-purple-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">System Administration</span>
                  <span className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-700">Executive Control</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-7 h-7 text-purple-400" /> Executive Control Center
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Live platform liquidity overview, fee revenue audit, user directory, and cashout queue management.
                </p>
              </div>

              <button
                onClick={() => toggleMaintenanceMode()}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                  isMaintenanceMode
                    ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isMaintenanceMode ? 'Maintenance Mode: ON' : 'Toggle Maintenance'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: EXECUTIVE OVERVIEW */}
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

          {/* TAB 2: CASHOUT REQUESTS QUEUE */}
          {activeTab === 'withdrawals' && (
            <div className="neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                Pending Cashout Requests Queue
              </h3>
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

          {/* TAB 3: USER DIRECTORY (With Search & Filters) */}
          {activeTab === 'users' && (
            <div className="neon-card p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" /> User Directory & Threshold Status
                </h3>

                {/* Search Bar & Status Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {[
                      { label: 'All Users', key: 'ALL' },
                      { label: 'Qualified', key: 'ACTIVE_QUALIFIED' },
                      { label: '< $300', key: 'BELOW_THRESHOLD' },
                      { label: '$0 Balance', key: 'UNINVESTED' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => setUserStatusFilter(st.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition ${
                          userStatusFilter === st.key
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                    {loadingStats ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">
                          Loading user directory...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">
                          No users matched your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.userId} className="hover:bg-slate-900/40">
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

          {/* TAB 4: ADMIN PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="neon-card p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" /> Admin Credentials
                </h3>

                <form onSubmit={handleUpdateAdminProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Administrator Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Security Level</label>
                    <div className="inline-block bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full text-[11px] font-bold">
                      Super Admin Privileges
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingAdminProfile}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingAdminProfile ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </form>
              </div>

              <div className="neon-card p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" /> Security & Password
                </h3>

                <form onSubmit={handleChangeAdminPassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Passwords must be at least 6 characters.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <Toast message={toastMsg} />
    </div>
  );
};

export default AdminDashboard;