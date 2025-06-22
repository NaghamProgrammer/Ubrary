from rest_framework.permissions import BasePermission

class IsCustomAdmin(BasePermission):
    """
    Allows access only to users with is_admin=True.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin
