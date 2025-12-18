# Quick Start Guide

Get the Codebreaker Mobile/External App Backend running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js v18 or higher installed
- [ ] MongoDB running (local or MongoDB Atlas)
- [ ] Dashboard API URL and API Key
- [ ] (Optional) Firebase project for push notifications

## Step 1: Install Dependencies

```bash
cd app-backend
npm install
```

## Step 2: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and configure these **required** variables:

```env
# Required Configuration
DASHBOARD_API_URL=https://www.codebreakersgcek.tech/api/external/data
DASHBOARD_API_KEY=m5r1pX8cQ0dJ7R2G9Kf4uT6nS0EwYqHcVbZL8M1AQe7=
JWT_SECRET=your-super-secret-key-please-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-please-change-this
MONGODB_URI=mongodb://localhost:27017/codebreaker-app
```

## Step 3: Create Logs Directory

```bash
mkdir logs
```

## Step 4: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Step 5: Verify Installation

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.234,
  "environment": "development"
}
```

## Step 6: Test Authentication

Try logging in (use actual credentials from your dashboard):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Common Issues & Solutions

### Issue: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Or use MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codebreaker-app
```

### Issue: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Change the port in `.env`:
```env
PORT=5001
```

Or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: Dashboard API Key Invalid
```
{"success": false, "message": "Unauthorized"}
```

**Solution:** Verify your API key in `.env` matches the one configured in your dashboard.

## Optional: Enable Push Notifications

1. Get Firebase service account credentials
2. Add to `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
# OR
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## Optional: Production Deployment with PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/index.js --name codebreaker-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Testing the API

### 1. Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Save the `accessToken` from the response.

### 2. Get Users
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Quizzes
```bash
curl -X GET http://localhost:5000/api/quizzes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Full Sync (for offline support)
```bash
curl -X GET http://localhost:5000/api/sync/full \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## WebSocket Connection Test

```javascript
// In your browser console or Node.js
const io = require('socket.io-client');

const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('new_announcement', (data) => {
  console.log('New announcement:', data);
});
```

## Next Steps

1. ✅ Server is running
2. 📱 Integrate with your mobile app
3. 🔔 Setup push notifications (optional)
4. 📊 Monitor logs in `logs/` directory
5. 🚀 Deploy to production

## Project Structure

```
app-backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # External services
│   ├── utils/           # Helper functions
│   └── index.js         # Entry point
├── logs/                # Application logs
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Environment mode |
| `PORT` | No | 5000 | Server port |
| `DASHBOARD_API_URL` | **Yes** | - | Dashboard API endpoint |
| `DASHBOARD_API_KEY` | **Yes** | - | Dashboard API key |
| `JWT_SECRET` | **Yes** | - | JWT signing secret |
| `JWT_REFRESH_SECRET` | **Yes** | - | Refresh token secret |
| `MONGODB_URI` | **Yes** | - | MongoDB connection string |
| `CORS_ORIGIN` | No | * | Allowed CORS origins |
| `LOG_LEVEL` | No | info | Logging level |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | No | - | Firebase credentials path |

## Support

Need help? Check:
- [Full README](README.md) - Complete documentation
- [API Documentation](README.md#api-documentation) - All endpoints
- Create an issue in the repository

---

**🎉 Congratulations!** Your backend is now running and ready to power your mobile/external applications!
