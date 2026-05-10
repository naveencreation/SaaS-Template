from functools import wraps
from fastapi import HTTPException, status


def require_roles(allowed_roles: list[str]):
    """
    FastAPI route decorator for role-based access control.
    Must be used together with Depends(get_current_user).

    Usage:
        @router.get("/")
        @require_roles(["admin", "super_admin"])
        async def my_endpoint(current_user = Depends(get_current_user)):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=None, **kwargs):
            if current_user is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
            if current_user.get("role") not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "success": False,
                        "error": {
                            "code":    "INSUFFICIENT_PERMISSIONS",
                            "message": "You do not have permission to perform this action.",
                            "status":  403,
                        },
                    },
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator
