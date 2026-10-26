import { useState, useEffect } from "react";

/**
 * useDebounce.js
 *
 * Value ko delay ke baad return karta hai.
 * Search input mein use karo — har keypress pe API call nahi hogi.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(searchQuery, 400);
 *   useEffect(() => { API call }, [debouncedQuery]);
 */
export function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup — agar value phir change ho toh purana timer cancel
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
