import type { Metadata } from 'next'
import './globals.css'
import Navigation from './components/Navigation';
import ThemeSwitcher from './components/ThemeSwitcher'
import { AuthProvider } from './lib/AuthContext'


export const metadata: Metadata = {
  title: 'Henrik Nordberg, Principal Engineer',
  description: 'Henrik Nordberg\'s project showcase',
  verification: {
    google: 'dSCg0rCRcZOPSbSef9V6h5pLtxGs_osM0t7viz7yKUk',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light-mode' && t !== 'dark-mode') t = 'dark-mode';
    document.body.className = t;
  } catch (e) {
    document.body.className = 'dark-mode';
  }
})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <AuthProvider>
          <header className="site-header">
            <Navigation />
            <ThemeSwitcher />
          </header>
          {children}
          <footer>
            <p>&copy; {new Date().getFullYear()} Henrik Nordberg</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
