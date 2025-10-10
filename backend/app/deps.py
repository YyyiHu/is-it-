"""
Reusable dependencies.
"""

from typing import Optional
from fastapi import Cookie, Header, HTTPException, status


def get_client_id(
    cid_cookie: Optional[str] = Cookie(default=None, alias="cid"),
    cid_header: Optional[str] = Header(default=None, alias="X-Client-Id"),
) -> str:
    """
    Return client id from cookie or header.
    """
    cid = cid_cookie or cid_header
    if not cid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing client id"
        )
    return cid
