import httpx


SECURITY_HEADERS = {
    "Content-Security-Policy": "csp",
    "Strict-Transport-Security": "hsts",
    "X-Frame-Options": "x_frame_options",
    "X-Content-Type-Options": "x_content_type_options",
    "X-XSS-Protection": "x_xss_protection",
    "Referrer-Policy": "referrer_policy",
    "Permissions-Policy": "permissions_policy",
}


async def scan_headers(deploy_url: str | None) -> dict:
    """
    Inspect live URL headers.
    Returns dict with is_https, cors_wildcard, and security header presence.
    """
    if not deploy_url:
        return _empty_result(None)

    # Normalize URL
    url = deploy_url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    is_https = url.startswith("https://")

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            verify=True,
        ) as client:
            response = await client.get(url)
            headers = {k.lower(): v for k, v in response.headers.items()}
            return _parse_headers(headers, is_https, url)
    except httpx.ConnectError:
        # Try HTTP if HTTPS fails
        if is_https:
            try:
                http_url = "http://" + url[8:]
                async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
                    response = await client.get(http_url)
                    headers = {k.lower(): v for k, v in response.headers.items()}
                    return _parse_headers(headers, False, http_url)
            except Exception:
                pass
        return _empty_result(is_https)
    except Exception:
        return _empty_result(is_https)


def _parse_headers(headers: dict, is_https: bool, url: str) -> dict:
    cors_origin = headers.get("access-control-allow-origin", "")
    cors_wildcard = cors_origin.strip() == "*"

    return {
        "is_https": is_https,
        "cors_wildcard": cors_wildcard,
        "cors_origin": cors_origin,
        "csp": bool(headers.get("content-security-policy")),
        "hsts": bool(headers.get("strict-transport-security")),
        "x_frame_options": bool(headers.get("x-frame-options")),
        "x_content_type_options": bool(headers.get("x-content-type-options")),
        "server": headers.get("server", ""),
        "reachable": True,
        "status_code": None,
    }


def _empty_result(is_https: bool | None) -> dict:
    return {
        "is_https": is_https or False,
        "cors_wildcard": False,
        "cors_origin": "",
        "csp": False,
        "hsts": False,
        "x_frame_options": False,
        "x_content_type_options": False,
        "server": "",
        "reachable": False,
        "status_code": None,
    }
