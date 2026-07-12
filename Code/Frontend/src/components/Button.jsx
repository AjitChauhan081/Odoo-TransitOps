export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'h-10 px-4 text-[11px] font-mono uppercase tracking-wide rounded-sm border transition-colors duration-150 ease-out disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-accent text-ink border-accent hover:border-line-strong active:bg-[#e6a01c]',
    dark: 'bg-ink text-paper border-ink hover:opacity-90 active:bg-[#000]',
    secondary: 'bg-paper text-ink border-line hover:border-ink',
    danger: 'bg-paper text-status-danger border-status-danger hover:bg-status-danger hover:text-paper',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
