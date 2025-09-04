class SwaggerCSPMiddleware:
    """
    Middleware to relax Content Security Policy for Swagger UI and ReDoc pages.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Relax the CSP for the Swagger UI and Redoc pages
        if request.path in ['/api/docs/', '/api/redoc/']:
            # Remove existing CSP headers if they exist
            for header in ['Content-Security-Policy', 'X-Content-Security-Policy']:
                if header in response:
                    del response[header]

        return response
