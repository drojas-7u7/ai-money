"""Servicio del cuestionario de educación financiera."""

from app.schemas.quiz import QuizAnswers, QuizQuestion, QuizQuestions, QuizScore

# Las preguntas se definen aquí con la clave 'correct' (índice de la opción correcta).
# Esa clave NO se expone en la API; solo se usa para calcular la puntuación.
_QUESTIONS: dict[str, list[dict]] = {
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
            "text": "¿Qué porcentaje de los ingresos se recomienda habitualmente destinar al ahorro?",
            "options": [
                "El 2-3 %",
                "El 5 %",
                "Entre el 10 % y el 20 %",
                "No hace falta ahorrar si no sobra dinero",
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
            "text": "Si la cuota mensual de un préstamo supera el 35 % de tus ingresos netos, ¿qué indica?",
            "options": [
                "Que el préstamo tiene un tipo de interés muy bajo",
                "Que el plazo de devolución es muy corto",
                "Que el nivel de endeudamiento puede ser arriesgado",
                "Nada en especial, es un porcentaje habitual",
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
