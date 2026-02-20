'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useRecipeFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const toggleFilter = useCallback((key: string, value: string) => {
    // Create a new URLSearchParams object from the current URL
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key); // Handles multiple values like ?diet=Vegan&diet=Keto

    if (currentValues.includes(value)) {
      // If it exists, remove it by deleting the key and appending the remaining values
      params.delete(key);
      currentValues.filter(v => v !== value).forEach(v => params.append(key, v));
    } else {
      // If it doesn't exist, add it
      params.append(key, value);
    }

    // Update the URL without reloading the page or losing scroll position
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasFilter = useCallback((key: string, value: string) => {
    return searchParams.getAll(key).includes(value);
  }, [searchParams]);

  return { toggleFilter, clearFilters, hasFilter };
}