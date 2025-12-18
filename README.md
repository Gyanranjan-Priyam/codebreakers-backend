# Codebreaker Mobile/External App Backend

A comprehensive backend server for mobile and external applications that integrates with the Codebreaker Dashboard platform.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🚀 **RESTful API** - Complete REST API for all dashboard resources
- 💾 **Data Caching** - In-memory caching for improved performance
- 🔄 **Real-time Updates** - Socket.IO for live data synchronization
- 📱 **Push Notifications** - Firebase Cloud Messaging integration
- 📊 **Analytics** - User statistics and leaderboards
- 🌐 **Offline Support** - Data synchronization for offline-first apps
- 🛡️ **Security** - Rate limiting, CORS, helmet security headers
- 📝 **Logging** - Winston logger with file rotation
- 🗄️ **Database** - MongoDB for app-specific data storage

## Tech Stack

- **Node.js** (v18+)
- **Express.js** - Web framework
- **MongoDB** - Database for app-specific data
- **Socket.IO** - Real-time communication
- **Firebase Admin** - Push notifications
- **JWT** - Authentication
- **NodeCache** - In-memory caching
- **Winston** - Logging
- **Express Validator** - Request validation
- **Helmet** - Security headers
- **Compression** - Response compression

## Prerequisites

- Node.js v18 or higher
- MongoDB instance (local or cloud)
- Firebase project (for push notifications)
- Access to Codebreaker Dashboard API

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd app-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Dashboard API
   DASHBOARD_API_URL=https://www.codebreakersgcek.tech/api/external/data
   DASHBOARD_API_KEY=m5r1pX8cQ0dJ7R2G9Kf4uT6nS0EwYqHcVbZL8M1AQe7=
   
   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/codebreaker-app
   
   # CORS
   CORS_ORIGIN=*
   
   # Firebase (Optional - for push notifications)
   # FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
   # FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   
   # Logging
   LOG_LEVEL=info
   ```

4. **Create logs directory:**
   ```bash
   mkdir logs
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user123",
      "email": "user@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Register Device
```http
POST /api/auth/device/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceId": "device-unique-id",
  "platform": "android",
  "fcmToken": "firebase-fcm-token",
  "deviceInfo": {
    "model": "Pixel 6",
    "manufacturer": "Google",
    "osVersion": "13",
    "appVersion": "1.0.0"
  }
}
```

### Users

#### Get All Users
```http
GET /api/users?limit=50&offset=0
Authorization: Bearer <access_token>
```

#### Search Users
```http
GET /api/users/search?q=john
Authorization: Bearer <access_token>
```

#### Get User by ID
```http
GET /api/users/:userId
Authorization: Bearer <access_token>
```

#### Get User Statistics
```http
GET /api/users/:userId/stats
Authorization: Bearer <access_token>
```

#### Get User Activity
```http
GET /api/users/:userId/activity
Authorization: Bearer <access_token>
```

### Quizzes

#### Get All Quizzes
```http
GET /api/quizzes?limit=50&offset=0
Authorization: Bearer <access_token>
```

#### Get Active Quizzes
```http
GET /api/quizzes/active
Authorization: Bearer <access_token>
```

#### Get Quiz by ID
```http
GET /api/quizzes/:id
Authorization: Bearer <access_token>
```

#### Get Quiz Results
```http
GET /api/quizzes/:id/results
Authorization: Bearer <access_token>
```

#### Get Quiz Leaderboard
```http
GET /api/quizzes/:id/leaderboard
Authorization: Bearer <access_token>
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks?limit=50&offset=0
Authorization: Bearer <access_token>
```

#### Get Active Tasks
```http
GET /api/tasks/active
Authorization: Bearer <access_token>
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <access_token>
```

#### Get Task Submissions
```http
GET /api/tasks/:id/submissions
Authorization: Bearer <access_token>
```

#### Get User Task Submissions
```http
GET /api/tasks/user/:userId/submissions
Authorization: Bearer <access_token>
```

### Events

#### Get All Events
```http
GET /api/events?limit=50&offset=0
Authorization: Bearer <access_token>
```

#### Get Upcoming Events
```http
GET /api/events/upcoming
Authorization: Bearer <access_token>
```

#### Get Event by ID
```http
GET /api/events/:id
Authorization: Bearer <access_token>
```

#### Get Event Participants
```http
GET /api/events/:id/participants
Authorization: Bearer <access_token>
```

#### Get User Event Participations
```http
GET /api/events/user/:userId/participations
Authorization: Bearer <access_token>
```

### Announcements

#### Get All Announcements
```http
GET /api/announcements?limit=50&offset=0
Authorization: Bearer <access_token>
```

#### Get Recent Announcements
```http
GET /api/announcements/recent
Authorization: Bearer <access_token>
```

#### Get Pinned Announcements
```http
GET /api/announcements/pinned
Authorization: Bearer <access_token>
```

#### Get Announcement by ID
```http
GET /api/announcements/:id
Authorization: Bearer <access_token>
```

### Projects

#### Get All Projects
```http
GET /api/projects?limit=50&offset=0
Authorization: Bearer <access_token>
```

#### Get Featured Projects
```http
GET /api/projects/featured
Authorization: Bearer <access_token>
```

#### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <access_token>
```

#### Get User Projects
```http
GET /api/projects/user/:userId
Authorization: Bearer <access_token>
```

### Analytics

#### Get Leaderboard
```http
GET /api/analytics/leaderboard?limit=50
Authorization: Bearer <access_token>
```

#### Get Global Statistics
```http
GET /api/analytics/stats/global
Authorization: Bearer <access_token>
```

#### Get User Statistics
```http
GET /api/analytics/stats/user/:userId
Authorization: Bearer <access_token>
```

### Sync

#### Full Sync
```http
GET /api/sync/full
Authorization: Bearer <access_token>
```

Returns all data needed for offline operation.

#### Incremental Sync
```http
GET /api/sync/incremental?lastSync=2024-01-01T00:00:00Z
Authorization: Bearer <access_token>
```

#### Upload Sync Data
```http
POST /api/sync/upload
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "syncData": { ... }
}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?limit=50&offset=0
Authorization: Bearer <access_token>
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <access_token>
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <access_token>
```

#### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <access_token>
```

### Support

#### Get Tickets
```http
GET /api/support/tickets?status=open
Authorization: Bearer <access_token>
```

#### Get Ticket by ID
```http
GET /api/support/tickets/:id
Authorization: Bearer <access_token>
```

#### Create Ticket
```http
POST /api/support/tickets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "subject": "Issue with quiz submission",
  "message": "I'm unable to submit my quiz...",
  "priority": "medium"
}
```

## WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Available Events

- `new_announcement` - New announcement published
- `new_quiz` - New quiz available
- `new_task` - New task available
- `new_event` - New event created
- `quiz_result` - Quiz result available
- `task_graded` - Task has been graded
- `leaderboard_update` - Leaderboard updated
- `notification` - New notification

## Project Structure

```
app-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── analyticsController.js
│   │   └── index.js (all other controllers)
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── errorHandler.js
│   │   ├── validateRequest.js
│   │   └── notFound.js
│   ├── models/
│   │   ├── AppUser.js
│   │   ├── Device.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── quizzes.js
│   │   ├── tasks.js
│   │   ├── events.js
│   │   ├── announcements.js
│   │   ├── projects.js
│   │   ├── support.js
│   │   ├── notifications.js
│   │   ├── sync.js
│   │   └── analytics.js
│   ├── services/
│   │   ├── dashboardAPI.js
│   │   ├── cache.js
│   │   ├── database.js
│   │   ├── socket.js
│   │   └── firebase.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   └── index.js
├── logs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Error Handling

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [...]
}
```

## Rate Limiting

- **General API:** 100 requests per 15 minutes
- **Auth endpoints:** 5 requests per 15 minutes
- **Upload endpoints:** 20 requests per hour
- **Sync endpoints:** 2 requests per 5 minutes

## Security

- JWT tokens with short expiry (24 hours for access, 7 days for refresh)
- Helmet for security headers
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention (via Mongoose)
- XSS protection

## Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

Log levels: `error`, `warn`, `info`, `http`, `debug`

## Testing

```bash
# Run tests (if available)
npm test

# Test API endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start src/index.js --name codebreaker-backend
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `DASHBOARD_API_URL` | Dashboard API endpoint | Required |
| `DASHBOARD_API_KEY` | Dashboard API key | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `MONGODB_URI` | MongoDB connection string | Required |
| `CORS_ORIGIN` | CORS allowed origins | * |
| `LOG_LEVEL` | Logging level | info |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Firebase credentials path | Optional |

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Firebase Push Notifications Not Working
- Verify Firebase credentials are correct
- Check FCM token is valid
- Ensure device is registered

### High Memory Usage
- Reduce cache TTL in `src/services/cache.js`
- Implement Redis for caching instead of NodeCache

## Support

For issues or questions:
- Create an issue in the repository
- Contact: support@codebreakersgcek.tech

## License

MIT License - See LICENSE file for details

---

Built with ❤️ for the Codebreakers community
