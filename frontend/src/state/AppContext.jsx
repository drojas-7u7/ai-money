// Estado global de AI Money: perfil, resumen, simulaciones, nómina y chat.
// Las pantallas usan el hook useAppState() y nunca llaman a la API directamente.
// No hay login: la sesión vive en memoria mientras la página está abierta.

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '../api'

const AppContext = createContext(null)

const MAX_HISTORY = 4 // el contrato limita el historial del chat a 4 mensajes
const MAX_CONTENT = 2000 // el esquema limita cada mensaje a 2000 caracteres

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [savings, setSavings] = useState(null)
  const [loan, setLoan] = useState(null)
  const [payslip, setPayslip] = useState(null)
  const [messages, setMessages] = useState([]) // [{ role, content, check_question? }]
  const [quiz, setQuiz] = useState({ pre: null, post: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Ejecuta una llamada a la API gestionando "cargando" y el mensaje de error.
  const run = useCallback(async (task) => {
    setLoading(true)
    setError(null)
    try {
      return await task()
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Al elegir un perfil de ejemplo: se guarda en el backend y se recalcula el resumen.
  // Se borran los resultados del perfil anterior para no mezclar datos.
  const selectProfile = useCallback((newProfile) => run(async () => {
    const saved = await api.updateProfile(newProfile)
    setProfile(saved)
    setSummary(api.addBreakdown(await api.getSummary(), saved))
    setSavings(null)
    setLoan(null)
    setPayslip(null)
    setMessages([])
    return saved
  }), [run])

  const runSavings = useCallback((request) => run(async () => {
    const result = await api.simulateSavings(request)
    setSavings(result)
    return result
  }), [run])

  // Ingresos y gastos se toman del perfil activo si la pantalla no los envía.
  const runLoan = useCallback((request) => run(async () => {
    const full = {
      monthly_income: profile?.monthly_income,
      monthly_expenses: profile ? profile.fixed_expenses + profile.variable_expenses : undefined,
      ...request,
    }
    const result = await api.simulateLoan(full)
    setLoan(result)
    return result
  }), [run, profile])

  const analyzePayslip = useCallback((file) => run(async () => {
    const result = await api.uploadPayslip(file)
    setPayslip(result)
    return result
  }), [run])

  // Solo los datos agregados que permite el contrato; nunca nombres ni la nómina completa.
  const chatContext = useMemo(() => {
    let financial_level = null
    if (quiz.pre !== null) {
      const pct = quiz.pre.score / quiz.pre.total
      financial_level = pct <= 0.2 ? 'principiante' : pct <= 0.6 ? 'intermedio' : 'avanzado'
    }
    return {
      monthly_income: profile?.monthly_income ?? null,
      available: summary?.available ?? null,
      payslip_gross: payslip?.gross ?? null,
      payslip_net: payslip?.net ?? null,
      loan_monthly_payment: loan?.monthly_payment ?? null,
      savings_monthly_contribution: savings?.monthly_contribution ?? null,
      financial_level,
    }
  }, [profile, summary, payslip, loan, savings, quiz.pre])

  const askChat = useCallback((rawMessage) => run(async () => {
    const message = rawMessage.slice(0, MAX_CONTENT) // mismo límite que el esquema
    const history = messages
      .slice(-MAX_HISTORY)
      // La pregunta de comprobación viaja dentro del mensaje del asistente,
      // para que la IA sepa qué preguntó si el usuario le responde.
      .map(({ role, content, check_question }) => ({
        role,
        content: (check_question ? `${content}\n\n${check_question}` : content).slice(0, MAX_CONTENT),
      }))
    const result = await api.sendChat({ message, history, context: chatContext })
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: result.reply, check_question: result.check_question },
    ])
    return result
  }), [run, messages, chatContext])

  // Cuestionario opcional: phase = 'pre' | 'post'; se guarda la puntuación de cada fase.
  const submitQuiz = useCallback((phase, answers) => run(async () => {
    const score = await api.submitQuiz(phase, answers)
    setQuiz((prev) => ({ ...prev, [phase]: score }))
    return score
  }), [run])

  const value = {
    profile, summary, savings, loan, payslip, messages, quiz, loading, error,
    chatContext,
    selectProfile, runSavings, runLoan, analyzePayslip, askChat, submitQuiz,
    clearError: () => setError(null),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState debe usarse dentro de <AppProvider>')
  }
  return context
}
