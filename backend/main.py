from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.domain.StudyAssistantManager import StudyAssistantManager

# Initialize FastAPI application needed for the backend service API.
app = FastAPI(title="Video Study Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Study Assistant Manager singleton (Eager initialization)
assistant_manager = StudyAssistantManager()

def get_assistant_manager():
    return assistant_manager

# Include the API routes in the FastAPI application with dependency injection for the assistant manager
app.include_router(router, dependencies=[Depends(get_assistant_manager)])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Video Study Assistant!"}