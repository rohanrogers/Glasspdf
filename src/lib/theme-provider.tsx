"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    setTheme: () => { },
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'glasspdf-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    // Read saved preference on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
            if (saved === 'dark' || saved === 'light') {
                setThemeState(saved);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setThemeState('dark');
            }
        } catch {
            // localStorage unavailable (private browsing edge case) — keep default
        }
        setMounted(true);
    }, []);

    // Apply theme class to <html> and persist
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // localStorage unavailable — silent fail
        }
    }, [theme, mounted]);

    const setTheme = useCallback((t: Theme) => setThemeState(t), []);
    const toggleTheme = useCallback(() => setThemeState(prev => prev === 'dark' ? 'light' : 'dark'), []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
