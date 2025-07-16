# Feedback Collection Platform

A full-stack web application that enables businesses to create customizable feedback forms and collect responses from customers through public URLs. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and TypeScript.

## Features

### 🔐 Authentication System
- **Admin Registration & Login**: Secure JWT-based authentication
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent login with token refresh

### 📝 Form Management
- **Dynamic Form Builder**: Create forms with 3-5 customizable questions
- **Multiple Question Types**: Text, textarea, radio buttons, checkboxes
- **Form Configuration**: Required fields, custom options
- **Public URL Generation**: Unique shareable links for each form

### 📊 Response Collection
- **Anonymous Submissions**: No login required for form respondents
- **Real-time Storage**: Instant response recording
- **Data Validation**: Client and server-side validation
- **Response Analytics**: View and analyze collected data

### 📈 Analytics & Reporting
- **Response Dashboard**: View all form responses in a clean interface
- **Analytics Summary**: Total responses, completion rates, trends
- **Visual Charts**: Response distribution for multiple-choice questions
- **Data Export**: CSV export functionality

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Intuitive Interface**: Clean, modern UI/UX
- **Loading States**: Smooth user interactions
- **Error Handling**: Comprehensive error management

## Tech Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Rate Limiting** - API protection

### Frontend
- **React 18** with **TypeScript** - UI framework
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Development Tools
- **ESLint** & **Prettier** - Code quality
- **Zod** - Schema validation
- **Lucide React** - Icons

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feedback
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Environment Configuration**
   
   **Server (.env):**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/feedback-platform
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

   **Client (.env.local):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## Usage Guide

### For Administrators

1. **Sign Up/Login**
   - Create an account with your business email
   - Provide your business name for identification

2. **Create Forms**
   - Click "Create Form" from the dashboard
   - Add 3-5 questions with different types
   - Configure required fields and options
   - Save to generate a public URL

3. **Share Forms**
   - Copy the public URL from form details
   - Share via email, social media, or embed on websites
   - Monitor responses in real-time

4. **Analyze Responses**
   - View individual responses in the dashboard
   - Access analytics for response trends
   - Export data as CSV for further analysis

### For Respondents

1. **Access Form**
   - Click on the shared public URL
   - No account creation required

2. **Submit Feedback**
   - Fill out all required fields
   - Submit the form
   - Receive confirmation message

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # Register new admin
POST /api/auth/login       # Admin login
GET  /api/auth/verify      # Verify JWT token
```

### Form Management (Protected)
```
POST /api/forms           # Create new form
GET  /api/forms           # List user's forms
GET  /api/forms/:id       # Get form details
PUT  /api/forms/:id       # Update form
DELETE /api/forms/:id     # Delete form
```

### Response Management (Protected)
```
GET /api/forms/:id/responses   # Get form responses
GET /api/forms/:id/analytics   # Get response analytics
GET /api/forms/:id/export      # Export responses as CSV
```

### Public Endpoints
```
GET  /api/public/forms/:publicUrl         # Get public form
POST /api/public/forms/:publicUrl/submit  # Submit response
```

## Project Structure

```
feedback/
├── server/                 # Backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── index.js        # Server entry point
│   ├── package.json
│   └── README.md
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # App entry point
│   ├── package.json
│   └── public/
├── project-planning/       # Documentation
└── README.md              # This file
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Secure cross-origin requests
- **XSS Protection**: Input sanitization
- **Environment Variables**: Sensitive data protection

## Performance Optimizations

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data loading
- **Code Splitting**: Lazy-loaded components
- **Responsive Images**: Optimized assets
- **Caching Headers**: Browser caching strategy

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## Deployment

### Production Build
```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
```

### Environment Setup
- Configure production MongoDB URI
- Set secure JWT secret
- Update CORS settings
- Enable HTTPS

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, Railway, or AWS EC2
- **Database**: MongoDB Atlas

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network permissions

2. **JWT Token Issues**
   - Clear localStorage
   - Check token expiry
   - Verify JWT_SECRET consistency

3. **CORS Errors**
   - Update CLIENT_URL in backend .env
   - Check frontend API URL configuration

### Development Tips

- Use browser dev tools for debugging
- Check server logs for API errors
- Verify environment variables are loaded
- Ensure both frontend and backend are running

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [your-email] or create an issue in the repository.

---

**Built with ❤️ using the MERN stack**