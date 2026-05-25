import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';

// --- MOCK HOOK FOR DEMONSTRATION ---
// (If you have a useDebounce hook in your project, import it instead of defining it here)
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}
// -----------------------------------

describe('Hook: useDebounce', () => {
    beforeEach(() => {
        // Tell Jest to hijack standard JavaScript timers (setTimeout, setInterval)
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Clean up and restore normal timers after each test
        jest.useRealTimers();
    });

    it('should immediately return the initial value', () => {
        const { result } = renderHook(() => useDebounce('pasta', 500));
        
        // result.current holds the return value of the hook
        expect(result.current).toBe('pasta');
    });

    it('should delay updating the value until the timer completes', () => {
        // 1. Initial render with 'pasta'
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'pasta', delay: 500 } }
        );

        // 2. The user types 'pizza' (triggering a re-render)
        rerender({ value: 'pizza', delay: 500 });

        // 3. BEFORE 500ms passes, the debounced value should STILL be 'pasta'
        expect(result.current).toBe('pasta');

        // 4. Fast-forward time by 500ms
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // 5. NOW the value should be updated to 'pizza'
        expect(result.current).toBe('pizza');
    });
});