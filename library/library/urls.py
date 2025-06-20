from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SignupView, LoginView, BookViewSet, BorrowedBookView, FavoriteBookView, FavoriteBookDeleteView,
    UserListCreateView, UserDetailView, AdminUserViewSet,
    AdminBookViewSet, CategoryViewSet, borrowed_books_page, 
    favorite_books_page, PasswordResetRequestView, PasswordResetConfirmView,
    user_page, admin_page, search_results_page, index, SearchView, EmailExistsView
)
from django.contrib import admin
from .views import CurrentUserView

router = DefaultRouter()
router.register('books', BookViewSet)
router.register('admin/users', AdminUserViewSet, basename='admin-user')
router.register('admin/books', AdminBookViewSet, basename='admin-book')
router.register('categories', CategoryViewSet, basename='category')

urlpatterns = [
    # path('admin/', admin.site.urls),

    # Auth
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/auth/', include('rest_framework.urls')),
    
    # Search endpoint
    path('api/search/', SearchView.as_view(), name='search'),
    
     # Password reset endpoints (from urlsA.py)
    path('api/email-exists/', EmailExistsView.as_view(), name='email-exists'),
    path('api/password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # API routes
    path('api/', include(router.urls)),
    path('api/users/', UserListCreateView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('api/borrowed-books/', BorrowedBookView.as_view(), name='api-borrowed-books'),

    # Favorite books routes with delete by book_id in URL
    path('api/favorite-books/', FavoriteBookView.as_view(), name='api-favorite-books'),
    path('api/favorite-books/<int:book_id>/', FavoriteBookDeleteView.as_view(), name='favorite-book-delete'),

    # Page views
    path('borrowed-books/', borrowed_books_page, name='page-borrowed-books'),
    path('favorite-books/', favorite_books_page, name='page-favorite-books'),
    
    # New page views
    path('user/', user_page, name='user-page'),
    path('admin/', admin_page, name='admin-page'),
    path('search/', search_results_page, name='search-results'),

    path('api/user/me/', CurrentUserView.as_view(), name='current-user'),
]