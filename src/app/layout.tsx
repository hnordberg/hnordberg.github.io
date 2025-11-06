import type { Metadata } from 'next'
import './globals.css'
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
              <li><a href="/">Home</a></li>
              <li><a href="#">Resume</a></li>
              <li><a href="#">Projects</a></li>
              <li><a href="#">Technology</a></li>
              <li><a href="#">Leadership</a></li>
              <li><a href="#">Publications</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
          <ThemeSwitcher />
        </header>
        {children}
        <footer>
          <p>&copy; 2025 Henrik Nordberg</p>
        </footer>
      </body>
    </html>
  )
}
