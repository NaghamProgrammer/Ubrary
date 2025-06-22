from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


# ---------------------
# USER MANAGER
# ---------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, is_admin=False, **extra_fields):
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, is_admin=is_admin, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user(email, password, is_admin=True, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


# ---------------------
# USER MODEL
# ---------------------
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Required for admin site access

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


# ---------------------
# CATEGORY
# ---------------------
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ---------------------
# BOOK
# ---------------------
import base64

class Book(models.Model):
    # id = models.CharField(max_length=5, primary_key=True)  # Make sure to generate IDs consistently
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    categories = models.ManyToManyField(Category, related_name='books')
    cover = models.TextField(blank=True, null=True)  # Store base64 string here
    description = models.TextField()
    published_date = models.DateField()
    number_of_copies = models.PositiveIntegerField(default=1)
    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'is_staff': True}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def available_copies(self):
        return self.number_of_copies - self.borrowed_by.filter(returned=False).count()

    def is_available(self):
        return self.available_copies() > 0

    def set_cover_from_file(self, file):
        """Utility to convert an uploaded image file to base64 and save it"""
        if file:
            encoded_string = base64.b64encode(file.read()).decode('utf-8')
            self.cover = encoded_string

    def get_cover_image_data(self):
        """Return base64 string to be used in HTML img src"""
        if self.cover:
            return f"data:image/jpeg;base64,{self.cover}"
        return None



# ---------------------
# BORROWED BOOK
# ---------------------
class BorrowedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowed_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowed_by')
    borrow_date = models.DateField(auto_now_add=True)
    return_date = models.DateField(null=True, blank=True)
    returned = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.email} borrowed {self.book.title}"

    def return_book(self):
        self.returned = True
        self.return_date = timezone.now().date()
        self.save()


# ---------------------
# FAVORITE BOOK
# ---------------------
class FavoriteBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.email} favorited {self.book.title}"