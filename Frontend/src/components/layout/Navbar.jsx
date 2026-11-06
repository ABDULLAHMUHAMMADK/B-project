// src/components/layout/Navbar.jsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MessageSquare, Menu, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Navbar = memo(({ onMobileSidebarToggle }) => {
  const user = useAuthStore((state) => state.user);

  // Replace this with your actual Telegram or WhatsApp group URL
  const COMMUNITY_GROUP_URL = 'https://t.me/your_official_telegram_group';

  return (
    <header className="sticky top-0 z-30 bg-[#070c16]/90 backdrop-blur-md border-b border-cyan-900/30 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left Branding & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileSidebarToggle}
            className="md:hidden text-gray-300 hover:text-cyan-400 focus:outline-none p-2 rounded-lg bg-gray-900/50"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Clicking Logo or Name Redirects to Main Landing Page */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wide text-white">
                Trade<span className="text-cyan-400">Yield</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Pro V2.4
              </span>
            </div>
          </Link>
        </div>

        {/* Right Community Link & User Info */}
        <div className="flex items-center gap-4">
          {/* Telegram / WhatsApp Official Community Button */}
          <a
            href={COMMUNITY_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative p-2.5 rounded-xl bg-slate-900/80 text-cyan-400 hover:text-white hover:bg-cyan-950/60 border border-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
            title="Join Official Telegram Community"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Community</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-slate-800 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-md shadow-cyan-500/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>
            <div className="hidden sm:block">
              <h4 className="text-sm font-semibold text-white leading-none">{user?.name || 'Investor'}</h4>
              <span className="text-xs text-cyan-400 font-medium">
                {user?.role === 'admin' ? 'System Administrator' : 'VIP Investor'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;