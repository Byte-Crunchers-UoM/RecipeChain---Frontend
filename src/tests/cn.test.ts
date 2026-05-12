import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('combines multiple class names into a Tailwind-safe string', () => {
    const result = cn('px-4', 'text-white', 'bg-teal-500');
    expect(result).toBe('px-4 text-white bg-teal-500');
  });

  it('deduplicates conflicting classes and keeps the last one', () => {
    const result = cn('px-4', 'px-2', 'py-3');
    expect(result).toBe('px-2 py-3');
  });

  it('ignores falsy values when merging class names', () => {
    const result = cn('font-bold', false && 'hidden', undefined, 'text-slate-900');
    expect(result).toBe('font-bold text-slate-900');
  });
});
