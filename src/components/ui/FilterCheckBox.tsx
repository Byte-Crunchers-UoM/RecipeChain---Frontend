//src/components/ui/FilterCheckBox.tsx

'use client';

interface FilterCheckboxProps {
  label: string;
  isChecked: boolean;
  onChange: () => void;
}

export function FilterCheckbox({ label, isChecked, onChange }: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="peer w-5 h-5 border-2 border-gray-300 rounded transition-colors checked:bg-teal-600 checked:border-teal-600 focus:ring-0 focus:ring-offset-0"
        />
        <svg className="absolute w-3.5 h-3.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 17 12" fill="none">
          <path d="M1 5.917L5.724 10.5L15.5 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">{label}</span>
    </label>
  );
}