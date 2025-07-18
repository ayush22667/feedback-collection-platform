# Backend Server - Feedback Collection Platform

This directory contains the backend server for the Feedback Collection Platform, built with Node.js, Express, and MongoDB.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)

## Features

- **RESTful API**: A complete set of endpoints for managing forms and collecting responses.
- **JWT Authentication**: Secure, stateless authentication for all protected routes.
- **Data Validation**: Server-side validation to ensure data integrity.
- **Security**: Middleware for rate limiting, CORS, and protection against common vulnerabilities.
- **CSV Export**: Functionality to export form responses to a CSV file.

## Architecture

The backend follows a standard Model-View-Controller (MVC) pattern to ensure a clear separation of concerns:

- **`src/models`**: Contains the Mongoose schemas for `User`, `Form`, and `Response`.
- **`src/controllers`**: Holds the business logic for handling requests.
- **`src/routes`**: Defines the API endpoints and maps them to the appropriate controllers.
- **`src/middleware`**: Includes custom middleware for authentication and validation.
- **`src/config`**: For configuration files, such as the database connection.
- **`src/utils`**: Utility functions that can be reused across the application.

## Environment Variables

To run the server, you need to create a `.env` file in the `server` directory. You can copy the example file to get started:

```bash
cp .env.example .env
```

The following variables need to be set:

- `NODE_ENV`: The application environment (e.g., `development`, `production`).
- `PORT`: The port on which the server will run (e.g., `5000`).
- `MONGODB_URI`: The connection string for your MongoDB instance.
- `JWT_SECRET`: A secret key for signing JWT tokens.
- `JWT_EXPIRE`: The expiration time for JWT tokens (e.g., `7d`).
- `CLIENT_URL`: The URL of the frontend application for CORS configuration.
- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting in milliseconds (e.g., `900000` for 15 minutes).
- `RATE_LIMIT_MAX_REQUESTS`: Maximum number of requests per window (e.g., `100`).
- `DEFAULT_PAGE_SIZE`: Default number of items per page for pagination (e.g., `10`).
- `MAX_PAGE_SIZE`: Maximum allowed page size to prevent performance issues (e.g., `100`).

### Email Configuration

The application supports email functionality for OTP verification and welcome emails. Choose one of the following methods:

**Method 1: Gmail (Recommended for Development)**
- `EMAIL_SERVICE`: Set to `gmail`
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app password (not your regular password)
- `EMAIL_FROM`: The "from" address for emails (usually same as EMAIL_USER)

**Method 2: Custom SMTP Server**
- `SMTP_HOST`: Your SMTP server hostname
- `SMTP_PORT`: SMTP port (usually 587 for TLS or 465 for SSL)
- `SMTP_SECURE`: Set to `true` for SSL, `false` for TLS
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `EMAIL_FROM`: The "from" address for emails

**Note**: If no email configuration is provided, the application will log OTP codes to the console for development purposes.

## Available Scripts

- **`npm start`**: Starts the server in production mode.
- **`npm run dev`**: Starts the server in development mode with `nodemon` for automatic restarts.
- **`npm test`**: Runs the test suite.
- **`npm run lint`**: Lints the codebase for potential errors.
- **`npm run seed`**: Seeds the database with initial data.

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new admin.
- `POST /api/auth/login`: Login for an admin.

### Form Management (Protected)
- `POST /api/forms`: Create a new form.
- `GET /api/forms`: Get all forms for the logged-in user.
- `GET /api/forms/:id`: Get details for a specific form.
- `PUT /api/forms/:id`: Update a specific form.
- `DELETE /api/forms/:id`: Delete a specific form.

### Response Management (Protected)
- `GET /api/forms/:id/responses`: Get paginated responses for a form.
  - Query parameters: `page` (default: 1), `limit` (default: 10, max: 100)
  - Returns: `{ responses: [], pagination: { currentPage, totalPages, totalItems, itemsPerPage, hasNext, hasPrev } }`
- `GET /api/forms/:id/analytics`: Get analytics data for a form.
- `GET /api/forms/:id/export`: Export form responses as CSV.

### Public Endpoints
- `GET /api/public/forms/:publicUrl`: Get a form by its public URL.
- `POST /api/public/forms/:publicUrl/submit`: Submit a response to a form.
