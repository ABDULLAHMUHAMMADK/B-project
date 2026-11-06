// src/pages/MarketPage.jsx
import React, { useState } from 'react';
import { TrendingUp, BarChart2, Globe, DollarSign, Activity } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Toast from '../components/common/Toast';
import MarketOverviewWidget from '../components/dashboard/MarketOverviewWidget';

const MarketPage = () => {
  const logout = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const marketAssets = [
    { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', price: '96,450.00', change: '+3.45%', positive: true, volume: '$34.2B', category: 'Crypto' },
    { symbol: 'ETHUSDT', name: 'Ethereum / USDT', price: '3,420.50', change: '+2.10%', positive: true, volume: '$18.5B', category: 'Crypto' },
    { symbol: 'XAUUSD', name: 'Gold / US Dollar', price: '2,745.20', change: '+0.85%', positive: true, volume: '$42.1B', category: 'Commodities' },
    { symbol: 'EURUSD', name: 'Euro / US Dollar', price: '1.0845', change: '-0.32%', positive: false, volume: '$89.4B', category: 'Forex' },
    { symbol: 'SOLUSDT', name: 'Solana / USDT', price: '198.80', change: '+5.75%', positive: true, volume: '$8.3B', category: 'Crypto' },
    { symbol: 'GBPUSD', name: 'British Pound / USD', price: '1.2980', change: '-0.15%', positive: false, volume: '$55.2B', category: 'Forex' },
  ];

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col relative pb-20 md:pb-6">
      <Navbar
        onMobileSidebarToggle={() => setSidebarOpen(true)}
        onOpenNotifications={() => showToast('No new market alerts')}
      />

      <div className="max-w-7xl mx-auto w-full flex gap-6 px-4 py-6 md:px-8 flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLogout={logout}
        />

        <main className="flex-1 min-w-0">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl neon-card p-6 mb-6 border border-cyan-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Institutional Liquidity</span>
                  <span className="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full border border-cyan-700">Real-Time Feeds</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                  <BarChart2 className="w-7 h-7 text-cyan-400" /> Financial Markets Terminal
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Live order book values, technical market metrics, and multi-asset price analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Live Market Streaming Widget */}
          <div className="mb-6">
            <MarketOverviewWidget />
          </div>

          {/* Market Grid & Active Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Asset Selection List */}
            <div className="neon-card p-5 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" /> Watchlist & Liquidity Ticker
              </h3>
              <div className="space-y-3">
                {marketAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset.symbol)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      selectedAsset === asset.symbol
                        ? 'bg-cyan-950/60 border-cyan-500/60 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{asset.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {asset.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Vol: {asset.volume}</span>
                    </div>

                    <div className="text-right">
                      <span className="block font-mono font-bold text-xs text-slate-200">${asset.price}</span>
                      <span className={`text-[11px] font-bold ${asset.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {asset.change}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* TradingView Chart Container */}
            <div className="lg:col-span-2 neon-card p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Live Technical Candlestick ({selectedAsset})</h3>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Streaming
                </span>
              </div>

              <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                <iframe
                  title="TradingView Technical Chart"
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${selectedAsset}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=060a12&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${selectedAsset}`}
                  className="w-full h-full border-0"
                />
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

export default MarketPage;