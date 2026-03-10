from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.health import router as health_check_router
from app.domain.StudyAssistantManager import StudyAssistantManager
from contextlib import asynccontextmanager
from enum import Enum
import time

class HealthStatus(str, Enum):
    """Enum to represent health status of the application."""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"

class HealthCheck:
    """Class to represent the health check status of the application."""
    
    def __init__(self, status: HealthStatus = HealthStatus.UNHEALTHY, name: str = "Unnamed Check"):
        self.name = name
        self.start_time = None
        self.duration_ms = None
        self.status = status
        self.error = None

    def start(self):
        """Start the health check timer."""
        self.start_time = time.time()

    def success(self):
        """Mark the health check as successful and calculate duration."""
        self.duration_ms = self._duration_ms()
        self.status = HealthStatus.HEALTHY.value

    def failure(self, error: Exception):
        """Mark the health check as failed and record the error."""
        self.duration_ms = self._duration_ms()
        self.status = HealthStatus.UNHEALTHY.value
        self.error = str(error)

    def _duration_ms(self):
        """Calculate the duration of the health check in milliseconds."""
        return int((time.time() - self.start_time) * 1000)

class StartupCheck(HealthCheck):
    """Class to manage multiple health check diagnostics."""
    
    def __init__(self):
        self.diagnostics: list[HealthCheck] = []
        self.initial_startup_time = None
        self.startup_time_ms = None

    def start_startup(self):
        """Start the startup diagnostics timer."""
        self.initial_startup_time = time.time()

    def end_startup(self):
        """End the startup diagnostics timer."""
        self.startup_time_ms = int((time.time() - self.initial_startup_time) * 1000)

    def add_diagnostic(self, name: str):
        """Add a health check trace to the diagnostics."""
        diagnostic = HealthCheck(name=name)
        diagnostic.start()
        
        self.diagnostics.append(diagnostic)

        return diagnostic
    
    def to_dict(self):
        """Convert diagnostics to a dictionary format for reporting."""
        app_status = HealthStatus.HEALTHY if all(d.status == HealthStatus.HEALTHY for d in self.diagnostics) else HealthStatus.UNHEALTHY
        
        return {            
            "status": app_status,
            "startup_time_ms": self.startup_time_ms,
            "uptime_ms": int((time.time() - self.initial_startup_time) * 1000) if self.initial_startup_time else None,
            "diagnostics": [
                {
                    "name": str(d.name),
                    "status": d.status,
                    "duration_ms": d.duration_ms,
                    "error": d.error
                } for d in self.diagnostics
            ]
        }

@asynccontextmanager
async def lifespan(app: FastAPI):

    diagnostics = StartupCheck()    
    diagnostics.start_startup()  # Start the startup diagnostics timer

    # STARTUP
    
    # 1. Initialize the StudyAssistantManager and store it in app state for later use in API routes =============================
    orchestrator_check = diagnostics.add_diagnostic("Langchain Orchestrator Initialization")
    try:
        app.state.assistant_manager = StudyAssistantManager()
        orchestrator_check.success()
    except Exception as e:
        orchestrator_check.failure(e)
        print(f"Error occurred while initializing StudyAssistantManager: {e}")
        raise
        
    app.state.startup_diagnostics = diagnostics  # Store diagnostics in app state for later retrieval

    diagnostics.end_startup()  # End the startup diagnostics time
    
    yield # Control returns here on shutdown
        
    # SHUTDOWN
    app.state.assistant_manager = None  # Clean up the assistant manager on shutdown
    app.state.startup_diagnostics = None  # Clean up startup diagnostics on shutdown

# Initialize FastAPI application needed for the backend service API.
app = FastAPI(title="Video Study Assistant", version="1.0.0", lifespan=lifespan)

app.include_router(router)  # Include API routes with /api prefix
app.include_router(health_check_router)  # Include health check routes

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    """Middleware to add processing time header to responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Video Study Assistant!"}