import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import ThemeSwitcher from './components/ThemeSwitcher'

export const metadata: Metadata = {
  title: 'Project Showcase',
  description: 'Henrik Nordberg\'s project showcase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav id="main-nav">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="#">Resume</Link></li>
              <li><Link href="#">Projects</Link></li>
              <li><Link href="#">Technology</Link></li>
              <li><Link href="#">Leadership</Link></li>
              <li><Link href="#">Publications</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
          <ThemeSwitcher />
        </header>
        {children}
        <footer>
          <p>&copy; {new Date().getFullYear()} Henrik Nordberg</p>
        </footer>
      </body>
    </html>
  )
}
