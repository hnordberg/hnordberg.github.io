'use client'

import { useState, useEffect } from 'react'

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState('dark-mode')

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      setTheme(storedTheme)
    } else {
      setTheme('dark-mode')
    }
  }, [])

  useEffect(() => {
    document.body.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark-mode' ? 'light-mode' : 'dark-mode')
  }

  return (
    <div className="theme-switch-container">
      <label className="theme-switch" htmlFor="checkbox">
        <input type="checkbox" id="checkbox" title="Toggle dark mode" aria-label="Toggle dark mode" onChange={toggleTheme} checked={theme === 'light-mode'} />
        <div className="slider round"></div>
      </label>
    </div>
  )
}

export default ThemeSwitcher
