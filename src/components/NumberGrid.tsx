'use client';

interface NumberGridProps {
  selected: number[];
  onToggle: (n: number) => void;
}

export function NumberGrid({ selected, onToggle }: NumberGridProps) {
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
      {numbers.map((n) => {
        const isSelected = selected.includes(n);
        const disabled = !isSelected && selected.length >= 6;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(n)}
            className={`aspect-square rounded-full text-sm font-medium ${
              isSelected
                ? 'bg-blue-600 text-white'
                : disabled
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
