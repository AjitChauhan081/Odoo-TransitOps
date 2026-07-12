import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const NotificationContext = createContext(null);

const ICONS = { success: CheckCircle2, warning: AlertTriangle, info: Info, danger: XCircle };
const COLORS = {
  success: 'status-available',
  warning: 'status-warn',
  danger: 'status-danger',
  info: 'ink-soft',
};

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);

  const notify = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[90vw]">
        <AnimatePresence>
          {items.map((n) => {
            const Icon = ICONS[n.type] || Info;
            const color = COLORS[n.type] || 'ink-soft';
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`flex items-start gap-2 bg-paper border border-${color} rounded-sm p-3 shadow-none`}
              >
                <Icon size={16} strokeWidth={1.5} className={`text-${color} flex-shrink-0 mt-0.5`} />
                <p className="font-mono text-[12px] flex-1">{n.message}</p>
                <button onClick={() => dismiss(n.id)} aria-label="Dismiss notification" className="text-ink-soft hover:text-ink">
                  <X size={14} strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider');
  return ctx.notify;
}
