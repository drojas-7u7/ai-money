// Cliente base para hablar con el backend de AI Money.
// Todas las funciones de index.js usan apiRequest.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Error con el código HTTP, para que la interfaz pueda mostrar un aviso claro.
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Mensajes en lenguaje sencillo para los códigos del contrato.
const STATUS_MESSAGES = {
  400: 'El archivo no es válido. Usa una nómina de ejemplo en PDF.',
  413: 'El archivo es demasiado grande (máximo 2 MB).',
  422: 'Algún dato no es válido. Revisa los campos del formulario.',
  503: 'El asistente no está disponible ahora mismo. Inténtalo de nuevo.',
}

export async function apiRequest(path, { method = 'GET', body, formData } = {}) {
  const options = { method, headers: {} }

  if (formData) {
    options.body = formData // el navegador pone el Content-Type multipart
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new ApiError('No se puede conectar con el servidor. ¿Está arrancado el backend?', 0)
  }

  if (!response.ok) {
    throw new ApiError(STATUS_MESSAGES[response.status] ?? `Error del servidor (${response.status}).`, response.status)
  }

  return response.json()
}
