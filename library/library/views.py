from django.contrib.auth import get_user_model, authenticate, login
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone

from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from .models import Book, BorrowedBook, FavoriteBook, Category
from .serializers import (
    BookSerializer, BorrowedBookSerializer,
    FavoriteBookSerializer, UserSerializer,
    AdminBookSerializer, AdminUserSerializer, CategorySerializer
)
from .permissions import IsCustomAdmin

import uuid
import datetime


User = get_user_model()

# Password reset tokens storage
password_reset_tokens = {}

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

            # Check if user already exists
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

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return Response({'message': 'Login successful.'})
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
    permission_classes = [IsAuthenticated]

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

        # Check if the user has already borrowed this book before
        try:
            borrowed_book = BorrowedBook.objects.get(user=user, book_id=book_id)
            if borrowed_book.returned:
                # Update the existing record
                borrowed_book.returned = False
                borrowed_book.return_date = None
                borrowed_book.borrow_date = timezone.now().date()
                borrowed_book.save()

                serializer = BorrowedBookSerializer(borrowed_book)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "This book is already borrowed and not yet returned."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except BorrowedBook.DoesNotExist:
            # Proceed with normal creation if no record exists
            serializer = BorrowedBookSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        book_id = request.data.get("book_id")

        if not book_id:
            return Response({"error": "book_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            borrowed_book = BorrowedBook.objects.get(user=request.user, book_id=book_id, returned=False)
            borrowed_book.returned = True
            borrowed_book.return_date = timezone.now().date()
            borrowed_book.save()

        
            serializer = BorrowedBookSerializer(borrowed_book)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except BorrowedBook.DoesNotExist:
            return Response({"error": "No borrowed book found to return."}, status=status.HTTP_404_NOT_FOUND)

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


