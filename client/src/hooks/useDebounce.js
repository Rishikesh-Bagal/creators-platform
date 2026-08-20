import { useState, useEffect } from 'react';

/**
 * useDebounce hook
 * 
 * Demonstrates:
 * 1. Closures: The inner timeout function closes over the `value` variable.
 * 2. Event Loop: `setTimeout` queues a Macrotask. If the value changes before the timeout,
 *    the cleanup function (`clearTimeout`) runs, cancelling the previous Macrotask.
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set a timeout to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function (Closure) clears the previous timeout if value or delay changes
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
