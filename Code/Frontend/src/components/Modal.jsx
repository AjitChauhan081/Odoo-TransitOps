import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    // focus trap: focus the panel on open
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="bg-paper border border-ink rounded-sm w-full mx-4 outline-none"
            style={{ maxWidth: 640 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-line">
              <h2 className="font-serif text-[17px]">{title}</h2>
              <button onClick={onClose} aria-label="Close dialog" className="text-ink-soft hover:text-ink">
                <X size={18} strokeWidth={1.5} />
              </button>
            </header>
            <div className="p-4">{children}</div>
            {footer && <footer className="flex justify-end gap-2 px-4 py-3 border-t border-line">{footer}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
