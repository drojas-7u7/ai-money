"""Endpoints del cuestionario de educación financiera."""

from fastapi import APIRouter

from app.schemas.quiz import QuizAnswers, QuizQuestions, QuizScore
from app.services.quiz import get_questions, score_quiz

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/{phase}", response_model=QuizQuestions)
def get_quiz(phase: str) -> QuizQuestions:
    return get_questions(phase)


@router.post("/{phase}", response_model=QuizScore)
def post_quiz(phase: str, body: QuizAnswers) -> QuizScore:
    return score_quiz(phase, body)
