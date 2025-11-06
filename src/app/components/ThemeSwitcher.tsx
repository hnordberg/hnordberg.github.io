'use client'

import { useState, useEffect } from 'react'
import styles from './ThemeSwitcher.module.css'

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState('dark-mode');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            setTheme('dark-mode');
        }
    }, []);

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark-mode' ? 'light-mode' : 'dark-mode');
    };

    return (
        <div className={styles.themeSwitchContainer}>
            <input type="checkbox" id="checkbox" className={styles.checkbox} onChange={toggleTheme} checked={theme === 'light-mode'} title="Toggle theme" aria-label="Toggle theme" />
            <label htmlFor="checkbox" className={styles.label}></label>
        </div>
    );
};

export default ThemeSwitcher;