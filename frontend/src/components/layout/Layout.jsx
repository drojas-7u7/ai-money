import { useState } from 'react'
import { AlertTriangle, Home, Menu, X } from 'lucide-react'
import styles from './Layout.module.css'
import logo from '../../assets/logo.png'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'savings',   label: 'Ahorro' },
  { id: 'loan',      label: 'Préstamo' },
  { id: 'payslip',   label: 'Nómina' },
  { id: 'chat',      label: 'Chat IA' },
]

function Layout({ activeTab, onTabChange, onGoHome, profileName, children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleTabChange = (id) => {
    onTabChange(id)
    setMenuOpen(false)
  }

  const handleGoHome = () => {
    onGoHome()
    setMenuOpen(false)
  }

  return (
    <div className={styles.root}>

      {/* ── Barra superior móvil ── */}
      <header className={styles.mobileBar}>
        <img src={logo} alt="AI Money" className={styles.mobileLogo} />
        <button className={styles.hamburger} onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
      </header>

      {/* ── Overlay ── */}
      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* ── Sidebar / Drawer ── */}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <img src={logo} alt="AI Money" className={styles.logo} />
          </div>
          <button className={styles.closeDrawer} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <button className={styles.homeButton} onClick={handleGoHome}>
          <Home size={14} /> Inicio
        </button>

        {profileName && (
          <div className={styles.profileChip}>
            <span className={styles.profileInitial}>{profileName[0]}</span>
            <span className={styles.profileName}>{profileName}</span>
          </div>
        )}

        <p className={styles.sidebarNotice}><AlertTriangle size={12} /> Demo educativa</p>
      </aside>

      {/* ── Contenido principal ── */}
      <div className={styles.main}>
        <div className={styles.demoBanner}>
          <AlertTriangle size={14} /> Demo educativa. No introduzcas datos reales.
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>

    </div>
  )
}

export default Layout
