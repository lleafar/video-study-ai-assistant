from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from app.domain.StudyAssistantManager import StudyAssistantManager
from app.services.title_service import get_url_title_service
import json

router = APIRouter()

class ContextURL(BaseModel):
    url: str = Field(..., description="URL adicional para contexto")
    title: str = Field(..., description="Título da URL para exibição")

class ChatRequest(BaseModel):
    chatId: str = Field(..., description="ID único do chat/sessão")
    videoUrl: str = Field(..., description="URL do vídeo para análise")
    contextURLs: list[ContextURL] = Field(default_factory=list, description="URLs adicionais para contexto")
    message: str = Field(..., description="Pergunta ou comando para o assistente de estudo")


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    assistant_manager = StudyAssistantManager()  # Get the singleton instance of StudyAssistantManager
    
    urls = [context.url for context in request.contextURLs]
    
    async def generate():
        
        stream = await assistant_manager.invoke_study_assistant(
            chat_id=request.chatId,
            video_url=request.videoUrl,
            message=request.message, 
            context_urls=urls
        )
        
        async for msg, metadata in stream:
            if msg and hasattr(msg, "content") and msg.content:
                # Determine message type based on class name
                msg_class_name = type(msg).__name__
                msg_type = "ai" if msg_class_name == "AIMessageChunk" else "tool"
                
                # Send structured JSON with type info
                json_msg = json.dumps({
                    "type": msg_type,
                    "content": msg.content
                }, ensure_ascii=False)
                yield f"data: {json_msg}\n\n"
                
    return StreamingResponse(generate(), media_type="text/event-stream; charset=utf-8")
            
@router.get("/api/get-title")
async def get_url_title(url: str):
    title = await get_url_title_service(url)
    return {"title": title}