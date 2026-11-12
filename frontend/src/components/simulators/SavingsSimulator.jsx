import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import styles from './SavingsSimulator.module.css'

const INITIAL_FORM = {
  goal: '',
  target_amount: '',
  current_saved: '',
  months: '',
}

const INITIAL_ERRORS = {
  target_amount: '',
  months: '',
}

function FeasibilityBadge({ feasible }) {
  if (feasible === null || feasible === undefined) {
    return <span className={`${styles.badge} ${styles.badgeNeutral}`}>Sin evaluar</span>
  }
  return feasible
    ? <span className={`${styles.badge} ${styles.badgeGreen}`}><CheckCircle size={14} /> Viable</span>
    : <span className={`${styles.badge} ${styles.badgeRed}`}><XCircle size={14} /> No viable</span>
}

function SavingsSimulator({ result = null, onSimulate, isLoading = false, error = null }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState(INITIAL_ERRORS)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (result) setShowResult(true)
  }, [result])

  const validate = () => {
    const errors = { target_amount: '', months: '' }
    let valid = true

    if (!form.target_amount || Number(form.target_amount) <= 0) {
      errors.target_amount = 'Introduce un importe mayor que 0 €.'
      valid = false
    }
    if (!form.months || Number(form.months) < 1 || Number(form.months) > 600) {
      errors.months = 'El plazo debe estar entre 1 y 600 meses.'
      valid = false
    }

    setFieldErrors(errors)
    return valid
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate() || isLoading) return
    onSimulate({
      goal: form.goal || 'Mi objetivo',
      target_amount: Number(form.target_amount),
      current_saved: Number(form.current_saved) || 0,
      months: Number(form.months),
    })
  }

  const handleReset = () => {
    setShowResult(false)
    setForm(INITIAL_FORM)
    setFieldErrors(INITIAL_ERRORS)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Simulador de ahorro</h2>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="goal">
            ¿Para qué quieres ahorrar? <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="goal"
            name="goal"
            type="text"
            value={form.goal}
            onChange={handleChange}
            placeholder="Ej: Fondo de emergencia"
            className={styles.input}
            disabled={isLoading}
            maxLength={80}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="target_amount">
              Objetivo <span className={styles.unit}>€</span>
            </label>
            <input
              id="target_amount"
              name="target_amount"
              type="number"
              value={form.target_amount}
              onChange={handleChange}
              placeholder="1200"
              className={`${styles.input} ${fieldErrors.target_amount ? styles.inputError : ''}`}
              disabled={isLoading}
              min={0.01}
              step={0.01}
            />
            {fieldErrors.target_amount && (
              <span className={styles.fieldError}>{fieldErrors.target_amount}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="current_saved">
              Ya tengo ahorrado <span className={styles.unit}>€</span>
            </label>
            <input
              id="current_saved"
              name="current_saved"
              type="number"
              value={form.current_saved}
              onChange={handleChange}
              placeholder="0"
              className={styles.input}
              disabled={isLoading}
              min={0}
              step={0.01}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="months">
              Plazo <span className={styles.unit}>meses</span>
            </label>
            <input
              id="months"
              name="months"
              type="number"
              value={form.months}
              onChange={handleChange}
              placeholder="12"
              className={`${styles.input} ${fieldErrors.months ? styles.inputError : ''}`}
              disabled={isLoading}
              min={1}
              max={600}
              step={1}
            />
            {fieldErrors.months && (
              <span className={styles.fieldError}>{fieldErrors.months}</span>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton} disabled={isLoading}>
            {isLoading ? 'Calculando...' : 'Calcular plan de ahorro'}
          </button>
          {result && showResult && (
            <button type="button" className={styles.secondaryButton} onClick={handleReset} disabled={isLoading}>
              Nueva simulación
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {result && showResult && (
        <div className={styles.results}>

          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Aportación mensual</span>
              <span className={styles.summaryAmount}>
                {result.monthly_contribution.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Viabilidad</span>
              <FeasibilityBadge feasible={result.feasible} />
            </div>
          </div>

          <div className={styles.explanation}>
            <Info size={18} className={styles.explanationIcon} />
            <p>{result.explanation}</p>
          </div>

          <div className={styles.planSection}>
            <h3 className={styles.planTitle}>Plan mes a mes</h3>
            <div className={styles.planTableWrapper}>
              <table className={styles.planTable}>
                <thead>
                  <tr>
                    <th className={styles.th}>Mes</th>
                    <th className={styles.th}>Acumulado</th>
                    <th className={`${styles.th} ${styles.thProgress}`}>Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  {result.plan.map((item) => {
                    const target = result.plan[result.plan.length - 1].accumulated
                    const pct = target > 0 ? Math.min((item.accumulated / target) * 100, 100) : 100
                    return (
                      <tr key={item.month} className={styles.planRow}>
                        <td className={styles.td}>{item.month}</td>
                        <td className={`${styles.td} ${styles.tdAmount}`}>
                          {item.accumulated.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className={styles.td}>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${pct}%` }}
                              aria-label={`${Math.round(pct)}%`}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default SavingsSimulator
