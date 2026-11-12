"""Servicio del cuestionario de educación financiera."""

from app.schemas.quiz import QuizAnswers, QuizQuestion, QuizQuestions, QuizScore

# Las preguntas se definen aquí con la clave 'correct' (índice de la opción correcta).
# Esa clave NO se expone en la API; solo se usa para calcular la puntuación.
_QUESTIONS: dict[str, list[dict]] = {
    "post": [
        # ── Nómina ──
        {"id": "post_01", "category": "nomina", "text": "Tu nómina indica 1.900 € brutos y 1.580 € netos. ¿Qué cantidad recibes normalmente en tu cuenta?", "options": ["1.900 €", "1.580 €", "La suma de ambas"], "correct": 1},
        {"id": "post_02", "category": "nomina", "text": "En una nómina aparecen 2.000 € de devengos y 350 € de deducciones. ¿Cuál es el líquido a percibir?", "options": ["1.650 €", "2.350 €", "350 €"], "correct": 0},
        {"id": "post_03", "category": "nomina", "text": "¿Qué es una retención de IRPF en una nómina?", "options": ["Un pago a cuenta del impuesto sobre la renta", "Una prima que paga la empresa", "Una comisión bancaria"], "correct": 0},
        {"id": "post_04", "category": "nomina", "text": "¿Para qué sirven las cotizaciones a la Seguridad Social?", "options": ["Solo para pagar el IRPF", "Para contribuir a financiar prestaciones y protección social", "Para aumentar directamente el salario neto"], "correct": 1},
        {"id": "post_05", "category": "nomina", "text": "Si tus devengos son 1.700 € y las deducciones 200 €, ¿cuál es tu neto?", "options": ["1.900 €", "200 €", "1.500 €"], "correct": 2},
        {"id": "post_06", "category": "nomina", "text": "¿Qué indica el concepto «salario base»?", "options": ["La retribución fijada por unidad de tiempo u obra, sin contar complementos", "Siempre todo el salario neto", "Lo que se paga de IRPF"], "correct": 0},
        {"id": "post_07", "category": "nomina", "text": "¿Qué puede hacer que dos personas con igual bruto tengan distinto neto?", "options": ["Las retenciones o deducciones aplicables", "La tipografía de la nómina", "El banco que emite la tarjeta"], "correct": 0},
        {"id": "post_08", "category": "nomina", "text": "En una nómina, ¿qué significa «líquido a percibir»?", "options": ["El coste total para la empresa", "El importe final a cobrar", "El salario bruto anual"], "correct": 1},
        {"id": "post_09", "category": "nomina", "text": "¿Qué afirmación sobre una subida de salario bruto es más correcta?", "options": ["La subida neta siempre coincide exactamente con la bruta", "El efecto sobre el neto depende de las deducciones y retenciones", "El salario neto siempre baja"], "correct": 1},
        {"id": "post_10", "category": "nomina", "text": "Al revisar una nómina ficticia, ¿qué dato es más útil para comprobar el dinero que realmente cobrarás?", "options": ["El importe neto o líquido a percibir", "El total de devengos sin descuentos", "La base de cotización aislada"], "correct": 0},
        # ── Ahorro ──
        {"id": "post_11", "category": "ahorro", "text": "Quieres reunir 1.200 € en 12 meses, sin ahorro inicial ni intereses. ¿Cuánto debes reservar al mes?", "options": ["80 €", "100 €", "120 €"], "correct": 1},
        {"id": "post_12", "category": "ahorro", "text": "Quieres ahorrar 900 € y ya tienes 300 €. Si quedan seis meses, ¿qué aportación mensual necesitas, sin intereses?", "options": ["100 €", "150 €", "200 €"], "correct": 0},
        {"id": "post_13", "category": "ahorro", "text": "¿Para qué sirve principalmente un fondo de emergencia?", "options": ["Para comprar productos financieros arriesgados", "Para afrontar imprevistos sin recurrir inmediatamente a deuda", "Para pagar gastos que ya conoces cada mes"], "correct": 1},
        {"id": "post_14", "category": "ahorro", "text": "Ingresas 1.500 € netos y gastas 1.300 €. ¿Cuál es tu disponible mensual antes de nuevos compromisos?", "options": ["200 €", "300 €", "2.800 €"], "correct": 0},
        {"id": "post_15", "category": "ahorro", "text": "Si tus gastos superan tus ingresos todos los meses, ¿cuál es el primer paso más razonable?", "options": ["Ignorar el déficit", "Revisar gastos e ingresos para ajustar el presupuesto", "Contratar un préstamo sin calcular su coste"], "correct": 1},
        {"id": "post_16", "category": "ahorro", "text": "¿Qué significa que un objetivo de ahorro sea realista?", "options": ["Que su aportación mensual encaje con el presupuesto", "Que el importe sea siempre elevado", "Que no tenga fecha límite"], "correct": 0},
        {"id": "post_17", "category": "ahorro", "text": "Si aumentas el plazo para reunir un objetivo fijo, sin intereses y sin cambiar el ahorro inicial, ¿qué ocurre con la aportación mensual necesaria?", "options": ["Aumenta", "Disminuye", "No cambia nunca"], "correct": 1},
        {"id": "post_18", "category": "ahorro", "text": "¿Qué hábito ayuda a controlar los gastos variables?", "options": ["Registrar compras y revisar categorías periódicamente", "No revisar nunca los movimientos", "Contar los gastos fijos como ingresos"], "correct": 0},
        {"id": "post_19", "category": "ahorro", "text": "Si te quedan 250 € disponibles y tu plan exige ahorrar 300 € al mes, ¿qué conviene hacer?", "options": ["Suponer que podrás cumplir sin cambios", "Revisar importe, plazo o gastos", "Ignorar los gastos necesarios"], "correct": 1},
        {"id": "post_20", "category": "ahorro", "text": "¿Cuál es la diferencia entre ahorrar y tener dinero disponible?", "options": ["No existe ninguna", "Lo disponible es el saldo tras gastos; ahorrar implica reservar parte de ese saldo", "Ahorrar significa pedir dinero prestado"], "correct": 1},
        # ── Préstamo ──
        {"id": "post_21", "category": "prestamo", "text": "¿Qué indicador sirve para comparar mejor el coste anual de préstamos similares cuando incluye los gastos considerados por su cálculo?", "options": ["La TAE", "Solo el TIN", "El número de cuotas, por sí solo"], "correct": 0},
        {"id": "post_22", "category": "prestamo", "text": "Pides 1.000 € y devuelves 12 cuotas de 90 €, sin otros pagos. ¿Cuánto habrás pagado en total?", "options": ["1.000 €", "1.080 €", "90 €"], "correct": 1},
        {"id": "post_23", "category": "prestamo", "text": "Si recibiste 1.000 € y pagas 1.080 € en total, ¿cuál es el coste adicional?", "options": ["80 €", "180 €", "1.080 €"], "correct": 0},
        {"id": "post_24", "category": "prestamo", "text": "Si amplías el plazo de un préstamo con tipo fijo positivo, manteniendo el capital y sin comisiones adicionales, ¿qué suele pasar?", "options": ["La cuota mensual baja y el interés total sube", "La cuota sube y los intereses bajan", "La cuota no cambia"], "correct": 0},
        {"id": "post_25", "category": "prestamo", "text": "Una cuota de 300 € representa ¿qué porcentaje de unos ingresos netos mensuales de 1.500 €?", "options": ["10 %", "20 %", "30 %"], "correct": 1},
        {"id": "post_26", "category": "prestamo", "text": "¿Qué debería comprobarse antes de asumir una nueva cuota de préstamo?", "options": ["Solo que el banco responda rápido", "Que encaje con ingresos, gastos y un margen para imprevistos", "Solo que la primera cuota sea pequeña"], "correct": 1},
        {"id": "post_27", "category": "prestamo", "text": "¿Qué significa el TIN de un préstamo?", "options": ["El tipo de interés nominal, sin equivaler por sí solo al coste total", "La cantidad que se recibe en la cuenta", "La cuota de un seguro"], "correct": 0},
        {"id": "post_28", "category": "prestamo", "text": "Si dos ofertas tienen el mismo capital y plazo, ¿qué conviene comparar además de la cuota?", "options": ["La TAE y el importe total a devolver", "El color de su publicidad", "Solo el nombre de la entidad"], "correct": 0},
        {"id": "post_29", "category": "prestamo", "text": "¿Qué hace un simulador educativo de préstamos?", "options": ["Aprobar automáticamente la financiación", "Calcular escenarios orientativos de cuota y coste", "Garantizar que cualquier banco aceptará la solicitud"], "correct": 1},
        {"id": "post_30", "category": "prestamo", "text": "Si la cuota de un préstamo deja el presupuesto mensual sin margen para imprevistos, ¿qué interpretación es más prudente?", "options": ["La financiación puede generar vulnerabilidad ante gastos inesperados", "No existe ningún riesgo mientras la cuota se pueda pagar hoy", "La cuota garantiza que crecerán los ingresos"], "correct": 0},
    ],
    "pre": [
        {
            "id": "q1",
            "text": "¿Qué diferencia hay entre salario bruto y salario neto?",
            "options": [
                "No hay diferencia, son lo mismo",
                "El bruto es antes de deducciones; el neto es lo que recibes en cuenta",
                "El neto es siempre mayor que el bruto",
                "El bruto solo incluye las horas extra",
            ],
            "correct": 1,
        },
        {
            "id": "q2",
            "text": "¿Qué significa IRPF?",
            "options": [
                "Instituto de Regulación del Patrimonio Familiar",
                "Impuesto sobre la Renta de las Personas Físicas",
                "Índice de Referencia del Precio de la Financiación",
                "Inversión de Renta con Protección Fiscal",
            ],
            "correct": 1,
        },
        {
            "id": "q3",
            "text": "Del 1 al 5, ¿cómo de seguro/a te sientes a la hora de tomar decisiones sobre préstamos o interpretar tu nómina?",
            "options": [
                "1 / 5 — Nada seguro/a",
                "3 / 5",
                "5 / 5 — Muy seguro/a",
            ],
            "correct": 2,
        },
        {
            "id": "q4",
            "text": "¿Qué es un fondo de emergencia?",
            "options": [
                "Un préstamo rápido para imprevistos",
                "Un ahorro equivalente a 3-6 meses de gastos para imprevistos",
                "Un seguro de vida obligatorio",
                "Una inversión en bolsa a largo plazo",
            ],
            "correct": 1,
        },
        {
            "id": "q5",
            "text": "Si vas a pedir un préstamo y quieres conocer el coste real total, incluyendo intereses, comisiones y gastos, ¿qué indicador debes mirar?",
            "options": [
                "El TIN (Tipo de Interés Nominal)",
                "La cuota mensual",
                "La TAE (Tasa Anual Equivalente)",
            ],
            "correct": 2,
        },
    ]
}


def get_questions(phase: str) -> QuizQuestions:
    questions = _QUESTIONS.get(phase, _QUESTIONS["pre"])
    return QuizQuestions(
        questions=[
            QuizQuestion(id=q["id"], text=q["text"], options=q["options"])
            for q in questions
        ]
    )


def score_quiz(phase: str, body: QuizAnswers) -> QuizScore:
    questions = _QUESTIONS.get(phase, _QUESTIONS["pre"])
    correct_map = {q["id"]: q["correct"] for q in questions}
    score = sum(
        1 for qid, answer in body.answers.items()
        if correct_map.get(qid) == answer
    )
    return QuizScore(score=score, total=len(questions))
