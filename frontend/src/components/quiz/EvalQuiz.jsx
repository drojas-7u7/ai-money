import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, RefreshCw, GraduationCap } from 'lucide-react'
import { useAppState } from '../../state/AppContext'
import styles from './EvalQuiz.module.css'

const POOL = [
  // ── Nómina ──
  { id: 'post_01', category: 'nomina', text: 'Tu nómina indica 1.900 € brutos y 1.580 € netos. ¿Qué cantidad recibes normalmente en tu cuenta?', options: ['1.900 €', '1.580 €', 'La suma de ambas'], correct: 1 },
  { id: 'post_02', category: 'nomina', text: 'En una nómina aparecen 2.000 € de devengos y 350 € de deducciones. ¿Cuál es el líquido a percibir?', options: ['1.650 €', '2.350 €', '350 €'], correct: 0 },
  { id: 'post_03', category: 'nomina', text: '¿Qué es una retención de IRPF en una nómina?', options: ['Un pago a cuenta del impuesto sobre la renta', 'Una prima que paga la empresa', 'Una comisión bancaria'], correct: 0 },
  { id: 'post_04', category: 'nomina', text: '¿Para qué sirven las cotizaciones a la Seguridad Social?', options: ['Solo para pagar el IRPF', 'Para contribuir a financiar prestaciones y protección social', 'Para aumentar directamente el salario neto'], correct: 1 },
  { id: 'post_05', category: 'nomina', text: 'Si tus devengos son 1.700 € y las deducciones 200 €, ¿cuál es tu neto?', options: ['1.900 €', '200 €', '1.500 €'], correct: 2 },
  { id: 'post_06', category: 'nomina', text: '¿Qué indica el concepto «salario base»?', options: ['La retribución fijada por unidad de tiempo u obra, sin contar complementos', 'Siempre todo el salario neto', 'Lo que se paga de IRPF'], correct: 0 },
  { id: 'post_07', category: 'nomina', text: '¿Qué puede hacer que dos personas con igual bruto tengan distinto neto?', options: ['Las retenciones o deducciones aplicables', 'La tipografía de la nómina', 'El banco que emite la tarjeta'], correct: 0 },
  { id: 'post_08', category: 'nomina', text: 'En una nómina, ¿qué significa «líquido a percibir»?', options: ['El coste total para la empresa', 'El importe final a cobrar', 'El salario bruto anual'], correct: 1 },
  { id: 'post_09', category: 'nomina', text: '¿Qué afirmación sobre una subida de salario bruto es más correcta?', options: ['La subida neta siempre coincide exactamente con la bruta', 'El efecto sobre el neto depende de las deducciones y retenciones', 'El salario neto siempre baja'], correct: 1 },
  { id: 'post_10', category: 'nomina', text: 'Al revisar una nómina ficticia, ¿qué dato es más útil para comprobar el dinero que realmente cobrarás?', options: ['El importe neto o líquido a percibir', 'El total de devengos sin descuentos', 'La base de cotización aislada'], correct: 0 },
  // ── Ahorro ──
  { id: 'post_11', category: 'ahorro', text: 'Quieres reunir 1.200 € en 12 meses, sin ahorro inicial ni intereses. ¿Cuánto debes reservar al mes?', options: ['80 €', '100 €', '120 €'], correct: 1 },
  { id: 'post_12', category: 'ahorro', text: 'Quieres ahorrar 900 € y ya tienes 300 €. Si quedan seis meses, ¿qué aportación mensual necesitas, sin intereses?', options: ['100 €', '150 €', '200 €'], correct: 0 },
  { id: 'post_13', category: 'ahorro', text: '¿Para qué sirve principalmente un fondo de emergencia?', options: ['Para comprar productos financieros arriesgados', 'Para afrontar imprevistos sin recurrir inmediatamente a deuda', 'Para pagar gastos que ya conoces cada mes'], correct: 1 },
  { id: 'post_14', category: 'ahorro', text: 'Ingresas 1.500 € netos y gastas 1.300 €. ¿Cuál es tu disponible mensual antes de nuevos compromisos?', options: ['200 €', '300 €', '2.800 €'], correct: 0 },
  { id: 'post_15', category: 'ahorro', text: 'Si tus gastos superan tus ingresos todos los meses, ¿cuál es el primer paso más razonable?', options: ['Ignorar el déficit', 'Revisar gastos e ingresos para ajustar el presupuesto', 'Contratar un préstamo sin calcular su coste'], correct: 1 },
  { id: 'post_16', category: 'ahorro', text: '¿Qué significa que un objetivo de ahorro sea realista?', options: ['Que su aportación mensual encaje con el presupuesto', 'Que el importe sea siempre elevado', 'Que no tenga fecha límite'], correct: 0 },
  { id: 'post_17', category: 'ahorro', text: 'Si aumentas el plazo para reunir un objetivo fijo, sin intereses y sin cambiar el ahorro inicial, ¿qué ocurre con la aportación mensual necesaria?', options: ['Aumenta', 'Disminuye', 'No cambia nunca'], correct: 1 },
  { id: 'post_18', category: 'ahorro', text: '¿Qué hábito ayuda a controlar los gastos variables?', options: ['Registrar compras y revisar categorías periódicamente', 'No revisar nunca los movimientos', 'Contar los gastos fijos como ingresos'], correct: 0 },
  { id: 'post_19', category: 'ahorro', text: 'Si te quedan 250 € disponibles y tu plan exige ahorrar 300 € al mes, ¿qué conviene hacer?', options: ['Suponer que podrás cumplir sin cambios', 'Revisar importe, plazo o gastos', 'Ignorar los gastos necesarios'], correct: 1 },
  { id: 'post_20', category: 'ahorro', text: '¿Cuál es la diferencia entre ahorrar y tener dinero disponible?', options: ['No existe ninguna', 'Lo disponible es el saldo tras gastos; ahorrar implica reservar parte de ese saldo', 'Ahorrar significa pedir dinero prestado'], correct: 1 },
  // ── Préstamo ──
  { id: 'post_21', category: 'prestamo', text: '¿Qué indicador sirve para comparar mejor el coste anual de préstamos similares cuando incluye los gastos considerados por su cálculo?', options: ['La TAE', 'Solo el TIN', 'El número de cuotas, por sí solo'], correct: 0 },
  { id: 'post_22', category: 'prestamo', text: 'Pides 1.000 € y devuelves 12 cuotas de 90 €, sin otros pagos. ¿Cuánto habrás pagado en total?', options: ['1.000 €', '1.080 €', '90 €'], correct: 1 },
  { id: 'post_23', category: 'prestamo', text: 'Si recibiste 1.000 € y pagas 1.080 € en total, ¿cuál es el coste adicional?', options: ['80 €', '180 €', '1.080 €'], correct: 0 },
  { id: 'post_24', category: 'prestamo', text: 'Si amplías el plazo de un préstamo con tipo fijo positivo, manteniendo el capital y sin comisiones adicionales, ¿qué suele pasar?', options: ['La cuota mensual baja y el interés total sube', 'La cuota sube y los intereses bajan', 'La cuota no cambia'], correct: 0 },
  { id: 'post_25', category: 'prestamo', text: 'Una cuota de 300 € representa ¿qué porcentaje de unos ingresos netos mensuales de 1.500 €?', options: ['10 %', '20 %', '30 %'], correct: 1 },
  { id: 'post_26', category: 'prestamo', text: '¿Qué debería comprobarse antes de asumir una nueva cuota de préstamo?', options: ['Solo que el banco responda rápido', 'Que encaje con ingresos, gastos y un margen para imprevistos', 'Solo que la primera cuota sea pequeña'], correct: 1 },
  { id: 'post_27', category: 'prestamo', text: '¿Qué significa el TIN de un préstamo?', options: ['El tipo de interés nominal, sin equivaler por sí solo al coste total', 'La cantidad que se recibe en la cuenta', 'La cuota de un seguro'], correct: 0 },
  { id: 'post_28', category: 'prestamo', text: 'Si dos ofertas tienen el mismo capital y plazo, ¿qué conviene comparar además de la cuota?', options: ['La TAE y el importe total a devolver', 'El color de su publicidad', 'Solo el nombre de la entidad'], correct: 0 },
  { id: 'post_29', category: 'prestamo', text: '¿Qué hace un simulador educativo de préstamos?', options: ['Aprobar automáticamente la financiación', 'Calcular escenarios orientativos de cuota y coste', 'Garantizar que cualquier banco aceptará la solicitud'], correct: 1 },
  { id: 'post_30', category: 'prestamo', text: 'Si la cuota de un préstamo deja el presupuesto mensual sin margen para imprevistos, ¿qué interpretación es más prudente?', options: ['La financiación puede generar vulnerabilidad ante gastos inesperados', 'No existe ningún riesgo mientras la cuota se pueda pagar hoy', 'La cuota garantiza que crecerán los ingresos'], correct: 0 },
]

const TOTAL = 10
const CAT_LABEL = { nomina: 'Nómina', ahorro: 'Ahorro', prestamo: 'Préstamo' }

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

function getLevel(score) {
  if (score <= 3) return 'Sigue practicando — Revisa los simuladores y el chat para reforzar.'
  if (score <= 6) return 'Buen progreso — Ya dominas bastante, sigue explorando.'
  if (score <= 9) return 'Muy bien — Tienes una sólida comprensión financiera.'
  return '¡Perfecto! — Dominas todos los conceptos evaluados.'
}

function EvalQuiz() {
  const { submitQuiz } = useAppState()

  const initQuestions = useCallback(() => pickRandom(POOL, TOTAL), [])

  const [questions, setQuestions] = useState(initQuestions)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState({})
  const [view, setView] = useState('quiz') // 'quiz' | 'result'

  const handleOption = (optionIndex) => {
    if (selected !== null) return
    setSelected(optionIndex)

    const q = questions[currentQ]
    const newAnswers = { ...answers, [q.id]: optionIndex }
    const newScore = score + (optionIndex === q.correct ? 1 : 0)

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1)
        setSelected(null)
        setScore(newScore)
        setAnswers(newAnswers)
      } else {
        setScore(newScore)
        setAnswers(newAnswers)
        submitQuiz('post', newAnswers)
        setView('result')
      }
    }, 500)
  }

  const handleRetry = () => {
    setQuestions(pickRandom(POOL, TOTAL))
    setCurrentQ(0)
    setSelected(null)
    setScore(0)
    setAnswers({})
    setView('quiz')
  }

  if (view === 'result') {
    const breakdown = {}
    questions.forEach((q, i) => {
      const cat = q.category
      if (!breakdown[cat]) breakdown[cat] = { score: 0, total: 0 }
      breakdown[cat].total++
      if (answers[q.id] === q.correct) breakdown[cat].score++
    })
    const pct = Math.round((score / TOTAL) * 100)

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <GraduationCap size={22} className={styles.headerIcon} />
          <h2 className={styles.title}>Evaluar mi aprendizaje</h2>
        </div>

        <div className={styles.resultCard}>
          <div className={styles.scoreWrap}>
            <span className={styles.scoreNum}>{score}</span>
            <span className={styles.scoreTotal}>/ {TOTAL}</span>
          </div>

          <p className={styles.levelText}>{getLevel(score)}</p>

          <div className={styles.resultBar}>
            <div className={styles.resultBarFill} style={{ width: `${pct}%` }} />
          </div>

          <div className={styles.breakdown}>
            {Object.entries(breakdown).map(([cat, data]) => (
              <div key={cat} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{CAT_LABEL[cat]}</span>
                <span className={styles.breakdownScore}>{data.score} / {data.total}</span>
                <div className={styles.breakdownBar}>
                  <div
                    className={styles.breakdownFill}
                    style={{ width: `${Math.round((data.score / data.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.resultFooter}>
            <span className={styles.correctStat}><CheckCircle2 size={14} /> {score} correctas</span>
            <span className={styles.wrongStat}><XCircle size={14} /> {TOTAL - score} incorrectas</span>
          </div>

          <button className={styles.retryButton} onClick={handleRetry} type="button">
            <RefreshCw size={15} /> Repetir con nuevas preguntas
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const progress = (currentQ / TOTAL) * 100

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <GraduationCap size={22} className={styles.headerIcon} />
        <h2 className={styles.title}>Evaluar mi aprendizaje</h2>
      </div>

      <div className={styles.quizCard}>
        <div className={styles.meta}>
          <span className={styles.counter}>Pregunta {currentQ + 1} de {TOTAL}</span>
          <span className={styles.catBadge}>{CAT_LABEL[q.category]}</span>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <p className={styles.question}>{q.text}</p>

        <div className={styles.options}>
          {q.options.map((opt, i) => {
            let cls = styles.option
            if (selected !== null) {
              if (i === q.correct) cls = `${styles.option} ${styles.optionCorrect}`
              else if (i === selected) cls = `${styles.option} ${styles.optionWrong}`
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleOption(i)}
                disabled={selected !== null}
                type="button"
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default EvalQuiz
