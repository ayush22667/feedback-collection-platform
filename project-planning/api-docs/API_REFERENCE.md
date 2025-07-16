# API Reference Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.feedbackplatform.com/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": object (only on failure)
}
```

## Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

## 1. Authentication Endpoints

### 1.1 Register New User
Creates a new admin account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "businessName": "Acme Corp"
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Min 6 characters, must contain uppercase, lowercase, and number
- Business Name: 2-100 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "businessName": "Acme Corp"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Email already registered",
  "error": {
    "code": "EMAIL_EXISTS",
    "field": "email"
  }
}
```

### 1.2 Login
Authenticates user and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "businessName": "Acme Corp"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```

### 1.3 Verify Token
Validates JWT token and returns user info.

**Endpoint:** `GET /api/auth/verify`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token valid",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "businessName": "Acme Corp"
    }
  }
}
```

---

## 2. Form Management Endpoints (Protected)

### 2.1 Create Form
Creates a new feedback form.

**Endpoint:** `POST /api/forms`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Customer Satisfaction Survey",
  "description": "We value your feedback",
  "questions": [
    {
      "text": "How would you rate our service?",
      "type": "radio",
      "options": ["Excellent", "Good", "Average", "Poor"],
      "required": true
    },
    {
      "text": "What did you like most?",
      "type": "checkbox",
      "options": ["Price", "Quality", "Service", "Delivery"],
      "required": false
    },
    {
      "text": "Additional comments",
      "type": "text",
      "required": false
    }
  ]
}
```

**Validation Rules:**
- Title: Required, 3-200 characters
- Questions: Min 3, Max 5
- Question text: Required, max 500 characters
- Options: Required for non-text types, 2-10 options

**Success Response (201):**
```json
{
  "success": true,
  "message": "Form created successfully",
  "data": {
    "formId": "507f1f77bcf86cd799439012",
    "title": "Customer Satisfaction Survey",
    "publicUrl": "x7k9m2p4",
    "shareLink": "http://localhost:3000/f/x7k9m2p4"
  }
}
```

### 2.2 List User's Forms
Get all forms created by the authenticated user.

**Endpoint:** `GET /api/forms`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `sort` (string): Sort field (default: -createdAt)
- `search` (string): Search in title/description

**Success Response (200):**
```json
{
  "success": true,
  "message": "Forms retrieved successfully",
  "data": {
    "forms": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Customer Satisfaction Survey",
        "description": "We value your feedback",
        "publicUrl": "x7k9m2p4",
        "responseCount": 42,
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2.3 Get Form Details
Get detailed information about a specific form.

**Endpoint:** `GET /api/forms/:id`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Customer Satisfaction Survey",
    "description": "We value your feedback",
    "questions": [...],
    "publicUrl": "x7k9m2p4",
    "shareLink": "http://localhost:3000/f/x7k9m2p4",
    "responseCount": 42,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2.4 Update Form (Optional)
Update form details or toggle active status.

**Endpoint:** `PUT /api/forms/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Survey Title",
  "isActive": false
}
```

### 2.5 Delete Form (Optional)
Soft delete a form and its responses.

**Endpoint:** `DELETE /api/forms/:id`

**Headers:** `Authorization: Bearer <token>`

---

## 3. Response Management Endpoints (Protected)

### 3.1 Get Form Responses
Retrieve all responses for a specific form.

**Endpoint:** `GET /api/forms/:id/responses`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `startDate` (ISO date): Filter by date range
- `endDate` (ISO date): Filter by date range

**Success Response (200):**
```json
{
  "success": true,
  "message": "Responses retrieved successfully",
  "data": {
    "responses": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "answers": [
          {
            "questionId": "507f1f77bcf86cd799439014",
            "questionText": "How would you rate our service?",
            "answer": "Excellent"
          }
        ],
        "submittedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

### 3.2 Get Response Analytics
Get aggregated analytics for form responses.

**Endpoint:** `GET /api/forms/:id/analytics`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "summary": {
      "totalResponses": 150,
      "completionRate": "92%",
      "averageCompletionTime": "2m 45s",
      "lastResponseAt": "2024-01-15T18:30:00Z"
    },
    "questionAnalytics": [
      {
        "questionId": "507f1f77bcf86cd799439014",
        "questionText": "How would you rate our service?",
        "type": "radio",
        "responses": {
          "Excellent": { "count": 75, "percentage": "50%" },
          "Good": { "count": 45, "percentage": "30%" },
          "Average": { "count": 20, "percentage": "13.3%" },
          "Poor": { "count": 10, "percentage": "6.7%" }
        }
      }
    ],
    "trends": {
      "daily": [...],
      "weekly": [...]
    }
  }
}
```

### 3.3 Export Responses
Export form responses as CSV file.

**Endpoint:** `GET /api/forms/:id/export`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `format` (string): Export format (csv, xlsx) - default: csv
- `startDate` (ISO date): Filter by date range
- `endDate` (ISO date): Filter by date range

**Success Response (200):**
- Content-Type: text/csv
- Content-Disposition: attachment; filename="responses-2024-01-15.csv"
- Body: CSV file data

---

## 4. Public Endpoints

### 4.1 Get Public Form
Retrieve form for public submission.

**Endpoint:** `GET /api/public/forms/:publicUrl`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form retrieved successfully",
  "data": {
    "title": "Customer Satisfaction Survey",
    "description": "We value your feedback",
    "questions": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "text": "How would you rate our service?",
        "type": "radio",
        "options": ["Excellent", "Good", "Average", "Poor"],
        "required": true
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Form not found or inactive",
  "error": {
    "code": "FORM_NOT_FOUND"
  }
}
```

### 4.2 Submit Form Response
Submit a response to a public form.

**Endpoint:** `POST /api/public/forms/:publicUrl/submit`

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439014",
      "answer": "Excellent"
    },
    {
      "questionId": "507f1f77bcf86cd799439015",
      "answer": ["Price", "Quality"]
    },
    {
      "questionId": "507f1f77bcf86cd799439016",
      "answer": "Great service, very satisfied!"
    }
  ]
}
```

**Validation:**
- All required questions must be answered
- Answer format must match question type
- Text answers: max 1000 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you for your feedback!",
  "data": {
    "responseId": "507f1f77bcf86cd799439017",
    "submittedAt": "2024-01-15T14:30:00Z"
  }
}
```

**Error Response (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "answers[0]",
        "message": "This question is required"
      }
    ]
  }
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| Public Form Submit | 10 requests | 1 hour per IP |
| Protected Endpoints | 100 requests | 15 minutes |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642255930
```

## Webhooks (Future Enhancement)

Webhooks can be configured to receive notifications:
- New response submitted
- Daily response summary
- Form deactivated

## SDKs and Examples

### JavaScript/TypeScript
```javascript
// Using Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Create form
const response = await api.post('/forms', {
  title: 'My Survey',
  questions: [...]
});
```

### cURL Examples
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Pass123!","businessName":"Acme"}'

# Create Form
curl -X POST http://localhost:5000/api/forms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Survey","questions":[...]}'
```