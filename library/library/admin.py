# from django.contrib import admin
# from .models import Category, Book, BorrowedBook, FavoriteBook, User
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from django.utils.html import format_html

# # --------------------------
# # Custom User Admin
# # --------------------------
# class UserAdmin(BaseUserAdmin):
#     ordering = ['email']
#     list_display = ('email', 'is_staff', 'is_superuser', 'is_active')
#     search_fields = ('email',)
#     readonly_fields = ('last_login',)
#     fieldsets = (
#         (None, {'fields': ('email', 'password')}),
#         ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active', 'groups', 'user_permissions')}),
#         ('Important dates', {'fields': ('last_login',)}),
#     )
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('email', 'password1', 'password2', 'is_staff', 'is_superuser'),
#         }),
#     )
#     filter_horizontal = ('groups', 'user_permissions',)

# admin.site.register(User, UserAdmin)

# # --------------------------
# # Category Admin
# # --------------------------
# @admin.register(Category)
# class CategoryAdmin(admin.ModelAdmin):
#     list_display = ('name',)
#     search_fields = ('name',)

# # --------------------------
# # Book Admin
# # --------------------------
# @admin.register(Book)
# class BookAdmin(admin.ModelAdmin):
#     list_display = ('title', 'author', 'published_date', 'number_of_copies', 'added_by_display')
#     search_fields = ('title', 'author')
#     list_filter = ('categories', 'published_date')
#     filter_horizontal = ('categories',)

#     def added_by_display(self, obj):
#         return obj.added_by.email if obj.added_by else "-"
#     added_by_display.short_description = "Added By"

# # --------------------------
# # BorrowedBook Admin
# # --------------------------
# @admin.register(BorrowedBook)
# class BorrowedBookAdmin(admin.ModelAdmin):
#     list_display = ('book', 'user_email', 'borrow_date', 'return_date', 'returned')
#     list_filter = ('returned', 'borrow_date')

#     def user_email(self, obj):
#         return obj.user.email
#     user_email.short_description = "User Email"

# # --------------------------
# # FavoriteBook Admin
# # --------------------------
# @admin.register(FavoriteBook)
# class FavoriteBookAdmin(admin.ModelAdmin):
#     list_display = ('book', 'user_email', 'added_at')

#     def user_email(self, obj):
#         return obj.user.email
#     user_email.short_description = "User Email"
