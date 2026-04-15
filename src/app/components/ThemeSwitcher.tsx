'use client'

import { useState, useLayoutEffect, useRef } from 'react'
import styles from './ThemeSwitcher.module.css'

type ThemeClass = 'dark-mode' | 'light-mode'

function readStoredTheme(): ThemeClass {
    try {
        const s = localStorage.getItem('theme')
        if (s === 'light-mode' || s === 'dark-mode') return s
    } catch {
        /* ignore */
    }
    return 'dark-mode'
}

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState<ThemeClass>('dark-mode')
    const synced = useRef(false)

    useLayoutEffect(() => {
        if (!synced.current) {
            synced.current = true
            const initial = readStoredTheme()
            document.body.className = initial
            setTheme(initial)
            try {
                localStorage.setItem('theme', initial)
            } catch {
                /* ignore */
            }
            return
        }
        document.body.className = theme
        try {
            localStorage.setItem('theme', theme)
        } catch {
            /* ignore */
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme((t) => (t === 'dark-mode' ? 'light-mode' : 'dark-mode'))
    };

    return (
        <div className={styles.themeSwitchContainer}>
            <input type="checkbox" id="checkbox" className={styles.checkbox} onChange={toggleTheme} 
                checked={theme === 'light-mode'} title="Toggle theme" aria-label="Toggle theme" />
            <label htmlFor="checkbox" className={styles.label}></label>
        </div>
    );
};

export default ThemeSwitcher;