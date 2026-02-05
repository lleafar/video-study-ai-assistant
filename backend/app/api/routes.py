from fastapi import APIRouter, Depends
from app.domain.StudyAssistantManager import StudyAssistantManager

router = APIRouter()

@router.get("/chat")
def chat_endpoint(assistant_manager: StudyAssistantManager = Depends()):
    return assistant_manager.invoke_study_assistant("Quantos habitantes a cidade de santana do livramento possui?", "https://www.youtube.com/watch?v=IgvF0Dw7aMY")