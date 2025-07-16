# Feedback Platform - Backend Server

## Quick Start

1. Install dependencies:
```bash
cd server
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your values:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feedback-platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login admin
- `GET /api/auth/verify` - Verify JWT token

### Forms (Protected)
- `POST /api/forms` - Create new form
- `GET /api/forms` - List user's forms
- `GET /api/forms/:id` - Get form details
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Responses (Protected)
- `GET /api/forms/:id/responses` - Get form responses
- `GET /api/forms/:id/analytics` - Get response analytics
- `GET /api/forms/:id/export` - Export responses as CSV

### Public
- `GET /api/public/forms/:publicUrl` - Get public form
- `POST /api/public/forms/:publicUrl/submit` - Submit response

## Features Implemented
✅ User authentication with JWT
✅ Form CRUD operations
✅ Public form access
✅ Response collection
✅ Analytics and reporting
✅ CSV export
✅ Input validation
✅ Rate limiting
✅ Security middleware