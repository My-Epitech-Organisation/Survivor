from django.utils.deprecation import MiddlewareMixin


class CSPMiddleware(MiddlewareMixin):
    """
    Middleware to add Content-Security-Policy headers
    """

    def process_response(self, request, response):
        # Relax the CSP for the Swagger UI and Redoc pages
        if request.path in ["/api/docs/", "/api/redoc/", "/api/schema/"]:
            # CSP more permissive for API documentation pages
            response["Content-Security-Policy"] = (
                "default-src 'self'; "
                "img-src 'self' data: https:; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
                "font-src 'self' https://fonts.gstatic.com; "
                "connect-src 'self' https: ws: wss:; "
                "worker-src 'self' blob:; "  # Added worker-src to allow blob URLs for Web Workers
                "frame-ancestors 'none'; "
                "form-action 'self'; "
                "base-uri 'self'"
            )
        else:
            # Normal CSP for the rest of the application
            csp_policies = [
                "default-src 'self'",
                "img-src 'self' data: https:",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "font-src 'self' https://fonts.gstatic.com",
                "connect-src 'self' https: ws: wss:",
                "worker-src 'self'",  # Default worker-src for non-doc pages
                "frame-ancestors 'none'",
                "form-action 'self'",
                "base-uri 'self'",
            ]
            response["Content-Security-Policy"] = "; ".join(csp_policies)

        # Other security headers
        response["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response["X-Content-Type-Options"] = "nosniff"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response["X-Frame-Options"] = "DENY"
        response["X-XSS-Protection"] = "1; mode=block"

        return response
