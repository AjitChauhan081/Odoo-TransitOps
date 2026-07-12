import { Menu, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-ink bg-paper">
      <button onClick={onToggleSidebar} className="text-ink-soft hover:text-ink" aria-label="Toggle sidebar">
        <Menu size={20} strokeWidth={1.5} />
      </button>
      <div className="relative flex-1 max-w-sm">
        <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          placeholder="Search..."
          aria-label="Global search"
          className="w-full h-9 pl-9 pr-3 bg-paper-dim font-mono text-[13px] border border-line rounded-sm outline-none focus:border-ink"
        />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline font-mono text-[12px]">{user?.email}</span>
        <span className="px-2 py-1 border border-ink rounded-sm text-[10px] font-mono uppercase tracking-wide">
          {user?.role}
        </span>
        <span className="w-8 h-8 rounded-sm border border-ink flex items-center justify-center font-mono text-[11px] bg-paper-dim">
          {user?.initials}
        </span>
        <button onClick={logout} className="ml-2 text-ink-soft hover:text-ink transition-colors" aria-label="Log out" title="Log out">
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
