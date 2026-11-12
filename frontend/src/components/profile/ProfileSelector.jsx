import { useState } from 'react'
import { AlertTriangle, Target, TrendingUp, TrendingDown, PlusCircle, X } from 'lucide-react'
import styles from './ProfileSelector.module.css'
import profiles from '../../data/perfiles.json'

const AVATAR_COLORS = {
  demo_01: styles.avatarBlue,
  demo_02: styles.avatarGreen,
  demo_03: styles.avatarCyan,
  demo_04: styles.avatarAmber,
}

const EMPTY_FORM = {
  alias: '',
  monthly_income: '',
  fixed_expenses: '',
  variable_expenses: '',
  current_savings: '',
  goal: '',
}

function ProfileSelector({ activeProfileId = null, onSelectProfile, isLoading = false, error = null }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const income = parseFloat(form.monthly_income)
    const fixed = parseFloat(form.fixed_expenses)
    const variable = parseFloat(form.variable_expenses)
    const savings = parseFloat(form.current_savings) || 0

    if (!form.alias.trim()) return setFormError('El nombre es obligatorio.')
    if (isNaN(income) || income <= 0) return setFormError('Introduce unos ingresos válidos.')
    if (isNaN(fixed) || fixed < 0) return setFormError('Introduce gastos fijos válidos.')
    if (isNaN(variable) || variable < 0) return setFormError('Introduce gastos variables válidos.')

    onSelectProfile({
      profile_id: 'custom_01',
      alias: form.alias.trim(),
      monthly_income: income,
      fixed_expenses: fixed,
      variable_expenses: variable,
      current_savings: savings,
      goal: form.goal.trim() || 'Sin objetivo definido',
    })
  }

  const handleToggleForm = () => {
    setShowForm(!showForm)
    setFormError(null)
    setForm(EMPTY_FORM)
  }

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
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{' '}
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

        <button
          className={`${styles.card} ${styles.createCard} ${showForm ? styles.createCardActive : ''}`}
          onClick={handleToggleForm}
          disabled={isLoading}
          type="button"
        >
          <PlusCircle size={32} className={styles.createIcon} />
          <span className={styles.createLabel}>Crear mi perfil</span>
          <span className={styles.createHint}>Introduce tus propios datos</span>
        </button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
          <div className={styles.formHeader}>
            <span className={styles.formTitle}>Nuevo perfil</span>
            <button type="button" className={styles.formClose} onClick={handleToggleForm}>
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div className={styles.errorBanner}>
              <AlertTriangle size={14} /> {formError}
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.formLabel}>Nombre *</label>
              <input
                className={styles.formInput}
                name="alias"
                value={form.alias}
                onChange={handleChange}
                placeholder="Ej. María"
                maxLength={30}
                autoComplete="off"
              />
            </div>
          </div>

          <div className={`${styles.formRow} ${styles.formRowThree}`}>
            <div className={styles.fieldGroup}>
              <label className={styles.formLabel}>Ingresos netos / mes (€) *</label>
              <input
                className={styles.formInput}
                name="monthly_income"
                type="number"
                min="0"
                step="0.01"
                value={form.monthly_income}
                onChange={handleChange}
                placeholder="Ej. 1800"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.formLabel}>Gastos fijos / mes (€) *</label>
              <input
                className={styles.formInput}
                name="fixed_expenses"
                type="number"
                min="0"
                step="0.01"
                value={form.fixed_expenses}
                onChange={handleChange}
                placeholder="Ej. 800"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.formLabel}>Gastos variables / mes (€) *</label>
              <input
                className={styles.formInput}
                name="variable_expenses"
                type="number"
                min="0"
                step="0.01"
                value={form.variable_expenses}
                onChange={handleChange}
                placeholder="Ej. 300"
              />
            </div>
          </div>

          <div className={`${styles.formRow} ${styles.formRowTwo}`}>
            <div className={styles.fieldGroup}>
              <label className={styles.formLabel}>
                Ahorro actual (€) <span className={styles.optional}>opcional</span>
              </label>
              <input
                className={styles.formInput}
                name="current_savings"
                type="number"
                min="0"
                step="0.01"
                value={form.current_savings}
                onChange={handleChange}
                placeholder="Ej. 500"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.formLabel}>
                Objetivo financiero <span className={styles.optional}>opcional</span>
              </label>
              <input
                className={styles.formInput}
                name="goal"
                value={form.goal}
                onChange={handleChange}
                placeholder="Ej. Ahorrar para un viaje"
                maxLength={80}
                autoComplete="off"
              />
            </div>
          </div>

          <button type="submit" className={styles.formSubmit} disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear y entrar al demo'}
          </button>
        </form>
      )}
    </div>
  )
}

export default ProfileSelector
