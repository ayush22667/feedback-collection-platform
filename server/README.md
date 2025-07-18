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

### Public Endpoints
- `GET /api/public/forms/:publicUrl`: Get a form by its public URL.
- `POST /api/public/forms/:publicUrl/submit`: Submit a response to a form.
