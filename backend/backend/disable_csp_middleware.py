"""
Additional middleware to completely deactivate the CSP for certain roads
"""


class DisableCSPForDocsMiddleware:
    """
    Middleware which completely removes CSP headers for API documentation roads.
    Useful in case of persistent problems with CDNs.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # If the path corresponds to an API documentation page
        if request.path in ['/api/docs/', '/api/redoc/', '/api/schema/']:
            # Remove CSP headers if they exist
            if 'Content-Security-Policy' in response:
                del response['Content-Security-Policy']
            if 'X-Content-Security-Policy' in response:
                del response['X-Content-Security-Policy']

        return response
