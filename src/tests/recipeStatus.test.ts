import { vi } from 'vitest';
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {},
    from: vi.fn(),
  },
}));
import { describe, it, expect } from 'vitest';
import { getRecipeStatus } from '../app/recipes/page';


describe('getRecipeStatus Logic Tests', () => {

  it('should return Deactivated when status is "deactive"', () => {
    const result = getRecipeStatus('deactive', 'any');
    expect(result.label).toBe('Deactivated');
    expect(result.classes).toContain('bg-red-500');
  });

  it('should return Pending when approval is "pending"', () => {
    const result = getRecipeStatus('active', 'pending');
    expect(result.label).toBe('Pending');
    expect(result.classes).toContain('bg-orange-500');
  });

  it('should return Active when approval is "published"', () => {
    const result = getRecipeStatus('any', 'published');
    expect(result.label).toBe('Active');
    expect(result.classes).toBe('bg-[#0d9488] text-white');
  });

  it('should return Draft when both status and approval are "draft"', () => {
    const result = getRecipeStatus('draft', 'draft');
    expect(result.label).toBe('Draft');
    expect(result.classes).toContain('bg-gray-400');
  });

  it('should handle case sensitivity correctly (uppercase inputs)', () => {
    const result = getRecipeStatus('DEACTIVE', 'PENDING');
    expect(result.label).toBe('Deactivated');
  });

  it('should return Draft as default for unknown inputs', () => {
    const result = getRecipeStatus('unknown', 'unknown');
    expect(result.label).toBe('Draft');
  });
});