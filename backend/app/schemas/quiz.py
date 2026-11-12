from pydantic import BaseModel, Field

class QuizQuestion(BaseModel):
    id: str
    text: str
    options: list[str]

class QuizQuestions(BaseModel):
    questions: list[QuizQuestion]

class QuizAnswers(BaseModel):
    answers: dict[str, int]

class QuizScore(BaseModel):
    score: int = Field(ge=0)
    total: int = Field(ge=0)
