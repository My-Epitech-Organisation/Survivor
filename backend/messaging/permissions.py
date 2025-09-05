from rest_framework import permissions


class IsMessagingEligibleUser(permissions.BasePermission):
    """
    Custom permission to only allow users with eligible roles to access messaging features.
    Eligible roles: admin, founder, investor (any authenticated user except 'user' role)
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["admin", "founder", "investor"]
