// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Coins,
  ArrowRight,
  BarChart2,
  DollarSign,
  AlertTriangle,
  Lock,
  Globe,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import MarketOverviewWidget from '../components/dashboard/MarketOverviewWidget';

const LandingPage = () => {
  const { isAuthenticated, role } = useAuthStore();

  // Smart Role-Based Portal Path Resolution
  const portalPath = !isAuthenticated
    ? '/login'
    : role === 'admin'
    ? '/admin'
    : '/dashboard';

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#070c16]/90 backdrop-blur-md border-b border-cyan-900/30 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-wide text-white">
              Trade<span className="text-cyan-400">Yield</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#about" className="hover:text-cyan-400 transition">About Us</a>
            <a href="#policy" className="hover:text-cyan-400 transition">Investment Policy</a>
            <a href="#referral" className="hover:text-cyan-400 transition">Referral Program</a>
            <a href="#terms" className="hover:text-cyan-400 transition">Terms & Risk</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={portalPath}
                className="btn-neon-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span>{role === 'admin' ? 'Executive Portal' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-cyan-800 text-cyan-300 hover:bg-cyan-950/50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-neon-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-bold mb-6">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Institutional Multi-Asset Yield Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Automated Crypto, Forex & Gold Yield Trading
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-8">
            TradeYield provides transparent access to global financial markets. Participate in our capital program featuring a promised 1% daily return, automated 24-hour activation, and direct Binance payouts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? portalPath : '/register'}
              className="btn-neon-primary w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Open Portal' : 'Start Investing ($300 Min)'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={portalPath}
              className="btn-neon-outline w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              <span>{role === 'admin' ? 'Access Executive Center' : 'Access Client Portal'}</span>
            </Link>
          </div>
        </div>

        {/* Core Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="neon-card p-5 rounded-2xl border border-cyan-500/20">
            <DollarSign className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">1% Daily Returns</h3>
            <p className="text-xs text-slate-400">Fixed 1% daily yield credited directly to your profit ledger.</p>
          </div>
          <div className="neon-card p-5 rounded-2xl border border-cyan-500/20">
            <Lock className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">24-Hour Profit Activation</h3>
            <p className="text-xs text-slate-400">Yield processing starts 24 hours after deposit confirmation.</p>
          </div>
          <div className="neon-card p-5 rounded-2xl border border-cyan-500/20">
            <Globe className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Multi-Market Execution</h3>
            <p className="text-xs text-slate-400">Capital deployed across Forex, Gold (XAUUSD), and Crypto assets.</p>
          </div>
        </div>

        {/* Live Market Ticker */}
        <MarketOverviewWidget />
      </section>

      {/* 3. About Us Section */}
      <section id="about" className="py-16 px-4 md:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Platform Overview</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">About TradeYield</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
              TradeYield is a digital investment portal designed to connect retail investors with multi-asset financial trading. Our liquidity management spans major global markets:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <Coins className="w-6 h-6 text-cyan-400 mb-2" />
              <h4 className="text-sm font-bold text-white">Forex Markets</h4>
              <p className="text-xs text-slate-400 mt-1">Major currency pairs including EUR/USD, GBP/USD, and USD/JPY.</p>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <Coins className="w-6 h-6 text-amber-400 mb-2" />
              <h4 className="text-sm font-bold text-white">Gold (XAUUSD)</h4>
              <p className="text-xs text-slate-400 mt-1">Precious metals spot trading and high-frequency liquidity arbitrage.</p>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <Coins className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="text-sm font-bold text-white">Cryptocurrency</h4>
              <p className="text-xs text-slate-400 mt-1">Bitcoin (BTC), Ethereum (ETH), Solana (SOL), and USDT staking pools.</p>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <Coins className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="text-sm font-bold text-white">Referral Engine</h4>
              <p className="text-xs text-slate-400 mt-1">Two-generation structured reward payouts for direct client referrals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Investment Policy & Tiers */}
      <section id="policy" className="py-16 px-4 md:px-8 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Capital Rules</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Investment Policy & Terms</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2">
              Transparent tier structures, minimum deposit thresholds, and profit activation timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="neon-card p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4">Minimum Capital Requirements</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                The minimum initial investment required to activate an account is <strong className="text-cyan-400">$300 USDT</strong>. Deposits accumulate daily returns after an initial 24-hour setup period.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Investment Deposit</th>
                      <th className="py-2.5 px-3 text-right">Promised Daily Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$300 USDT</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">1% / day</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$500 USDT</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">1% / day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> 24-Hour Profit Activation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon deposit confirmation via Binance Pay or blockchain network, a 24-hour ledger setup begins. Daily returns credit automatically at midnight after activation.
                </p>
              </div>

              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> 20% Withdrawal Fee
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All cashout payouts carry a standard 20% platform processing fee. For example, a $100 payout yields a net $80 USDT transfer to your Binance Pay ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Referral Reward System */}
      <section id="referral" className="py-16 px-4 md:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Network Growth</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">2-Generation Referral Program</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2">
              Earn direct bonus payouts and daily passive rewards by inviting verified investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Generation */}
            <div className="neon-card p-6 rounded-2xl border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" /> Generation 1 (Direct Referral)
                </h3>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-800 font-bold">
                  Direct Rewards
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Earn flat cash bonuses and daily passive payments when clients register using your direct referral link.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Referred Deposit</th>
                      <th className="py-2.5 px-3">Direct Bonus</th>
                      <th className="py-2.5 px-3 text-right">Daily Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$300 USDT</td>
                      <td className="py-2.5 px-3 font-bold text-blue-400">$25 USDT</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">$0.20 / day</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">$500 USDT</td>
                      <td className="py-2.5 px-3 font-bold text-blue-400">$50 USDT</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">$0.20 / day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Second Generation */}
            <div className="neon-card p-6 rounded-2xl border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Generation 2 (Indirect Referral)
                </h3>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-800 font-bold">
                  Direct Sponsor Rule
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Indirect referrals pass bonuses directly to their immediate sponsor. Higher generations do not accumulate multi-tier passive commissions.
              </p>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <p>• <strong>Strict Direct Reward Rule:</strong> Every user earns referral bonuses exclusively from investors who sign up directly with their link.</p>
                <p>• <strong>No Multi-Level Override:</strong> Second Generation deposits do not send passive yield overrides to Gen 0 accounts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Terms & Risk Disclosure */}
      <section id="terms" className="py-16 px-4 md:px-8 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto bg-rose-950/20 border border-rose-900/40 p-6 md:p-8 rounded-2xl">
          <h3 className="text-lg font-bold text-rose-300 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Risk Disclosure & Compliance Terms
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed space-y-2">
            Trading in financial markets—including Forex, Gold, and Cryptocurrencies—involves substantial risk of capital loss. While TradeYield target payouts are structured around algorithmic strategies, market returns fluctuate. Investors should review platform terms, fee structures, and capital allocation policies before depositing funds.
          </p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#04070d] py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">TradeYield Financial Portal</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to={portalPath} className="hover:text-cyan-400 transition">Portal</Link>
            <a href="#policy" className="hover:text-cyan-400 transition">Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;