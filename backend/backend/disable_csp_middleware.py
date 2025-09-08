"""
Additional middleware to completely deactivate the CSP for certain routes
"""


class DisableCSPForDocsMiddleware:
    """
    Middleware which completely removes CSP headers for API documentation routes.
    Useful in case of persistent problems with CDNs.
    """

    def __init__(self, get_response):
        """
        Initialize the middleware with the get_response callable.

        Args:
            get_response: The callable that processes the next middleware or view
        """
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.path in ["/api/docs/", "/api/redoc/", "/api/schema/"]:
            headers_to_remove = [
                "Content-Security-Policy",
                "X-Content-Security-Policy",
                "Content-Security-Policy-Report-Only",
                "X-WebKit-CSP",
                "X-WebKit-CSP-Report-Only",
            ]

            for header in headers_to_remove:
                if header in response:
                    del response[header]

            return response
        return response
