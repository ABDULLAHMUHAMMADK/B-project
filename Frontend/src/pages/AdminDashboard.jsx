// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Power } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useSystemStore } from '../store/useSystemStore';
import Navbar from '../components/layout/Navbar';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { isMaintenanceMode, setMaintenanceMode } = useSystemStore();
  const [toast, setToast] = useState('');

  // 1. Fetch system-wide liquidity & user stats
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/stats');
      return res.data.data;
    },
  });

  // 2. Fetch pending manual deposits queue
  const { data: pendingDeposits } = useQuery({
    queryKey: ['pendingDeposits'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/deposits/pending');
      return res.data.data;
    },
  });

  // 3. Fetch pending cashout requests queue
  const { data: pendingWithdrawals } = useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/withdrawals/pending');
      return res.data.data;
    },
  });

  // Deposit Approval / Rejection Mutation
  const depositActionMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      const res = await axiosInstance.put(`/admin/deposits/${id}/action`, { action });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pendingDeposits'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setToast(data.message);
      setTimeout(() => setToast(''), 3000);
    },
  });

  // Withdrawal Approval / Rejection Mutation
  const withdrawalActionMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      const res = await axiosInstance.put(`/admin/withdrawals/${id}/action`, { action });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setToast(data.message);
      setTimeout(() => setToast(''), 3000);
    },
  });

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 pb-12">
      <Navbar onMobileSidebarToggle={() => {}} onOpenNotifications={() => {}} />

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
            {toast}
          </div>
        )}

        {/* Header & Maintenance Mode Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-purple-400" /> Admin Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">Review pending manual deposits, process cashouts, & toggle system flags.</p>
          </div>

          <button
            onClick={() => setMaintenanceMode(!isMaintenanceMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
              isMaintenanceMode
                ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isMaintenanceMode ? 'Maintenance Mode: ACTIVE' : 'Toggle Maintenance Mode'}</span>
          </button>
        </div>

        {/* System Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="neon-card p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats?.totalUsers || 0}</div>
          </div>
          <div className="neon-card p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400">Total System Liquidity</span>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">${stats?.totalLiquidity?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="neon-card p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400">Pending Deposits Queue</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats?.pendingDepositsCount || 0}</div>
          </div>
          <div className="neon-card p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400">Pending Cashouts Queue</span>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">{stats?.pendingWithdrawalsCount || 0}</div>
          </div>
        </div>

        {/* Pending Cashout Requests Queue */}
        <div className="neon-card p-6 rounded-2xl mb-8">
          <h3 className="text-base font-bold text-white mb-4">Pending Withdrawal Requests Queue</h3>
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
                {pendingWithdrawals?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">No pending cashout requests.</td>
                  </tr>
                ) : (
                  pendingWithdrawals?.map((w) => (
                    <tr key={w._id}>
                      <td className="py-3 px-3 font-semibold text-white">{w.user?.email}</td>
                      <td className="py-3 px-3 font-bold text-slate-300">${w.amount} USDT</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">${w.netAmount} USDT</td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => withdrawalActionMutation.mutate({ id: w._id, action: 'APPROVE' })}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                        >
                          Approve & Pay
                        </button>
                        <button
                          onClick={() => withdrawalActionMutation.mutate({ id: w._id, action: 'REJECT' })}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Manual Deposits Review Queue */}
        <div className="neon-card p-6 rounded-2xl mb-8">
          <h3 className="text-base font-bold text-white mb-4">Pending Manual Deposits (TxID Submissions)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3">Investor Email</th>
                  <th className="py-3 px-3">Transaction TxID</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingDeposits?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">No pending deposit requests.</td>
                  </tr>
                ) : (
                  pendingDeposits?.map((dep) => (
                    <tr key={dep._id}>
                      <td className="py-3 px-3 font-semibold text-white">{dep.user?.email}</td>
                      <td className="py-3 px-3 font-mono text-cyan-300">{dep.txHash}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">${dep.amount} USDT</td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => depositActionMutation.mutate({ id: dep._id, action: 'APPROVE' })}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => depositActionMutation.mutate({ id: dep._id, action: 'REJECT' })}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;