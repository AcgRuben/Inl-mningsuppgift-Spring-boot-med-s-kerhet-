# Library Java System

A Spring Boot REST API & Single Page Application for managing books, authors, users, and loans with role-based security.

## Features

- **Authentication & Security**: Role-based access control (`ROLE_USER` and `ROLE_ADMIN`) using Spring Security and HTTP Basic authentication. Passwords hashed using BCrypt.
- **Book Management**: Browse paginated book catalog, search by title or author, sort by title/ISBN/ID, add new books, and delete books (Admin).
- **One-Click Book Borrowing**: In-app borrowing directly from the catalog. Auto-calculates 14-day due dates and manages copy availability.
- **Personal Loans Dashboard**: View active loans, return books, or extend loans (+7 days) directly from your user profile.
- **Admin Dashboard**: Overview of all active loans in the system, manual loan creation, and author directory management.
- **Single Page Application (SPA)**: Responsive, dark-mode glassmorphism UI built with Vanilla JavaScript (ES Modules) and CSS.

---

## Tech Stack

- **Backend**: Java 17+, Spring Boot 3.4, Spring Security, Spring Data JPA
- **Database**: SQLite with Hibernate Community Dialects
- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3 (Glassmorphism design system)
- **Build Tool**: Apache Maven (`mvnw`)

---

## Getting Started

### Prerequisites
- Java JDK 17 or higher installed on your machine.

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/AcgRuben/Inl-mningsuppgift-Spring-boot-med-s-kerhet-.git
   cd library-system
   ```

2. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

3. Open your browser and navigate to:
   [http://localhost:8080](http://localhost:8080)

---

## API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register a new user account |
| `GET` | `/auth/user-page` | USER, ADMIN | Test user authentication |
| `GET` | `/auth/admin-page` | ADMIN | Test admin authentication |
| `GET` | `/books` | USER, ADMIN | Get paginated book list |
| `GET` | `/books/search/title` | USER, ADMIN | Search books by title |
| `GET` | `/books/search/author` | USER, ADMIN | Search books by author |
| `POST` | `/books` | ADMIN | Create a new book |
| `DELETE` | `/books/{id}` | ADMIN | Delete a book by ID |
| `GET` | `/authors` | USER, ADMIN | List all authors |
| `GET` | `/authors/search` | USER, ADMIN | Search authors by last name |
| `POST` | `/authors` | ADMIN | Register a new author |
| `GET` | `/loans` | ADMIN | List all active system loans |
| `POST` | `/loans?userId=X&bookId=Y` | USER, ADMIN | Borrow a book / create loan |
| `PUT` | `/loans/{id}/return` | USER, ADMIN | Return a borrowed book |
| `PUT` | `/loans/{id}/extend` | USER, ADMIN | Extend a loan by 7 days |
| `GET` | `/users/{email}` | USER, ADMIN | Get user profile info |
| `GET` | `/users/{id}/loans` | USER, ADMIN | Get active loans for user ID |

---

## Portfolio & Deployment Notes

For portfolio showcases on GitHub, Spring Boot with SQLite can be deployed as a single runnable JAR or Docker container to platforms such as **Render.com**, **Railway.app**, or **Fly.io**.
