# Technical Specification Document

## 1. System Architecture

### 1.1 Architecture Pattern
- **Pattern**: MVC (Model-View-Controller)
- **API Style**: RESTful
- **Communication**: JSON over HTTP/HTTPS

### 1.2 System Components
```
┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Express API   │
│   (Frontend)    │◀────│   (Backend)     │
└─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    MongoDB      │
                        │   (Database)    │
                        └─────────────────┘
```

## 2. Database Design

### 2.1 Collections Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  businessName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}
```

#### Forms Collection
```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  description: {
    type: String,
    maxLength: 500
  },
  questions: [{
    _id: ObjectId,
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'multiple-choice', 'radio', 'checkbox'],
      required: true
    },
    options: [{
      type: String,
      required: function() { return this.type !== 'text' }
    }],
    required: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      required: true
    }
  }],
  publicUrl: {
    type: String,
    unique: true,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}
```

#### Responses Collection
```javascript
{
  _id: ObjectId,
  formId: {
    type: ObjectId,
    ref: 'Form',
    required: true
  },
  answers: [{
    questionId: {
      type: ObjectId,
      required: true
    },
    answer: {
      type: Schema.Types.Mixed, // String for text, Array for multi-select
      required: true
    }
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    submissionTime: Number // in milliseconds
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}
```

### 2.2 Database Indexes
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Forms
db.forms.createIndex({ userId: 1, createdAt: -1 })
db.forms.createIndex({ publicUrl: 1 }, { unique: true })

// Responses
db.responses.createIndex({ formId: 1, submittedAt: -1 })
```

## 3. API Endpoints Specification

### 3.1 Authentication Endpoints

#### POST /api/auth/register
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "businessName": "My Business"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "businessName": "My Business"
  }
}
```

#### POST /api/auth/login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "businessName": "My Business"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3.2 Form Management Endpoints (Protected)

#### GET /api/forms
**Headers:** `Authorization: Bearer <token>`
**Query Params:** 
- `page` (default: 1)
- `limit` (default: 10)
- `sort` (default: -createdAt)

**Response:**
```json
{
  "success": true,
  "data": {
    "forms": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalForms": 48,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### POST /api/forms
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our services",
  "questions": [
    {
      "text": "How satisfied are you with our service?",
      "type": "radio",
      "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"],
      "required": true
    },
    {
      "text": "Any additional comments?",
      "type": "text",
      "required": false
    }
  ]
}
```

#### GET /api/forms/:id
**Headers:** `Authorization: Bearer <token>`

#### GET /api/forms/:id/responses
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `page`, `limit`, `sort`
- `startDate`, `endDate` (ISO date strings)

#### GET /api/forms/:id/analytics
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "totalResponses": 150,
    "responseRate": "45%",
    "averageCompletionTime": "2m 30s",
    "questionAnalytics": [
      {
        "questionId": "...",
        "questionText": "How satisfied are you?",
        "type": "radio",
        "responses": {
          "Very Satisfied": 45,
          "Satisfied": 60,
          "Neutral": 30,
          "Dissatisfied": 15
        }
      }
    ]
  }
}
```

#### GET /api/forms/:id/export
**Headers:** `Authorization: Bearer <token>`
**Response:** CSV file download

### 3.3 Public Endpoints

#### GET /api/public/forms/:publicUrl
**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Customer Satisfaction Survey",
    "description": "Help us improve our services",
    "questions": [...]
  }
}
```

#### POST /api/public/forms/:publicUrl/submit
**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "...",
      "answer": "Very Satisfied"
    },
    {
      "questionId": "...",
      "answer": "Great service!"
    }
  ]
}
```

## 4. Security Implementation

### 4.1 Authentication Flow
1. User registers/logs in
2. Server generates JWT token with user payload
3. Token sent to client and stored in localStorage/httpOnly cookie
4. Client includes token in Authorization header for protected routes
5. Server validates token on each request

### 4.2 Middleware Stack
```javascript
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS configuration
app.use(express.json({ limit: '10mb' })); // Body parser with limit
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(rateLimiter); // Rate limiting
app.use(validateRequest); // Input validation
```

### 4.3 Error Handling
- Centralized error handling middleware
- Consistent error response format
- Proper HTTP status codes
- No sensitive information in error messages

## 5. Frontend Architecture

### 5.1 Component Structure
```
components/
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProtectedRoute.tsx
├── forms/
│   ├── FormBuilder.tsx
│   ├── QuestionEditor.tsx
│   ├── FormPreview.tsx
│   └── ShareModal.tsx
├── dashboard/
│   ├── FormsList.tsx
│   ├── ResponsesTable.tsx
│   ├── Analytics.tsx
│   └── ExportButton.tsx
├── public/
│   ├── PublicForm.tsx
│   ├── QuestionRenderer.tsx
│   └── SubmissionSuccess.tsx
└── common/
    ├── Header.tsx
    ├── Footer.tsx
    ├── Loading.tsx
    └── ErrorBoundary.tsx
```

### 5.2 State Management
- **Auth State**: Context API with useReducer
- **Form Data**: Local component state
- **API Calls**: Custom hooks with loading/error states
- **Caching**: React Query for response caching

### 5.3 Routing Structure
```javascript
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/forms/create" element={<ProtectedRoute><CreateForm /></ProtectedRoute>} />
  <Route path="/forms/:id" element={<ProtectedRoute><FormDetails /></ProtectedRoute>} />
  <Route path="/f/:publicUrl" element={<PublicForm />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## 6. Development Workflow

### 6.1 Git Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Emergency fixes

### 6.2 Commit Convention
```
type(scope): subject

body

footer
```
Types: feat, fix, docs, style, refactor, test, chore

### 6.3 Testing Strategy
- **Unit Tests**: Jest for utilities
- **Integration Tests**: Supertest for API
- **Component Tests**: React Testing Library
- **E2E Tests**: Cypress (optional)

## 7. Deployment Architecture

### 7.1 Environment Variables
```env
# Server
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=...
JWT_EXPIRE=7d

# Client
VITE_API_URL=http://localhost:5000/api
```

### 7.2 Build Process
1. Frontend: `npm run build` → static files
2. Backend: TypeScript compilation (if used)
3. Database: Migration scripts
4. Assets: Optimization and CDN upload

### 7.3 Hosting Options
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, Railway, or AWS EC2
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3 (future)