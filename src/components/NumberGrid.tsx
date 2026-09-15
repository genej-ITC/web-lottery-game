'use client';

interface NumberGridProps {
  selected: number[];
  onToggle: (n: number) => void;
}

const base =
  'aspect-square w-full rounded-full border font-serif text-[17px] font-semibold tabular-nums';

const variants = {
  on: 'border-cyan bg-cyan text-paper shadow-ds-sm animate-ball-pop cursor-pointer hover:border-cyan-600 hover:bg-cyan-600',
  off: 'border-divider bg-gray-100 text-ink cursor-pointer transition-[background-color,border-color,transform] duration-100 hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-100 active:bg-cyan-200 active:translate-y-0',
  locked: 'border-transparent bg-gray-200 text-gray-500 cursor-not-allowed',
};

export function NumberGrid({ selected, onToggle }: NumberGridProps) {
  return (
    <div className="grid max-w-grid grid-cols-[repeat(auto-fill,minmax(46px,1fr))] gap-2">
      {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
        const isSelected = selected.includes(n);
        const locked = !isSelected && selected.length >= 6;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${n}번`}
            disabled={locked}
            onClick={() => onToggle(n)}
            className={`${base} ${isSelected ? variants.on : locked ? variants.locked : variants.off}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
