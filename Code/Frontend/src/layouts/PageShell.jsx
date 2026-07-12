import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function PageShell({ children, title }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onToggleSidebar={() => {
            setMobileOpen((o) => !o);
            setCollapsed((c) => (window.innerWidth >= 1024 ? !c : c));
          }}
        />
        <main className="flex-1 relative">
          <div className="blueprint-grid-wrap min-h-full">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative z-[1] max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-4"
            >
              {title && <h1 className="font-serif text-[22px]">{title}</h1>}
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
