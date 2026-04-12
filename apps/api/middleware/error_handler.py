"""Global Exception Handlers and Error Formatting."""
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback

logger = logging.getLogger(__name__)

async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.status_code, "message": exc.detail}},
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        error_msg = f"{error.get('loc', [''])[0]}.{error.get('loc', ['', ''])[1]}: {error.get('msg')}"
        errors.append(error_msg)
    
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": 422,
                "message": "Validation Error",
                "details": errors
            }
        },
    )

async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"Unhandled Exception: {str(exc)}"
    logger.error(f"{error_msg}\n{traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal Server Error",
                "details": "An unexpected error occurred. Administrators have been notified."
            }
        },
    )
