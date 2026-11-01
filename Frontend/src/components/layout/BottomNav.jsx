import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, FileText, User } from 'lucide-react';

const BottomNav = memo(() => {
  const activeClass = 'text-cyan-400 flex flex-col items-center gap-1 text-[10px] font-semibold';
  const inactiveClass = 'text-slate-400 hover:text-cyan-400 flex flex-col items-center gap-1 text-[10px]';

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-[#070c16]/95 border-t border-cyan-900/40 py-2.5 px-4 md:hidden backdrop-blur-lg">
      <div className="flex justify-around items-center text-center">
        <a href="/" className={inactiveClass}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </a>

        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
          <Wallet className="w-5 h-5" />
          <span>Assets</span>
        </NavLink>

        <NavLink to="/transactions" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
          <FileText className="w-5 h-5" />
          <span>Transactions</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </div>
  );
});

BottomNav.displayName = 'BottomNav';
export default BottomNav;