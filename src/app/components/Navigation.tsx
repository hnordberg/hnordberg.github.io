'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const links = [
    { href: '/', label: 'Home' },
    { href: '/resume', label: 'Resume' },
    { href: '/projects', label: 'Projects' },
    { href: '/technology', label: 'Technology' },
    { href: '/leadership', label: 'Leadership' },
    { href: '/publications', label: 'Publications' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav id="main-nav">
      <ul>
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className={pathname === link.href ? 'active' : ''}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}