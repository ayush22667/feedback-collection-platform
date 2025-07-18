# Feedback Collection Platform

A full-stack web application that enables businesses to create customizable feedback forms and collect responses from customers through public URLs. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and TypeScript.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Approach and Design Decisions](#approach-and-design-decisions)
- [Local Development Setup](#local-development-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Performance Optimizations](#performance-optimizations)
- [Contributing](#contributing)
- [License](#license)

## Features

### 🔐 Authentication System
- **Admin Registration & Login**: Secure JWT-based authentication for administrators.
- **Protected Routes**: Role-based access control to ensure only authenticated users can manage forms.
- **Session Management**: Persistent login sessions using `localStorage` and JWT tokens.

### 📝 Form Management
- **Dynamic Form Builder**: Easily create forms with 3-5 customizable questions.
- **Multiple Question Types**: Supports text, textarea, radio buttons, and checkboxes.
- **Public URL Generation**: Automatically generates a unique, shareable link for each form.

### 📊 Response Collection
- **Anonymous Submissions**: Users can submit feedback without needing to log in.
- **Real-time Storage**: Responses are instantly saved to the database.
- **Data Validation**: Both client-side and server-side validation to ensure data integrity.

### 📈 Analytics & Reporting
- **Response Dashboard**: View all form responses in a centralized and user-friendly interface.
- **Pagination Support**: Navigate through large sets of responses with efficient pagination controls.
- **Data Export**: Export collected responses to a CSV file for external analysis.
- **Real-time Analytics**: View form completion rates, response counts, and submission trends.

## Tech Stack

### Backend
- **Node.js** & **Express.js**: For building the RESTful API.
- **MongoDB** & **Mongoose**: As the database and Object Data Modeling (ODM) library.
- **JWT (JSON Web Tokens)**: For handling secure authentication.
- **bcryptjs**: For hashing user passwords.
- **Express Validator**: For robust server-side validation.

### Frontend
- **React 18** & **TypeScript**: For building a type-safe and scalable user interface.
- **Vite**: As the build tool and development server for a fast developer experience.
- **React Router**: For handling client-side routing.
- **React Hook Form** & **Zod**: For efficient and schema-based form validation.
- **Tailwind CSS**: For utility-first styling.
- **Axios**: For making HTTP requests to the backend.

## Approach and Design Decisions

This project was developed with a focus on creating a scalable, maintainable, and secure application. Here are some of the key design decisions:

1.  **Monorepo-Style Structure**:
    - The `client` and `server` applications are organized in a single repository. This simplifies development and deployment, as both parts of the project are versioned together.

2.  **MERN Stack with TypeScript**:
    - **React** was chosen for its component-based architecture, which allows for reusable UI elements.
    - **TypeScript** is used on the frontend to add static typing, which helps catch errors early and improves code quality and maintainability.
    - **Node.js** and **Express.js** provide a lightweight and powerful backend, perfect for building a RESTful API.
    - **MongoDB** offers a flexible, schema-less database that is well-suited for handling varied form structures.

3.  **Stateless Authentication with JWT**:
    - JWT was chosen for authentication because it is stateless. The server does not need to store session information, making the application easier to scale horizontally. The token is stored on the client-side and sent with each request to access protected resources.

4.  **Clear Separation of Concerns**:
    - The backend follows a standard MVC-like pattern (`models`, `controllers`, `routes`) to keep the codebase organized and easy to navigate.
    - On the frontend, a similar structure is used, with clear separation for `components`, `pages`, `services`, and `contexts`.

5.  **User-Friendly Form Validation**:
    - **React Hook Form** is used for its performance and ease of use in managing form state.
    - **Zod** is integrated for schema-based validation, allowing us to define the shape of our data and validate it on both the client and server, ensuring consistency.

## Local Development Setup

### Prerequisites
- **Node.js**: Version 16 or higher is recommended. Use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
- **MongoDB**: A running instance of MongoDB, either locally or on a cloud service like MongoDB Atlas.
- **npm** or **yarn**: A package manager for Node.js.

### Installation and Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/ayush22667/feedback-collection-platform.git
    cd feedback-collection-platform
    ```

2.  **Setup the Backend**:
    ```bash
    cd server
    npm install
    cp .env.example .env
    ```
    - **Edit the `.env` file** with your MongoDB connection string, JWT secret, and email configuration.
    ```env
    NODE_ENV=development
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/feedback-platform
    JWT_SECRET=your-super-secret-jwt-key
    JWT_EXPIRE=7d
    CLIENT_URL=http://localhost:3000
    
    # Email Configuration (for OTP verification)
    EMAIL_SERVICE=gmail
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    EMAIL_FROM=your-email@gmail.com
    
    # Rate Limiting
    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX_REQUESTS=100
    
    # Pagination
    DEFAULT_PAGE_SIZE=10
    MAX_PAGE_SIZE=100
    ```
    
    **Email Setup Notes:**
    - For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
    - For other providers: Configure SMTP settings as shown in `.env.example`
    - Email is required for OTP verification during user registration

3.  **Setup the Frontend**:
    ```bash
    cd ../client
    npm install
    cp .env.example .env
    ```
    - **Edit the `.env` file** to point to your backend API.
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

### Running the Application

1.  **Start the Backend Server**:
    ```bash
    cd server
    npm run dev
    ```
    The server will be running at `http://localhost:5000`.

2.  **Start the Frontend Development Server**:
    ```bash
    cd client
    npm run dev
    ```
    The client will be running at `http://localhost:3000`.

## Usage Guide

### For Administrators
1.  **Register/Login**: Create an account to access the admin dashboard.
2.  **Create Forms**: Use the form builder to create new feedback forms.
3.  **Share Forms**: Copy the generated public URL and share it with your audience.
4.  **Analyze Responses**: View and export responses from the dashboard.

### For Respondents
1.  **Access the Form**: Open the shared public URL in a browser.
2.  **Submit Feedback**: Fill out the form and submit. No login is required.

## API Documentation

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
- `GET /api/forms/:id/analytics`: Get analytics data for a form.
- `GET /api/forms/:id/export`: Export form responses as CSV.

### Public Endpoints
- `GET /api/public/forms/:publicUrl`: Get a form by its public URL.
- `POST /api/public/forms/:publicUrl/submit`: Submit a response to a form.

## Project Structure
```
/
├── client/         # React Frontend
├── server/         # Node.js Backend
└── README.md
```

## Security Features
- **Password Hashing**: Using `bcryptjs` to securely store passwords.
- **Input Validation**: To prevent malicious data from being processed.
- **Rate Limiting**: To protect against brute-force attacks.
- **Environment Variables**: To keep sensitive information out of the codebase.

## Performance Optimizations
- **Database Indexing**: For faster query performance.
- **Code Splitting**: With React for faster initial page loads.

## Contributing
Contributions are welcome! Please fork the repository and open a pull request with your changes.

## License
This project is licensed under the MIT License.
