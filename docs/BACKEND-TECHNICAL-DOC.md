# Technical Documentation for the Backend

## Overview
The backend of this application is a robust and modular system designed to handle various functionalities such as authentication, API exposure, audit logging, and more. It is built using Python and Django, leveraging Django's ORM, middleware, and app structure to ensure scalability and maintainability.

## Project Structure
The backend is organized into several Django apps, each responsible for a specific domain of the application. Below is a high-level overview of the structure:

- **admin_panel**: Handles administrative functionalities.
- **auditlog**: Manages logging and auditing of system events.
- **authentication**: Provides user authentication and permission management.
- **drive**: Manages file storage and related operations.
- **exposed_api**: Contains API endpoints for various entities like events, founders, investors, etc.
- **init**: Includes initialization scripts and utilities.
- **messaging**: Manages real-time communication and messaging.

## Key Components

### 1. **Settings**
The `settings.py` file in the `backend` directory is the central configuration file. It includes settings for:
- Database: SQLite is used for development.
- Installed apps: Lists all Django apps used in the project.
- Middleware: Includes custom middleware like `disable_csp_middleware.py`.

### 2. **Routing**
The `urls.py` files in each app define the URL patterns for the application. The main `urls.py` in the `backend` directory aggregates these patterns.

### 3. **Database Models**
Each app contains a `models.py` file defining the database schema. Django's ORM is used for database operations.

### 4. **Serializers**
Serializers in apps like `admin_panel` and `exposed_api` convert complex data types to JSON for API responses.

### 5. **Views**
Views handle the business logic and interact with models and serializers. They are defined in `views.py` files across apps.

### 6. **Tests**
Each app has a `tests` directory containing unit tests for models, views, and serializers.

### 7. **Docker Integration**
The backend is containerized using Docker. The `Dockerfile` and `docker-compose.yml` files define the container setup.

### 8. **Scripts**
Custom scripts like `health_check_script.py` and `entrypoint.sh` are used for health checks and container initialization.

## API Documentation
The backend exposes a RESTful API. Key endpoints include:
- **Authentication**: `/auth/login/`, `/auth/register/`
- **Admin Panel**: `/admin/`
- **Exposed API**: `/api/events/`, `/api/founders/`, `/api/investors/`

## Middleware
Custom middleware includes:
- `disable_csp_middleware.py`: Disables Content Security Policy for specific use cases.

## Deployment
The backend can be deployed using Docker. The `docker-compose.yml` file orchestrates the services.

## Future Enhancements
- Migrate to a more robust database like PostgreSQL for production.
- Implement caching for frequently accessed data.
- Add more unit and integration tests.

## Conclusion
This documentation provides a high-level overview of the backend architecture and its components. For detailed information, refer to the respective app directories and their files.

## Architecture Diagram

Below is an updated and more detailed ASCII diagram representing the architecture of the backend:

```
+-------------------+
|      Client       |
+-------------------+
          |
          v
+-------------------+        +-------------------+
|   Django Backend  |<------>| Authentication    |
+-------------------+        +-------------------+
          |
          v
+-------------------+        +-------------------+
|  Admin Panel      |<------>| Audit Log         |
+-------------------+        +-------------------+
          |
          v
+-------------------+        +-------------------+
|  Exposed API      |<------>| Messaging         |
+-------------------+        +-------------------+
          |
          v
+-------------------+
|     Database      |
|     (SQLite)      |
+-------------------+
```

This updated diagram provides a more comprehensive view of the backend's architecture, showing the interactions between the main components and the database.
