# Ubrary - An Online Library System

Ubrary is a full-stack online library application designed to provide a seamless experience for both readers and administrators. It allows users to browse, borrow, and manage a vast collection of books through an intuitive web interface. The project is built with Django and utilizes the Django REST Framework to expose a powerful API.

## ✨ Features

-   **User Authentication:** Secure user registration and login system.
-   **Book Catalog:** Browse books by categories like Fantasy, Science, Technology, etc.
-   **Search Functionality:** Easily find books with a powerful search feature.
-   **Book Details:** View detailed information for each book, including cover, author, and description.
-   **Personalized Lists:** Users can add books to their "Favorites" and "Borrowed" lists.
-   **Admin Panel:** A comprehensive admin dashboard to manage books, users, and categories.
-   **RESTful API:** A well-documented API for programmatic access to the library's resources.

## 🛠️ Tech Stack

-   **Backend:** Django, Django REST Framework
-   **Frontend:** HTML, CSS, JavaScript
-   **Database:** SQLite3 (default, can be configured for others)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Python (3.8+ recommended)
-   pip (Python package installer)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/Ubrary.git
    cd Ubrary
    ```

2.  **Create and activate a virtual environment:**
    - On Windows:
      ```sh
      python -m venv venv
      .\venv\Scripts\activate
      ```
    - On macOS/Linux:
      ```sh
      python3 -m venv venv
      source venv/bin/activate
      ```

3.  **Install dependencies:**
    *Note: A `requirements.txt` file is not present. You can create one using `pip freeze > requirements.txt` after installing the packages below.*
    ```sh
    pip install Django djangorestframework Pillow
    ```

4.  **Apply database migrations:**
    ```sh
    python manage.py migrate
    ```

5.  **Create a superuser to access the admin panel:**
    ```sh
    python manage.py createsuperuser
    ```
    (Follow the prompts to create a username and password)

6.  **Run the development server:**
    ```sh
    python manage.py runserver
    ```
    The application will be available at `http://127.0.0.1:8000`.

## 📂 Project Structure

The project follows a standard Django project structure:

```
Ubrary/
├── db.sqlite3
├── library/
│   ├── __init__.py
│   ├── admin.py
│   ├── models.py
│   ├── serializers.py
│   ├── static/
│   ├── templates/
│   ├── urls.py
│   └── views.py
├── manage.py
├── media/
│   └── book_covers/
└── README.md
```

-   `library/`: The main Django app.
-   `library/models.py`: Contains the database models (e.g., `Book`, `User`).
-   `library/views.py`: Contains the logic for rendering pages and API endpoints.
-   `library/serializers.py`: Defines the API representations.
-   `library/urls.py`: URL routing for the application.
-   `library/templates/`: HTML templates for the frontend.
-   `library/static/`: CSS, JavaScript, and image files.
-   `media/`: Stores user-uploaded files like book covers.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Made with ❤️ by The Ubrary Team
