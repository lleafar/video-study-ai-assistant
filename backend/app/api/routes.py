from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from app.domain.StudyAssistantManager import StudyAssistantManager
import json

router = APIRouter()

class ChatRequest(BaseModel):
    videoUrl: str = Field(..., description="URL do vídeo para análise")
    message: str = Field(..., description="Pergunta ou comando para o assistente de estudo")

@router.post("/chat")
def chat_endpoint(
    request: ChatRequest,
    assistant_manager: StudyAssistantManager = Depends()):
    print(f"Received chat request with videoUrl: {request.videoUrl} and message: {request.message}")
    
    async def generate():
        stream = assistant_manager.invoke_study_assistant(request.message, request.videoUrl)
        for token, metadata in stream:
            if token is None:
                continue
            
            if token.content_blocks is None:
                continue
            
            for block in token.content_blocks:
                if block.get("type") == "text":
                    text = block.get("text", "")
                    if text:
                        print(f"Received text chunk: {text}")
                        yield text
            
    return StreamingResponse(generate(), media_type="text/event-stream")