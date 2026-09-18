import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ShieldCheck, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || user.email[0]}`.toUpperCase()
    : 'U';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sync Active</span>
        </div>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30">
            {initials}
          </div>
          <div className="hidden sm:block text-left leading-none">
            <p className="text-xs font-medium text-white">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
            </p>
            <p className="text-[10px] text-slate-400 uppercase mt-0.5">
              {user?.tier} Plan
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
