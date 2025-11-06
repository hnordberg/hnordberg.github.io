import type { Metadata } from 'next'
import './globals.css'
import '../../css/style.css'
import Navigation from './components/Navigation';
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
          <Navigation />
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
