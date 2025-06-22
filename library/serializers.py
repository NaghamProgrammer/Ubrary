from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Book, BorrowedBook, FavoriteBook, Category
import base64


User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'is_admin', 'is_staff', 'is_active', 'password']
        read_only_fields = ['is_admin', 'is_staff', 'is_active']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'is_admin', 'is_staff', 'is_superuser', 'is_active', 'password']
        read_only_fields = ['is_staff', 'is_superuser']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


class BookSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    available_copies = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = '__all__'

    def get_available_copies(self, obj):
        return obj.available_copies()


class AdminBookSerializer(serializers.ModelSerializer):
    cover = serializers.ImageField(write_only=True, required=False) 
    cover_string = serializers.CharField(read_only=True)  

    class Meta:
        model = Book
        fields = '__all__'

    def create(self, validated_data):
        image_file = validated_data.pop('cover', None)
        if image_file:
            
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            validated_data['cover'] = image_data
        return super().create(validated_data)


class BorrowedBookSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), write_only=True
    )
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    cover_url = serializers.SerializerMethodField()
    
    def get_cover_url(self, obj):
        return obj.book.get_cover_image_data()

    class Meta:
        model = BorrowedBook
        fields = ['book', 'book_id', 'title', 'author', 'cover_url', 'borrow_date', 'return_date', 'returned']
        read_only_fields = ['book_id', 'title', 'author', 'cover_url', 'borrow_date', 'return_date', 'returned']

    def create(self, validated_data):
        book = validated_data['book']
        # Decrease number_of_copies only when creating a new borrowed record
        if book.available_copies() > 0:
            book.number_of_copies -= 1
            book.save()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'returned' in validated_data and validated_data['returned']:
            # Increase number_of_copies only when returning a book
            instance.book.number_of_copies += 1
            instance.book.save()
        return super().update(instance, validated_data)




class FavoriteBookSerializer(serializers.ModelSerializer):
    # Write-only book field for POST
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), write_only=True)

    # Flattened book fields for GET responses (read-only)
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    book_cover_url = serializers.SerializerMethodField()

    class Meta:
        model = FavoriteBook
        fields = ['book', 'book_id', 'book_title', 'book_author', 'book_cover_url']
        read_only_fields = ['book_id', 'book_title', 'book_author', 'book_cover_url']

    def get_book_cover_url(self, obj):
        return obj.book.get_cover_image_data()  # or whatever method you use to get base64 cover

    def validate(self, data):
        user = self.context['request'].user
        book = data.get('book')
        if FavoriteBook.objects.filter(user=user, book=book).exists():
            raise serializers.ValidationError('You have already favorited this book.')
        return data


