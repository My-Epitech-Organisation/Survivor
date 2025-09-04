"""
Additional middleware to completely deactivate the CSP for certain routes
"""


class DisableCSPForDocsMiddleware:
    """
    Middleware which completely removes CSP headers for API documentation routes.
    Useful in case of persistent problems with CDNs.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # If the path corresponds to an API documentation page
        if request.path in ['/api/docs/', '/api/redoc/', '/api/schema/']:
            # Remove all CSP-related headers
            headers_to_remove = [
                'Content-Security-Policy',
                'X-Content-Security-Policy',
                'Content-Security-Policy-Report-Only',
                'X-WebKit-CSP',
                'X-WebKit-CSP-Report-Only',
            ]

            for header in headers_to_remove:
                if header in response:
                    del response[header]

            # Add a very permissive CSP that allows everything needed for ReDoc
            response['Content-Security-Policy'] = (
                "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; "
                "worker-src * 'unsafe-inline' 'unsafe-eval' data: blob:; "
                "connect-src * 'unsafe-inline'; "
                "img-src * data: blob:; "
                "frame-src *; "
                "style-src * 'unsafe-inline'; "
                "script-src * 'unsafe-inline' 'unsafe-eval' blob:; "
                "font-src * data:;"
            )

        return response
