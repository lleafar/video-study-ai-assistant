# Define as rotas da API.
from fastapi import APIRouter
from app.domain.summarize_transcript import study_assistant

router = APIRouter()

@router.get("/chat")
def chat_endpoint():
    return study_assistant("Resuma o vídeo", "https://www.youtube.com/watch?v=IgvF0Dw7aMY")