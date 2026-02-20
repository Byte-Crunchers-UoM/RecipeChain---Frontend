'use client';

interface FilterTagProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function FilterTag({ label, isSelected, onClick }: FilterTagProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border
        ${isSelected
          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
          : 'bg-white text-gray-500 border-gray-200 hover:border-teal-400 hover:text-teal-600'
        }`}
    >
      {label}
    </button>
  );
}