from django.contrib.auth import get_user_model, authenticate, login
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone


from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action

from .models import Book, BorrowedBook, FavoriteBook, Category
from .serializers import (
    BookSerializer, BorrowedBookSerializer,
    FavoriteBookSerializer, UserSerializer,
    AdminBookSerializer, AdminUserSerializer, CategorySerializer
)
from .permissions import IsCustomAdmin

import uuid
import datetime
import re
from django.db import models


User = get_user_model()

# Password reset tokens storage
password_reset_tokens = {}

# added this
from django.contrib.auth import logout

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)  # Clear the session
        return Response({'message': 'Logout successful.'}, status=200)
    
# end here 


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data
            email = data.get('email')
            password = data.get('password')
            is_admin = data.get('is_admin', False)

            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=400)

            if not (8 <= len(password) <= 12):
                return Response({'error': 'Password must be between 8 and 12 characters long.'}, status=400)
            if not re.search(r'[A-Z]', password):
                return Response({'error': 'Password must contain at least one uppercase letter.'}, status=400)
            if not re.search(r'[a-z]', password):
                return Response({'error': 'Password must contain at least one lowercase letter.'}, status=400)
            if not re.search(r'[0-9]', password):
                return Response({'error': 'Password must contain at least one number.'}, status=400)
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                return Response({'error': 'Password must contain at least one special character.'}, status=400)

            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already registered'}, status=400)

            user = User.objects.create_user(email=email, password=password, is_admin=is_admin)
            return Response({'message': 'User created', 'email': user.email}, status=201)
        except IntegrityError:
            return Response({'error': 'Email already exists'}, status=400)
        except Exception as e:
            return Response({'error': f'Registration failed: {str(e)}'}, status=500)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)

        print(email)
        print(password)
        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return Response({
                'message': 'Login successful.',
                'is_admin': user.is_admin,
                'email': user.email
            })
        else:
            return Response({'error': 'Invalid email or password.'}, status=401)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=400)
            
        try:
            user = User.objects.get(email=email)
            
            # Generate a unique token
            token = str(uuid.uuid4())
            
            # Store the token with user ID and expiration (24 hours)
            password_reset_tokens[token] = {
                'user_id': user.id,
                'expires': datetime.datetime.now() + datetime.timedelta(hours=24)
            }
            
            return Response({
                'message': 'Password reset instructions sent',
                'token': token,  # In production, don't return the token in the response
                'uid': user.id    # This is just for demonstration
            })
            
        except User.DoesNotExist:
            return Response({'message': 'If your email is registered, you will receive reset instructions'})
        except Exception as e:
            return Response({'error': f'Failed to process request: {str(e)}'}, status=500)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        uid = request.data.get('uid')
        new_password = request.data.get('new_password')
        
        if not token or not uid or not new_password:
            return Response({'error': 'Token, user ID, and new password are required'}, status=400)
            
        # Check if token exists and is valid
        if token not in password_reset_tokens:
            return Response({'error': 'Invalid or expired token'}, status=400)
            
        token_data = password_reset_tokens[token]
        
        # Check if token is expired
        if datetime.datetime.now() > token_data['expires']:
            del password_reset_tokens[token]
            return Response({'error': 'Token has expired'}, status=400)
            
        # Check if user ID matches
        if str(token_data['user_id']) != str(uid):
            return Response({'error': 'Invalid user ID'}, status=400)
            
        try:
            user = User.objects.get(id=uid)
            user.set_password(new_password)
            user.save()
            
            # Remove the used token
            del password_reset_tokens[token]
            
            return Response({'message': 'Password has been reset successfully'})
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': f'Failed to reset password: {str(e)}'}, status=500)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    #permission_classes = [AllowAny]
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='available')
    def available_books(self, request):
        available_books = Book.objects.all()
        available_books = [book for book in available_books if book.is_available()]
        serializer = self.get_serializer(available_books, many=True)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsCustomAdmin]

class BorrowedBookView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        borrowed_books = BorrowedBook.objects.filter(user=request.user)
        serializer = BorrowedBookSerializer(borrowed_books, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        book_id = request.data.get('book')

        if not book_id:
            return Response({'error': 'Book ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check user's borrow limit
        if BorrowedBook.objects.filter(user=user, returned=False).count() >= 6:
            return Response({'error': 'Borrow limit reached. Return some books first.'}, status=400)

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found.'}, status=404)

        # Check available copies
        if book.available_copies() <= 0:
            return Response({'error': 'No copies available for this book.'}, status=400)

        try:
            borrowed_book = BorrowedBook.objects.get(user=user, book=book)
            if borrowed_book.returned:
                borrowed_book.returned = False
                borrowed_book.return_date = None
                borrowed_book.borrow_date = timezone.now().date()
                borrowed_book.save()
                # Don't decrease copies here - it will be handled in the serializer
            else:
                return Response({'error': 'You already borrowed this book.'}, status=400)
        except BorrowedBook.DoesNotExist:
            borrowed_book = BorrowedBook(user=user, book=book)
            borrowed_book.save()
            # Don't decrease copies here - it will be handled in the serializer

        serializer = BorrowedBookSerializer(borrowed_book)
        return Response(serializer.data, status=200)
    
    def patch(self, request):
        book_id = request.data.get("book_id")
        if not book_id:
            return Response({"error": "book_id is required."}, status=400)

        try:
            borrowed_book = BorrowedBook.objects.get(user=request.user, book_id=book_id, returned=False)
            borrowed_book.returned = True
            borrowed_book.return_date = timezone.now().date()
            borrowed_book.save()
            # Don't increase copies here - it will be handled in the serializer

            serializer = BorrowedBookSerializer(borrowed_book)
            return Response(serializer.data, status=200)

        except BorrowedBook.DoesNotExist:
            return Response({"error": "No borrowed book found to return."}, status=404)


class FavoriteBookView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorite_books = FavoriteBook.objects.filter(user=request.user)
        serializer = FavoriteBookSerializer(favorite_books, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FavoriteBookSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FavoriteBookDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, book_id):
        try:
            favorite = FavoriteBook.objects.get(user=request.user, book_id=book_id)
            favorite.delete()
            return Response({"message": "Removed from favorites"}, status=status.HTTP_204_NO_CONTENT)
        except FavoriteBook.DoesNotExist:
            return Response({"error": "Favorite book not found"}, status=status.HTTP_404_NOT_FOUND)


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsCustomAdmin]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsCustomAdmin]

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsCustomAdmin]

class AdminBookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = AdminBookSerializer
    permission_classes = [IsCustomAdmin]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)

    def update(self, request, pk=None, *args, **kwargs):
        if 'id' in request.data and str(request.data['id']) != str(kwargs['pk']):
            return Response(
                {"error": "Book ID cannot be changed"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request,*args, **kwargs)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            book = self.get_object()
            book_id = book.id
            book_title = book.title
            book.delete()
            return Response({
                "message": f"Book '{book_title}' (ID: {book_id}) deleted successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": f"Failed to delete book: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

def borrowed_books_page(request):
    return render(request, 'borrowed_books.html')

def favorite_books_page(request):
    return render(request, 'favorite_books.html')


def user_page(request):
    """
    View function for the user's home page.
    Displays books and user-specific features.
    """
    return render(request, 'userPage.html')


def admin_page(request):
    """
    View function for the admin dashboard.
    Only accessible by admin users.
    """
    if not request.user.is_admin:
        return JsonResponse({'error': 'Access denied'}, status=403)
    return render(request, 'adminPage.html')


def search_results_page(request):
    """
    View function for displaying search results.
    """
    return render(request, 'searchResults.html')

def index(request):
    return render(request, 'index.html')

class SearchView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated users to search

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'error': 'Search query is required'}, status=400)

        # Search in books (title and author)
        books = Book.objects.filter(
            models.Q(title__icontains=query) | 
            models.Q(author__icontains=query)
        )

        # Search in categories
        category_books = Book.objects.filter(
            categories__name__icontains=query
        )

        # Combine and remove duplicates
        all_books = (books | category_books).distinct()

        # Serialize the results
        serializer = BookSerializer(all_books, many=True)
        return Response(serializer.data)
    

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)



