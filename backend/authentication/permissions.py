from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users access
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsFounder(permissions.BasePermission):
    """
    Custom permission to only allow founder users access
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "founder"


class IsAdminOrFounder(permissions.BasePermission):
    """
    Custom permission to allow admin or founder users access
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ["admin", "founder"]


class IsInvestor(permissions.BasePermission):
    """
    Custom permission to only allow investor users access
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "investor"


class IsNotRegularUser(permissions.BasePermission):
    """
    Custom permission to allow any authenticated user except regular users
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role != "user"


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow owners of an object or admins to access it
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True

        if hasattr(obj, "user"):
            return obj.user == request.user

        return False
