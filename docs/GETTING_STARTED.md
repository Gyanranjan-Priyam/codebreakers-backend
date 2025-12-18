# 🚀 Getting Started with Codebreaker Mobile Backend

**Welcome!** This guide will help you get the backend up and running in minutes.

## 📋 What You're Building

A complete backend server that provides:
- ✅ User authentication (JWT tokens)
- ✅ All Codebreaker data (users, quizzes, tasks, events, etc.)
- ✅ Real-time updates (WebSocket)
- ✅ Push notifications (Firebase)
- ✅ Data caching for performance
- ✅ Offline sync support

## 🎯 Prerequisites

What you need before starting:

### Required
- [ ] **Node.js 18+** - [Download here](https://nodejs.org/)
- [ ] **MongoDB** - [Atlas (free cloud)](https://www.mongodb.com/cloud/atlas) OR [Local install](https://www.mongodb.com/try/download/community)
- [ ] **Dashboard API Access**:
  - URL: `https://www.codebreakersgcek.tech/api/external/data`
  - API Key: `m5r1pX8cQ0dJ7R2G9Kf4uT6nS0EwYqHcVbZL8M1AQe7=`

### Optional (for push notifications)
- [ ] **Firebase Project** - [Create here](https://console.firebase.google.com)

## 📦 Installation

### Step 1: Navigate to Directory
```bash
cd app-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- Express.js (web server)
- MongoDB/Mongoose (database)
- Socket.IO (real-time)
- JWT (authentication)
- Firebase Admin (push notifications)
- Winston (logging)
- And more...

**Expected time**: 1-2 minutes

### Step 3: Setup Environment
```bash
# Copy the example file
cp .env.example .env

# Edit the file
nano .env   # Linux/macOS
notepad .env   # Windows
```

**Minimum required configuration**:
```env
# Dashboard Integration
DASHBOARD_API_URL=https://www.codebreakersgcek.tech/api/external/data
DASHBOARD_API_KEY=m5r1pX8cQ0dJ7R2G9Kf4uT6nS0EwYqHcVbZL8M1AQe7=

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# MongoDB
MONGODB_URI=mongodb://localhost:27017/codebreaker-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codebreaker-app
```

**Generate strong secrets** (optional but recommended):
```bash
# Linux/macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js (any platform)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 4: Create Logs Directory
```bash
mkdir logs
```

## 🎬 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

You'll see:
```
🚀 Codebreaker App Backend running on port 5000
📊 Environment: development
🔗 Dashboard API: https://www.codebreakersgcek.tech/api/external/data
MongoDB connected successfully
Socket.IO initialized for real-time updates
```

### Production Mode
```bash
npm start
```

## ✅ Verify Installation

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

**Expected response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.234,
  "environment": "development",
  "database": "connected"
}
```

### Test 2: API Root
```bash
curl http://localhost:5000
```

**Expected response**: List of available endpoints

### Test 3: Login (if you have user credentials)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

**Expected response**:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

## 📱 First API Call

### 1. Get All Users
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Get Active Quizzes
```bash
curl http://localhost:5000/api/quizzes/active \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Leaderboard
```bash
curl http://localhost:5000/api/analytics/leaderboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🐛 Troubleshooting

### Problem: `npm install` fails
**Solution**: Make sure you have Node.js 18+ installed
```bash
node --version   # Should be v18.0.0 or higher
```

### Problem: MongoDB connection error
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions**:
1. **Local MongoDB**: Start MongoDB service
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **MongoDB Atlas**: Use cloud connection string
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codebreaker-app
   ```

### Problem: Port 5000 already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions**:
1. Change port in `.env`:
   ```env
   PORT=5001
   ```

2. OR kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill
   ```

### Problem: Dashboard API returns 401
**Solution**: Check your API key in `.env` matches exactly:
```env
DASHBOARD_API_KEY=m5r1pX8cQ0dJ7R2G9Kf4uT6nS0EwYqHcVbZL8M1AQe7=
```

## 📚 Next Steps

### 1. Explore the API
Open [README.md](README.md) for complete API documentation with all endpoints.

### 2. Setup Push Notifications (Optional)
Follow [Firebase Setup in DEPLOYMENT.md](DEPLOYMENT.md#firebase-setup)

### 3. Test WebSocket Connection
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_ACCESS_TOKEN' }
});

socket.on('connect', () => console.log('Connected!'));
```

### 4. Deploy to Production
See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides:
- VPS (DigitalOcean, Linode)
- Docker
- Heroku
- AWS

### 5. Integrate with Your App
Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md#-integration-guide) for integration examples.

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Complete API documentation |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup guide |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Project overview |
| [FILE_STRUCTURE.md](FILE_STRUCTURE.md) | File organization |

## 🎓 Learning Resources

### Understanding the Stack
- **Express.js**: [expressjs.com](https://expressjs.com)
- **MongoDB/Mongoose**: [mongoosejs.com](https://mongoosejs.com)
- **Socket.IO**: [socket.io](https://socket.io)
- **JWT**: [jwt.io](https://jwt.io)

### API Testing Tools
- **Postman**: [postman.com](https://www.postman.com)
- **Insomnia**: [insomnia.rest](https://insomnia.rest)
- **curl**: Built-in command line tool

## 🔧 Development Tips

### Auto-reload on Changes
The `npm run dev` command uses nodemon to automatically restart when you edit files.

### View Logs
```bash
# Live logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Windows
Get-Content logs\combined.log -Wait
```

### Clear Cache
If you experience caching issues:
```bash
curl -X DELETE http://localhost:5000/api/cache/clear \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Database GUI
Use MongoDB Compass to visualize your database:
[Download MongoDB Compass](https://www.mongodb.com/products/compass)

## 🆘 Getting Help

### Check Logs First
```bash
cat logs/error.log   # See recent errors
```

### Common Issues
1. **401 Unauthorized**: Check API key
2. **404 Not Found**: Check endpoint URL
3. **500 Server Error**: Check logs for details
4. **Rate Limited**: Wait or adjust rate limits in code

### Support Channels
- **Documentation**: Read the docs in this folder
- **GitHub Issues**: Create an issue with:
  - Error message
  - Steps to reproduce
  - Environment details (OS, Node version)
  - Relevant log excerpts

## ✨ Success!

If you see this output:
```
🚀 Codebreaker App Backend running on port 5000
📊 Environment: development
MongoDB connected successfully
Socket.IO initialized
```

**Congratulations! 🎉** Your backend is running and ready to:
- Authenticate users
- Serve Codebreaker data
- Send real-time updates
- Handle mobile app requests
- Cache responses for performance
- Support offline sync

## 🗺️ Project Structure

```
app-backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, validation, etc.
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── services/       # External integrations
│   ├── utils/          # Helper functions
│   └── index.js        # App entry point
├── logs/               # Application logs
├── .env               # Your configuration
└── package.json       # Dependencies
```

## 🎯 Quick Command Reference

```bash
# Install
npm install

# Run (development)
npm run dev

# Run (production)
npm start

# View logs
tail -f logs/combined.log

# Test health
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

---

**🚀 Ready to build amazing mobile apps!**

Start by exploring the API endpoints in [README.md](README.md) and integrate with your mobile application.

Happy coding! 💻
