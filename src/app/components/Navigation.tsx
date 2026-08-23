'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === ''
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navigation() {
  const pathname = usePathname() ?? ''
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const links: { href: string; label: string; external?: boolean }[] = [
    { href: '/', label: 'Home' },
    // { href: '/resume', label: 'Resume' },
    { href: '/projects', label: 'Projects' },
    { href: '/technology', label: 'Technology' },
    { href: 'https://axioml.org', label: 'Machine Learning', external: true },
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
            {link.external ? (
              <a href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={isNavLinkActive(pathname, link.href) ? 'active' : ''} onClick={closeMenu} >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}