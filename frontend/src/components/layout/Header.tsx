import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Calendar, ShieldCheck, Menu, Sun, Moon, Monitor } from 'lucide-react';

interface HeaderProps {
  onOpenMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || user.email[0]}`.toUpperCase()
    : 'U';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/40 backdrop-blur px-3 sm:px-6 flex items-center justify-between shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-none">{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Theme Switcher Segmented Control */}
        <div
          role="radiogroup"
          aria-label="Theme selection"
          className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-xs"
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            title="Light theme"
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            title="Dark theme"
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            title="System theme"
            className={`hidden sm:flex p-1.5 rounded-lg transition-all cursor-pointer items-center justify-center ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Sync Active</span>
        </div>

        {/* User Account Capsule */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30 shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left leading-none max-w-[140px]">
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mt-0.5 tracking-wider">
              {user?.tier || 'free'} Plan
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
