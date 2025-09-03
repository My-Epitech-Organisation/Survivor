from django.utils.deprecation import MiddlewareMixin


class CSPMiddleware(MiddlewareMixin):
    """
    Middleware to add Content-Security-Policy headers
    """
    def process_response(self, request, response):
        csp_policies = [
            "default-src 'self'",
            "img-src 'self' data: https:",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https: ws: wss:",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
        ]

        response['Content-Security-Policy'] = "; ".join(csp_policies)
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        response['X-Content-Type-Options'] = 'nosniff'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'

        return response
