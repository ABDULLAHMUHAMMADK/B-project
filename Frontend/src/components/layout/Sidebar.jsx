// src/components/layout/Sidebar.jsx
import React, { memo } from 'react';
import {
  PieChart,
  Clock,
  Users,
  ShieldCheck,
  User,
  LogOut,
  X,
  Activity,
  Power,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSystemStore } from '../../store/useSystemStore';

const Sidebar = memo(({ isOpen, onCloseSidebar, onLogout, activeTab, setActiveTab, pendingWithdrawalsCount = 0 }) => {
  const user = useAuthStore((state) => state.user);
  const { isMaintenanceMode, toggleMaintenanceMode } = useSystemStore();

  const activeClass =
    'flex items-center justify-between w-full px-4 py-3 rounded-xl bg-purple-950/60 text-purple-300 font-semibold border border-purple-700/40 shadow-lg shadow-purple-950/50 text-left';
  const inactiveClass =
    'flex items-center justify-between w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-slate-900/80 hover:text-purple-300 transition text-left';

  const handleNavClick = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onCloseSidebar) onCloseSidebar();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a101d] border-r border-purple-900/30 p-5 transform transition-transform duration-300 md:relative md:translate-x-0 md:bg-transparent md:border-r-0 md:p-0 md:w-60 shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center mb-6 md:hidden">
        <span className="text-lg font-bold text-purple-400">Navigation Menu</span>
        <button onClick={onCloseSidebar} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* User Profile Box */}
      <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-purple-400 bg-purple-950 flex items-center justify-center text-purple-300 font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-purple-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {user?.role === 'admin' ? 'Super Admin' : 'Verified Client'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5">
        <button
          onClick={() => handleNavClick('overview')}
          className={activeTab === 'overview' ? activeClass : inactiveClass}
        >
          <div className="flex items-center gap-3">
            <PieChart className="w-5 h-5 text-purple-400" />
            <span>Overview</span>
          </div>
        </button>

        {user?.role === 'admin' && (
          <>
            <button
              onClick={() => handleNavClick('withdrawals')}
              className={activeTab === 'withdrawals' ? activeClass : inactiveClass}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Cashout Queue</span>
              </div>
              {pendingWithdrawalsCount > 0 && (
                <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                  {pendingWithdrawalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('users')}
              className={activeTab === 'users' ? activeClass : inactiveClass}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>User Directory</span>
              </div>
            </button>
          </>
        )}

        <button
          onClick={() => handleNavClick('profile')}
          className={activeTab === 'profile' ? activeClass : inactiveClass}
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Profile Settings</span>
          </div>
        </button>
      </nav>

      {/* Admin Maintenance Control & Logout */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
        {user?.role === 'admin' && (
          <button
            onClick={() => toggleMaintenanceMode()}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
              isMaintenanceMode
                ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isMaintenanceMode ? 'Maintenance Mode: ON' : 'Toggle Maintenance'}</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Status Card */}
      <div className="mt-6 p-4 rounded-xl neon-card hidden md:block text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">System Engine:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Active
          </span>
        </div>
        <p className="text-slate-400">Real-time off-chain ledger & yield engine.</p>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;