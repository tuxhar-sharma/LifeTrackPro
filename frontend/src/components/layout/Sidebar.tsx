import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  Flame,
  BarChart3,
  Zap,
  Sparkles,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      to: '/app/dashboard',
      label: 'Synergy Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      to: '/app/expenses',
      label: 'Financial Ledger',
      icon: <ReceiptText className="w-5 h-5" />,
    },
    {
      to: '/app/income',
      label: 'Income Streams',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      to: '/app/habits',
      label: 'Discipline & Habits',
      icon: <Flame className="w-5 h-5" />,
    },
    {
      to: '/app/analytics',
      label: 'Financial Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 h-full">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3 py-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-tight">
                LifeTrack <span className="text-indigo-400">Pro</span>
              </h1>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Telemetry OS
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Account & Tier widget */}
      <div className="space-y-3">
        <div className="p-3.5 bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300">Tier Status</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {user?.tier || 'free'}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">
            {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
