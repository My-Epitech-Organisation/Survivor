"""
Ce fichier est déprécié et n'est plus utilisé.
Veuillez utiliser disable_csp_middleware.py à la place.
"""

class SwaggerCSPMiddleware:
    """
    Middleware to relax Content Security Policy for Swagger UI and ReDoc pages.
    This middleware is deprecated. Please use DisableCSPForDocsMiddleware instead.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Ce middleware est déprécié et ne fait rien
        return response
