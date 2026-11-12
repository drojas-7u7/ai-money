import { useState } from 'react'
import { AlertTriangle, Target, TrendingUp, TrendingDown, PlusCircle, X, CheckCircle2, XCircle } from 'lucide-react'
import { useAppState } from '../../state/AppContext'
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

const QUESTIONS = [
  {
    id: 'q1',
    text: '¿Qué diferencia hay entre salario bruto y salario neto?',
    options: [
      'No hay diferencia, son lo mismo',
      'El bruto es antes de deducciones; el neto es lo que recibes en cuenta',
      'El neto es siempre mayor que el bruto',
      'El bruto solo incluye las horas extra',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    text: '¿Qué significa IRPF?',
    options: [
      'Instituto de Regulación del Patrimonio Familiar',
      'Impuesto sobre la Renta de las Personas Físicas',
      'Índice de Referencia del Precio de la Financiación',
      'Inversión de Renta con Protección Fiscal',
    ],
    correct: 1,
  },
  {
    id: 'q3',
    text: '¿Qué porcentaje de ingresos se recomienda habitualmente destinar al ahorro?',
    options: [
      'El 2-3 %',
      'El 5 %',
      'Entre el 10 % y el 20 %',
      'No hace falta ahorrar si no sobra dinero',
    ],
    correct: 2,
  },
  {
    id: 'q4',
    text: '¿Qué es un fondo de emergencia?',
    options: [
      'Un préstamo rápido para imprevistos',
      'Un ahorro equivalente a 3-6 meses de gastos para imprevistos',
      'Un seguro de vida obligatorio',
      'Una inversión en bolsa a largo plazo',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    text: 'Si la cuota mensual de un préstamo supera el 35 % de tus ingresos netos, ¿qué indica?',
    options: [
      'Que el préstamo tiene un tipo de interés muy bajo',
      'Que el plazo de devolución es muy corto',
      'Que el nivel de endeudamiento puede ser arriesgado',
      'Nada en especial, es un porcentaje habitual',
    ],
    correct: 2,
  },
]

function getLevel(score) {
  if (score <= 1) return { label: 'Principiante', hint: 'Esta app te ayudará a dar tus primeros pasos en finanzas personales.' }
  if (score <= 3) return { label: 'Aprendiz', hint: 'Vas por buen camino. Aquí reforzarás todo lo que falta.' }
  return { label: 'Avanzado', hint: 'Conoces bien las bases. Explora los simuladores y el chat para profundizar.' }
}

function ProfileSelector({ activeProfileId = null, onSelectProfile, isLoading = false, error = null }) {
  const { submitQuiz } = useAppState()
  const [view, setView] = useState('grid') // 'grid' | 'form' | 'quiz' | 'result'
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [pendingProfile, setPendingProfile] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null) // índice seleccionado en pregunta actual
  const [score, setScore] = useState(0)
  const [allAnswers, setAllAnswers] = useState({})

  /* ── Form ── */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError(null)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const income = parseFloat(form.monthly_income)
    const fixed = parseFloat(form.fixed_expenses)
    const variable = parseFloat(form.variable_expenses)
    const savings = parseFloat(form.current_savings) || 0

    if (!form.alias.trim()) return setFormError('El nombre es obligatorio.')
    if (isNaN(income) || income <= 0) return setFormError('Introduce unos ingresos válidos.')
    if (isNaN(fixed) || fixed < 0) return setFormError('Introduce gastos fijos válidos.')
    if (isNaN(variable) || variable < 0) return setFormError('Introduce gastos variables válidos.')

    setPendingProfile({
      profile_id: 'custom_01',
      alias: form.alias.trim(),
      monthly_income: income,
      fixed_expenses: fixed,
      variable_expenses: variable,
      current_savings: savings,
      goal: form.goal.trim() || 'Sin objetivo definido',
    })
    setCurrentQ(0)
    setSelected(null)
    setScore(0)
    setView('quiz')
  }

  const handleBack = () => {
    setView('grid')
    setForm(EMPTY_FORM)
    setFormError(null)
    setPendingProfile(null)
  }

  /* ── Quiz ── */
  const handleOption = (optionIndex) => {
    if (selected !== null) return // ya respondió esta pregunta
    setSelected(optionIndex)

    const q = QUESTIONS[currentQ]
    const newAnswers = { ...allAnswers, [q.id]: optionIndex }
    setAllAnswers(newAnswers)

    const isCorrect = optionIndex === q.correct
    const newScore = score + (isCorrect ? 1 : 0)

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1)
        setSelected(null)
        setScore(newScore)
      } else {
        setScore(newScore)
        setView('result')
      }
    }, 500)
  }

  /* ── Result → entrar al demo ── */
  const handleEnterDemo = async () => {
    await submitQuiz('pre', allAnswers) // guarda score en AppContext → llega al chat como financial_level
    onSelectProfile(pendingProfile)
  }

  /* ── Grid de perfiles ── */
  if (view === 'grid') {
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
            className={`${styles.card} ${styles.createCard}`}
            onClick={() => setView('form')}
            disabled={isLoading}
            type="button"
          >
            <PlusCircle size={32} className={styles.createIcon} />
            <span className={styles.createLabel}>Crear mi perfil</span>
            <span className={styles.createHint}>Introduce tus propios datos</span>
          </button>
        </div>
      </div>
    )
  }

  /* ── Formulario ── */
  if (view === 'form') {
    return (
      <div className={styles.container}>
        <div className={styles.stepHeader}>
          <button className={styles.stepBack} onClick={handleBack} type="button">
            ← Volver
          </button>
          <div className={styles.stepIndicator}>
            <span className={styles.stepActive}>1. Tus datos</span>
            <span className={styles.stepDivider}>›</span>
            <span className={styles.stepInactive}>2. Quiz</span>
            <span className={styles.stepDivider}>›</span>
            <span className={styles.stepInactive}>3. Resultado</span>
          </div>
        </div>

        <form className={styles.formCard} onSubmit={handleFormSubmit} noValidate>
          <span className={styles.formTitle}>Cuéntanos sobre ti</span>

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
            Continuar al quiz →
          </button>
        </form>
      </div>
    )
  }

  /* ── Quiz ── */
  if (view === 'quiz') {
    const q = QUESTIONS[currentQ]
    const progress = ((currentQ) / QUESTIONS.length) * 100

    return (
      <div className={styles.container}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepInactive}>1. Tus datos</span>
            <span className={styles.stepDivider}>›</span>
            <span className={styles.stepActive}>2. Quiz</span>
            <span className={styles.stepDivider}>›</span>
            <span className={styles.stepInactive}>3. Resultado</span>
          </div>
        </div>

        <div className={styles.quizCard}>
          <div className={styles.quizMeta}>
            <span className={styles.quizCounter}>Pregunta {currentQ + 1} de {QUESTIONS.length}</span>
            <span className={styles.quizPct}>{Math.round(progress)} %</span>
          </div>
          <div className={styles.quizProgressBar}>
            <div className={styles.quizProgressFill} style={{ width: `${progress}%` }} />
          </div>

          <p className={styles.quizQuestion}>{q.text}</p>

          <div className={styles.quizOptions}>
            {q.options.map((opt, i) => {
              let cls = styles.quizOption
              if (selected !== null) {
                if (i === q.correct) cls = `${styles.quizOption} ${styles.quizOptionCorrect}`
                else if (i === selected && i !== q.correct) cls = `${styles.quizOption} ${styles.quizOptionWrong}`
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handleOption(i)}
                  disabled={selected !== null}
                  type="button"
                >
                  <span className={styles.quizOptionLetter}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ── Resultado ── */
  if (view === 'result') {
    const { label, hint } = getLevel(score)
    const pct = Math.round((score / QUESTIONS.length) * 100)

    return (
      <div className={styles.container}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepInactive}>1. Tus datos</span>
            <span className={styles.stepDivider}>›</span>
            <span className={styles.stepInactive}>2. Quiz</span>
            <span className={styles.stepDivider}>›</span>
            <span className={styles.stepActive}>3. Resultado</span>
          </div>
        </div>

        <div className={styles.resultCard}>
          <div className={styles.resultScoreWrap}>
            <span className={styles.resultScoreNum}>{score}</span>
            <span className={styles.resultScoreTotal}>/ {QUESTIONS.length}</span>
          </div>

          <span className={styles.resultLevel}>{label}</span>
          <p className={styles.resultHint}>{hint}</p>

          <div className={styles.resultBar}>
            <div className={styles.resultBarFill} style={{ width: `${pct}%` }} />
          </div>

          <div className={styles.resultBreakdown}>
            <span className={styles.resultCorrect}><CheckCircle2 size={14} /> {score} correctas</span>
            <span className={styles.resultWrong}><XCircle size={14} /> {QUESTIONS.length - score} incorrectas</span>
          </div>

          <button
            className={styles.formSubmit}
            onClick={handleEnterDemo}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? 'Entrando...' : 'Entrar al demo →'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default ProfileSelector
