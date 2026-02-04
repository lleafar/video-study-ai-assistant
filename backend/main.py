from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="Video Study Assistant", version="1.0.0")

# Include the API routes
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Video Study Assistant!"}