import { useState, useEffect } from 'react'
import { AlertTriangle, ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react'
import styles from './LoanSimulator.module.css'

const INITIAL_FORM = { amount: '', months: '', annual_rate: '' }
const INITIAL_ERRORS = { amount: '', months: '' }

const RISK_CONFIG = {
  low:    { label: 'Riesgo bajo',    icon: ShieldCheck, colorClass: 'riskLow' },
  medium: { label: 'Riesgo medio',   icon: ShieldAlert, colorClass: 'riskMedium' },
  high:   { label: 'Riesgo alto',    icon: ShieldX,     colorClass: 'riskHigh' },
}

function RiskBadge({ level }) {
  const config = RISK_CONFIG[level]
  if (!config) return null
  const Icon = config.icon
  return (
    <div className={`${styles.riskBadge} ${styles[config.colorClass]}`}>
      <Icon size={20} />
      <span>{config.label}</span>
    </div>
  )
}

function LoanSimulator({ result = null, onSimulate, isLoading = false, error = null }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState(INITIAL_ERRORS)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (result) setShowResult(true)
  }, [result])

  const validate = () => {
    const errors = { amount: '', months: '' }
    let valid = true
    if (!form.amount || Number(form.amount) <= 0) {
      errors.amount = 'Introduce un importe mayor que 0 €.'
      valid = false
    }
    if (!form.months || Number(form.months) < 1 || Number(form.months) > 360) {
      errors.months = 'El plazo debe estar entre 1 y 360 meses.'
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
      amount: Number(form.amount),
      months: Number(form.months),
      annual_rate: Number(form.annual_rate) || 0,
    })
  }

  const handleReset = () => {
    setShowResult(false)
    setForm(INITIAL_FORM)
    setFieldErrors(INITIAL_ERRORS)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Simulador de préstamo</h2>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="amount">
              Importe <span className={styles.unit}>€</span>
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              placeholder="5000"
              className={`${styles.input} ${fieldErrors.amount ? styles.inputError : ''}`}
              disabled={isLoading}
              min={0.01}
              step={0.01}
            />
            {fieldErrors.amount && <span className={styles.fieldError}>{fieldErrors.amount}</span>}
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
              placeholder="24"
              className={`${styles.input} ${fieldErrors.months ? styles.inputError : ''}`}
              disabled={isLoading}
              min={1}
              max={360}
              step={1}
            />
            {fieldErrors.months && <span className={styles.fieldError}>{fieldErrors.months}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="annual_rate">
              Tipo de interés <span className={styles.unit}>% anual</span>
              <span className={styles.optional}> (opcional)</span>
            </label>
            <input
              id="annual_rate"
              name="annual_rate"
              type="number"
              value={form.annual_rate}
              onChange={handleChange}
              placeholder="0"
              className={styles.input}
              disabled={isLoading}
              min={0}
              max={100}
              step={0.01}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton} disabled={isLoading}>
            {isLoading ? 'Calculando...' : 'Simular préstamo'}
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

          {/* Semáforo de riesgo — siempre visible y prominente */}
          <div className={styles.riskSection}>
            <RiskBadge level={result.risk_level} />
            <span className={styles.incomeRatio}>
              La cuota representa el <strong>{result.income_ratio.toFixed(1)} %</strong> de tus ingresos
            </span>
          </div>

          {/* Métricas principales */}
          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Cuota mensual</span>
              <span className={styles.metricValue}>
                {result.monthly_payment.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Total a pagar</span>
              <span className={styles.metricValue}>
                {result.total_paid.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Intereses totales</span>
              <span className={`${styles.metricValue} ${result.total_interest > 0 ? styles.interestValue : ''}`}>
                {result.total_interest.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          {/* Explicación */}
          <div className={styles.explanation}>
            <Info size={18} className={styles.explanationIcon} />
            <p>{result.explanation}</p>
          </div>

        </div>
      )}
    </div>
  )
}

export default LoanSimulator
