"""
Middleware that guarantees an anonymous client id cookie on every request.
"""

import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

CID_COOKIE = "cid"


class ClientIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that ensures a stable anonymous client id per browser.

    In development on localhost the cookie uses SameSite Strict and secure False.
    In production you must switch secure to True when serving over HTTPS.
    """

    async def dispatch(self, request: Request, call_next):
        """
        Process the request and set the cid cookie if it is missing.

        Returns
        -------
        Response
            The downstream response, possibly with a new cid cookie attached.
        """
        response = await call_next(request)
        if CID_COOKIE not in request.cookies:
            response.set_cookie(
                key=CID_COOKIE,
                value=str(uuid.uuid4()),
                httponly=True,
                samesite="strict",  # Strict is safe and works on localhost same site
                secure=False,  # Set True in production with HTTPS
                max_age=60 * 60 * 24 * 30,  # 30 days
            )
        return response
