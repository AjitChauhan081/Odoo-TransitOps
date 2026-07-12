import { NavLink } from 'react-router-dom';
import { Grid2x2, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants/navigation';
import { useRole } from '../context/RBACContext';

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { canAccess } = useRole();
  const items = NAV_ITEMS.filter((item) => canAccess(item.key));

  return (
    <>
      {/* mobile scrim */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-ink text-paper flex flex-col z-50 transition-all duration-200 ease-out overflow-hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Grid2x2 size={20} strokeWidth={1.5} className="text-accent flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-serif text-[16px] leading-tight truncate">TransitOps</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wide truncate">Smart Transport Ops</div>
              </div>
            )}
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-white/60">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-sm text-[12px] font-mono uppercase tracking-wide transition-colors duration-150 ease-out ${
                  isActive ? 'bg-accent text-ink' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
              title={item.label}
            >
              <item.icon size={20} strokeWidth={1.5} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        {!collapsed && (
          <div className="px-4 py-3 border-t border-white/10 text-[10px] text-white/40 font-mono">
            v1.0.0 · Raw Aesthetics
          </div>
        )}
      </aside>
    </>
  );
}
