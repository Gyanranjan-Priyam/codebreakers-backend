# Deployment Guide

Complete guide for deploying the Codebreaker Mobile Backend to production.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Environment Configuration](#environment-configuration)
3. [MongoDB Setup](#mongodb-setup)
4. [Firebase Setup](#firebase-setup)
5. [VPS Deployment](#vps-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Heroku Deployment](#heroku-deployment)
8. [AWS Deployment](#aws-deployment)
9. [Monitoring & Logging](#monitoring--logging)
10. [SSL/HTTPS Setup](#sslhttps-setup)

---

## Deployment Options

| Platform | Difficulty | Cost | Best For |
|----------|------------|------|----------|
| VPS (DigitalOcean, Linode) | Medium | $5-20/mo | Full control, scalable |
| Docker | Medium | Varies | Containerized apps |
| Heroku | Easy | Free-$7/mo | Quick deployment |
| AWS EC2 | Hard | $10-50/mo | Enterprise, high traffic |
| Railway | Easy | Free-$5/mo | Modern PaaS |
| Render | Easy | Free-$7/mo | Modern PaaS |

---

## Environment Configuration

### Production `.env` Example

```env
# Environment
NODE_ENV=production
PORT=5000

# Dashboard API
DASHBOARD_API_URL=https://www.codebreakersgcek.tech/api/external/data
DASHBOARD_API_KEY=m5r1pX8cQ0dJ7R2G9Kf4uT6nS0EwYqHcVbZL8M1AQe7=

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=c0mpl3x_r4nd0m_s3cr3t_k3y_2024_pr0duct10n
JWT_REFRESH_SECRET=r3fr3sh_t0k3n_s3cr3t_2024_pr0duct10n

# MongoDB (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codebreaker-app?retryWrites=true&w=majority

# CORS
CORS_ORIGIN=https://yourmobileapp.com,https://yourwebapp.com

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'

# Logging
LOG_LEVEL=info

# Cache
CACHE_ENABLED=true

# Push Notifications
ENABLE_PUSH_NOTIFICATIONS=true
```

### Security Checklist

- [ ] Change all default secrets
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Configure specific CORS origins (not `*`)
- [ ] Enable HTTPS/SSL
- [ ] Use environment variables (never commit `.env`)
- [ ] Enable rate limiting
- [ ] Keep dependencies updated

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**:
   - Choose FREE tier (M0)
   - Select region closest to your server
   - Click "Create Cluster"

3. **Database Access**:
   - Create database user
   - Set username and strong password
   - Grant "Read and Write" access

4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or specific server IP for better security

5. **Get Connection String**:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/codebreaker-app
   ```

6. **Update `.env`**:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codebreaker-app
   ```

### Option 2: Self-hosted MongoDB

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Secure MongoDB
mongo
> use admin
> db.createUser({user:"admin",pwd:"strongpassword",roles:["root"]})
> exit

# Update mongod.conf
sudo nano /etc/mongod.conf
# Enable auth and bind to 0.0.0.0

# Restart
sudo systemctl restart mongod
```

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name
4. Disable Google Analytics (optional)
5. Create project

### 2. Enable Cloud Messaging

1. Go to Project Settings → Cloud Messaging
2. Click "Enable Cloud Messaging API"

### 3. Generate Service Account Key

1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Convert to single-line JSON:

```bash
# Linux/macOS
cat serviceAccountKey.json | jq -c . | pbcopy

# Or manually copy content
```

5. Add to `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

---

## VPS Deployment (Ubuntu 22.04)

### Step 1: Provision Server

- DigitalOcean: [digitalocean.com](https://www.digitalocean.com) ($5/mo droplet)
- Linode: [linode.com](https://www.linode.com) ($5/mo)
- Vultr: [vultr.com](https://www.vultr.com) ($5/mo)

### Step 2: Initial Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Create new user
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Step 3: Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 4: Clone Repository

```bash
# Install git
sudo apt install -y git

# Clone your repo
git clone https://github.com/yourusername/codebreaker-dashboard.git
cd codebreaker-dashboard/app-backend
```

### Step 5: Install Dependencies

```bash
npm install --production
```

### Step 6: Configure Environment

```bash
# Create .env file
nano .env

# Paste your production environment variables
# Save: Ctrl+O, Enter, Ctrl+X
```

### Step 7: Install PM2

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start src/index.js --name codebreaker-backend

# Setup auto-start
pm2 startup systemd
# Run the command it outputs

pm2 save

# Check status
pm2 status
pm2 logs codebreaker-backend
```

### Step 8: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/codebreaker-backend

# Paste this configuration:
```

```nginx
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/codebreaker-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 9: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal (test)
sudo certbot renew --dry-run
```

### Step 10: Setup Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: codebreaker-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      DASHBOARD_API_URL: ${DASHBOARD_API_URL}
      DASHBOARD_API_KEY: ${DASHBOARD_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      MONGODB_URI: mongodb://mongo:27017/codebreaker-app
    depends_on:
      - mongo
    volumes:
      - ./logs:/app/logs
    networks:
      - codebreaker-network

  mongo:
    image: mongo:6
    container_name: codebreaker-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: strongpassword
      MONGO_INITDB_DATABASE: codebreaker-app
    volumes:
      - mongo-data:/data/db
    networks:
      - codebreaker-network

networks:
  codebreaker-network:
    driver: bridge

volumes:
  mongo-data:
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Restart
docker-compose restart app
```

---

## Heroku Deployment

### Prerequisites

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login
```

### Deploy Steps

```bash
cd app-backend

# Create Procfile
echo "web: node src/index.js" > Procfile

# Create .slugignore (optional)
echo "logs/" > .slugignore

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DASHBOARD_API_URL=https://www.codebreakersgcek.tech/api/external/data
heroku config:set DASHBOARD_API_KEY=your-api-key
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set CORS_ORIGIN=*

# Deploy
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Monitor
pm2 monit

# View logs
pm2 logs codebreaker-backend

# Restart
pm2 restart codebreaker-backend

# Delete
pm2 delete codebreaker-backend
```

### Log Rotation

```bash
# Install pm2-logrotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Application Logs

Logs are stored in `logs/` directory:
- `error.log` - Error logs
- `combined.log` - All logs

---

## Performance Optimization

### Enable Production Mode

```env
NODE_ENV=production
```

### Use Redis for Caching

```bash
# Install Redis
sudo apt install redis-server

# Update code to use Redis instead of NodeCache
# See src/services/cache.js
```

### Enable Compression

Already enabled in the application.

### Database Indexing

```javascript
// Add indexes to MongoDB models
// See src/models/*.js
```

---

## Backup & Recovery

### MongoDB Backup

```bash
# Backup
mongodump --uri="your-mongodb-uri" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your-mongodb-uri" /backup/20240115
```

### Automated Backups

```bash
# Create backup script
cat > /home/deploy/backup-mongodb.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your-mongodb-uri" --out=/backup/mongo_$DATE
find /backup -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /home/deploy/backup-mongodb.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/deploy/backup-mongodb.sh
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs codebreaker-backend --lines 100

# Check environment variables
pm2 env 0

# Restart
pm2 restart codebreaker-backend
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Limit memory (restart if exceeds 500MB)
pm2 start src/index.js --name codebreaker-backend --max-memory-restart 500M
```

### MongoDB Connection Issues

```bash
# Test connection
mongosh "your-mongodb-uri"

# Check network access in MongoDB Atlas
```

---

## Security Best Practices

- ✅ Use HTTPS/SSL everywhere
- ✅ Keep secrets in environment variables
- ✅ Enable rate limiting
- ✅ Use strong passwords
- ✅ Regular security updates
- ✅ Monitor logs for suspicious activity
- ✅ Backup regularly
- ✅ Use firewall (UFW)
- ✅ Disable root SSH login
- ✅ Use SSH keys instead of passwords

---

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Test MongoDB connection
- Verify API keys
- Check firewall settings

---

**🚀 Your backend is now production-ready!**
