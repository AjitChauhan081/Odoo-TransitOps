export function Panel({ title, icon: Icon, actions, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`border border-line bg-paper rounded-sm ${className}`}>
      {title && (
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-paper-dim">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={14} strokeWidth={1.5} className="text-ink-soft" />}
            <h2 className="micro-label !text-ink">{title}</h2>
          </div>
          {actions}
        </header>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
