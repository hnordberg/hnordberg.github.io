'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const links = [
    { href: '/', label: 'Home' },
    // { href: '/resume', label: 'Resume' },
    { href: '/projects', label: 'Projects' },
    { href: '/technology', label: 'Technology' },
    { href: '/leadership', label: 'Leadership' },
    { href: '/publications', label: 'Publications' },
    { href: '/contact', label: 'Contact' },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav id="main-nav" className={isMenuOpen ? 'menu-open' : ''}>
      <div className="nav-mobile-header">
        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isMenuOpen} >
          <span></span> { /* the hamburger lines */ }
          <span></span>
          <span></span>
        </button>
        <span className="mobile-name">Henrik Nordberg</span>
      </div>
      <ul className={isMenuOpen ? 'menu-open' : ''}>
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className={pathname === link.href ? 'active' : ''} onClick={closeMenu} >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}