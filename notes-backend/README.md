# Notes Backend API

 ## API Endpoints

- **Authentication**: `/auth/*`
- **Notes**: `/api/v1/notes/*`
- **Admin**: `/admin/*`
- **Audit**: `/audit/*`
- **Documentation**: `/swagger-ui.html`

## Tech Stack

- **Java 21**
- **Spring Boot 3.x**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **PostgreSQL**
- **Maven**
- **Docker**

## Features

- User authentication with JWT tokens
- CRUD operations for notes
- Pagination and search functionality
- Role-based access control (User/Admin)
- Two-factor authentication (2FA)
- Audit logging
- Caching for performance
- API documentation with Swagger

## Database

PostgreSQL database with entities for users, notes, roles, and audit logs.

## Security

- JWT-based authentication
- BCrypt password encryption
- Role-based authorization
- CORS configuration
