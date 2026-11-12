// Una función por endpoint de docs/CONTRATO_API.md.
// Los nombres de campos son los del contrato (snake_case); no cambiarlos sin acordarlo.

import { apiRequest, ApiError } from './client'

const MAX_PDF_BYTES = 2 * 1024 * 1024

export const checkHealth = () => apiRequest('/health')

// Perfil (Dev 3)
export const getProfile = () => apiRequest('/profile')
export const updateProfile = (profile) => apiRequest('/profile', { method: 'PUT', body: profile })

// Finanzas (Dev 3)
export const getSummary = () => apiRequest('/finance/summary')

// Añade al resumen el desglose de gastos (fijos / variables) para la gráfica.
// Se calcula con el perfil, sin cambiar el contrato del backend.
export const addBreakdown = (summary, profile) => ({
  ...summary,
  breakdown: { fixed: profile.fixed_expenses, variable: profile.variable_expenses },
})

// Para pantallas que guardan su propio perfil: lo envía al backend (el resumen se
// calcula sobre el perfil activo del backend), pide el resumen y añade el desglose.
export async function getSummaryForProfile(profile) {
  await updateProfile(profile)
  return addBreakdown(await getSummary(), profile)
}

// { goal, target_amount, current_saved, months }
export const simulateSavings = (request) =>
  apiRequest('/finance/savings', { method: 'POST', body: request })

// { amount, months, annual_rate, monthly_income, monthly_expenses }
export const simulateLoan = (request) =>
  apiRequest('/finance/loan', { method: 'POST', body: request })

// Nómina (Dev 4): multipart, campo "file", solo PDF de ejemplo
export async function uploadPayslip(file) {
  if (!file || file.type !== 'application/pdf') {
    throw new ApiError('Selecciona una nómina de ejemplo en PDF.', 400)
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new ApiError('El archivo es demasiado grande (máximo 2 MB).', 413)
  }
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest('/payslip', { method: 'POST', formData })
}

// Chat (Dev 5): { message, history, context }
export const sendChat = (request) => apiRequest('/chat', { method: 'POST', body: request })

// Cuestionario opcional: phase = 'pre' | 'post'
export const getQuiz = (phase) => apiRequest(`/quiz/${phase}`)
export const submitQuiz = (phase, answers) =>
  apiRequest(`/quiz/${phase}`, { method: 'POST', body: { answers } })
