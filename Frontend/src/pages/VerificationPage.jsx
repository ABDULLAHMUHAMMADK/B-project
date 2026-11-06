// src/pages/VerificationPage.jsx
import React, { useState } from 'react';
import { UserCheck, Shield, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Toast from '../components/common/Toast';

const VerificationPage = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleDummyUpload = (e) => {
    e.preventDefault();
    showToast('KYC documents submitted for review (Dummy Mode)');
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
              <UserCheck className="w-7 h-7 text-cyan-400" /> Identity Verification (KYC)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Verify your identity to unlock unrestricted capital withdrawals and higher tier trading limits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" /> Submit Verification Documents
              </h3>

              <form onSubmit={handleDummyUpload} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Document Type</label>
                  <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-cyan-500">
                    <option>National Passport</option>
                    <option>Driver's License</option>
                    <option>Government Issued ID Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Document Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A12345678"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl text-center bg-slate-900/40">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-semibold">Upload Front & Back Photo</p>
                  <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG up to 10MB</p>
                </div>

                <button
                  type="submit"
                  className="btn-neon-primary w-full py-2.5 rounded-xl font-bold text-xs"
                >
                  Submit Verification Form
                </button>
              </form>
            </div>

            <div className="neon-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" /> Verification Status
                </h3>
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl mb-4">
                  <span className="text-xs font-bold text-amber-400 block mb-1">Status: Pending Verification</span>
                  <p className="text-[11px] text-slate-300">
                    Your account is currently operating under Tier-1 verification limits. Complete document upload for full verification.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Binance Cashout
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2-Tier Referral Bonus Access
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

export default VerificationPage;