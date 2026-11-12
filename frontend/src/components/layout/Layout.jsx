import { AlertTriangle } from 'lucide-react'
import styles from './Layout.module.css'
import logo from '../../assets/logo.png'

const TABS = [
  { id: 'profile',   label: 'Perfil' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'savings',   label: 'Ahorro' },
  { id: 'loan',      label: 'Préstamo' },
  { id: 'payslip',   label: 'Nómina' },
  { id: 'chat',      label: 'Chat IA' },
]

function Layout({ activeTab, onTabChange, children }) {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src={logo} alt="AI Money" className={styles.logo} />
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
              onClick={() => onTabChange(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <p className={styles.sidebarNotice}><AlertTriangle size={12} /> Demo educativa</p>
      </aside>

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
