export function LifecycleStepper({ steps, activeIndex }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-4 h-4 border rounded-sm ${
                i <= activeIndex ? 'bg-accent border-accent' : 'bg-paper border-line'
              }`}
            />
            <span className={`micro-label !text-[10px] whitespace-nowrap ${i === activeIndex ? '!text-ink' : ''}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-[1px] flex-1 mx-1 ${i < activeIndex ? 'bg-line-strong' : 'bg-line'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
