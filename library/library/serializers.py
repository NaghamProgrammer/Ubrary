from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Book, BorrowedBook, FavoriteBook, Category

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
    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all()
    )
    added_by = UserSerializer(read_only=True)

    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = ['id', 'added_by']



class BorrowedBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = BorrowedBook
        fields = '__all__'
        read_only_fields = ['user']


class FavoriteBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = FavoriteBook
        fields = '__all__'
        read_only_fields = ['user']