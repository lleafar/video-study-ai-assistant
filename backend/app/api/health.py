
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
async def health_check(request: Request) -> JSONResponse:
    """
    Check if the application is running and healthy.
    Used for load balancers and monitoring tools to verify
    the health of the application.
    """
    
    uptime_ms = request.app.state.startup_diagnostics.uptime_ms if hasattr(request.app.state, "startup_diagnostics") else None
    return JSONResponse(
        content={
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),            
            "uptime_ms": uptime_ms
        }, 
        status_code=200)

@router.get("/health/details")
async def health_check_details(request: Request) -> JSONResponse:
    """
    Check the health status of the application startup with detailed diagnostics.
    Used for monitoring tools to get insights into the health of various components.
    """
    diagnostics_details = request.app.state.startup_diagnostics.to_dict() if hasattr(request.app.state, "startup_diagnostics") else None

    return JSONResponse(
        content=diagnostics_details,
        status_code=200
    )

@router.get("/ready")
async def readiness_check(request: Request) -> JSONResponse:
    """
    Check if the application is ready to serve requests.
    Used for load balancers and monitoring tools to verify
    the readiness of the application.
    Checks can include:
    - Database connectivity,
    - FAISS service status,
    - OPEN AI API connectivity,
    - REDIS connectivity,
    - external service availability.
    """
    return JSONResponse(
        content={
            "status": "ready",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        status_code=200)