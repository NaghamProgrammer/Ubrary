from django.core.management.base import BaseCommand
from library.models import Book, Category
import base64
import os
from django.conf import settings
from datetime import date

class Command(BaseCommand):
    help = 'Load initial books from bookManager.js into the database'

    def handle(self, *args, **kwargs):
        # Create categories if they don't exist
        categories = {
            'Fiction': 'Fiction books',
            'Philosophy': 'Philosophy books',
            'Science': 'Science books'
        }
        
        category_objects = {}
        for cat_name, cat_desc in categories.items():
            category, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={'description': cat_desc}
            )
            category_objects[cat_name] = category

        # Initial books data
        books_data = [
            {
                'id': 'BK001',
                'title': 'MOBY DICK',
                'author': 'HERMAN MELVILLE',
                'category': 'Fiction',
                'cover': 'moby dick.png',
                'description': 'Moby-Dick is an 1851 novel by Herman Melville...',
            },
            {
                'id': 'BK002',
                'title': 'Pride and Prejudice',
                'author': 'JANE AUSTEN',
                'category': 'Fiction',
                'cover': 'pride and prejudice.png',
                'description': 'The romantic and witty story of Elizabeth Bennet...',
            },
            {
                'id': 'BK003',
                'title': 'To the Lighthouse',
                'author': 'VIRGINIA WOOLF',
                'category': 'Philosophy',
                'cover': 'to the lighthause.png',
                'description': 'A groundbreaking stream-of-consciousness novel...',
            },
            {
                'id': 'BK004',
                'title': '1984',
                'author': 'GEORGE ORWELL',
                'category': 'Science',
                'cover': '1984.png',
                'description': 'Orwell\'s harrowing vision of a totalitarian future...',
            },
            {
                'id': 'BK005',
                'title': 'THE TRIAL',
                'author': 'FRANZ KAFKA',
                'category': 'Philosophy',
                'cover': 'the trial.png',
                'description': 'Kafka\'s unsettling masterpiece follows Josef K....',
            }
        ]

        # Load books
        for book_data in books_data:
            # Convert cover image to base64
            cover_path = os.path.join(settings.MEDIA_ROOT, 'book_covers', book_data['cover'])
            cover_base64 = None
            
            try:
                with open(cover_path, 'rb') as image_file:
                    cover_base64 = base64.b64encode(image_file.read()).decode('utf-8')
            except FileNotFoundError:
                self.stdout.write(self.style.WARNING(f'Cover image not found for {book_data["title"]} at path: {cover_path}'))

            # Create or update book
            book, created = Book.objects.update_or_create(
                title=book_data['title'],
                defaults={
                    'author': book_data['author'],
                    'description': book_data['description'],
                    'cover': cover_base64,
                    'published_date': date.today(),  # You might want to set actual dates
                    'number_of_copies': 1
                }
            )

            # Add category
            book.categories.add(category_objects[book_data['category']])

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created book: {book.title}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Updated book: {book.title}')) 