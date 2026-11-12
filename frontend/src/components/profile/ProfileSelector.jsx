import { AlertTriangle, Target, TrendingUp, TrendingDown } from 'lucide-react'
import styles from './ProfileSelector.module.css'
import profiles from '../../data/perfiles.json'

const AVATAR_COLORS = {
  demo_01: styles.avatarBlue,
  demo_02: styles.avatarGreen,
  demo_03: styles.avatarCyan,
  demo_04: styles.avatarAmber,
}

function ProfileSelector({ activeProfileId = null, onSelectProfile, isLoading = false, error = null }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Elige un perfil de demo</h2>
      <p className={styles.subtitle}>
        Estos perfiles son completamente ficticios. Selecciona uno para comenzar.
      </p>

      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className={styles.grid}>
        {profiles.map((profile) => {
          const available = profile.monthly_income - profile.fixed_expenses - profile.variable_expenses
          const isPositive = available >= 0
          const isActive = profile.profile_id === activeProfileId

          return (
            <button
              key={profile.profile_id}
              className={`${styles.card} ${isActive ? styles.activeCard : ''}`}
              onClick={() => !isLoading && onSelectProfile(profile)}
              disabled={isLoading}
              aria-pressed={isActive}
            >
              {isActive && <span className={styles.activeBadge}>Activo</span>}

              <div className={`${styles.avatar} ${AVATAR_COLORS[profile.profile_id]}`}>
                {profile.alias[0]}
              </div>
              <span className={styles.alias}>{profile.alias}</span>

              <div className={styles.divider} />

              <div className={styles.row}>
                <span className={styles.rowLabel}>Neto / mes</span>
                <span className={styles.rowValue}>
                  {profile.monthly_income.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </span>
              </div>

              <div className={styles.row}>
                <span className={styles.rowLabel}>Disponible</span>
                <span className={`${styles.rowValue} ${isPositive ? styles.positive : styles.negative}`}>
                  {isPositive
                    ? <TrendingUp size={14} />
                    : <TrendingDown size={14} />
                  }{' '}
                  {isPositive ? '+' : ''}
                  {available.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </span>
              </div>

              <div className={styles.goal}>
                <Target size={14} className={styles.goalIcon} />
                <span className={styles.goalText}>{profile.goal}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProfileSelector
