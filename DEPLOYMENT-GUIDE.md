# ComputeLab Platform - Render Deployment Guide

## Quick Start (3 Options)

### Option 1: One-Click Deployment (Recommended)

1. **Fork or Clone Repository:**
   - Upload all files to a GitHub repository

2. **Deploy on Render:**
   - Go to https://render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and deploy
   - Your app will be live at `https://your-app-name.onrender.com`

### Option 2: Static Site (No Backend API)

Perfect for demo/presentation purposes:

1. **Create Static Site:**
   - Go to Render Dashboard
   - Click "New" → "Static Site"
   - Upload `computational-platform.html` or connect GitHub

2. **Configure:**
   ```
   Name: computelab-platform
   Build Command: (leave empty)
   Publish Directory: .
   ```

3. **Rename File:**
   - Rename `computational-platform.html` to `index.html`
   - Or set custom routes in Render settings

4. **Deploy:**
   - Click "Create Static Site"
   - Done! Access at your Render URL

### Option 3: Web Service with API (Full Backend)

For production use with real API:

1. **Create Web Service:**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repo

2. **Configure Settings:**
   ```
   Name: computelab-platform
   Environment: Node
   Region: Oregon (US West) or closest to you
   Branch: main
   Build Command: npm install
   Start Command: npm start
   Plan: Starter (Free) or higher
   ```

3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes for build
   - Access at `https://computelab-platform-xxxx.onrender.com`

## Detailed Configuration

### File Structure

```
computelab-platform/
├── computational-platform.html   # Main frontend application
├── server.js                     # Express backend server
├── package.json                  # Node.js dependencies
├── render.yaml                   # Render deployment config
└── README.md                     # Documentation
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Environment mode |
| `PORT` | No | 3000 | Server port (Render uses 10000) |

### Health Check

The server includes a health check endpoint:
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "version": "0.1.2",
  "timestamp": "2025-10-27T14:32:15Z"
}
```

## API Endpoints (Web Service Deployment)

### Base URL
```
https://your-app-name.onrender.com/api/v1
```

### Available Endpoints

#### 1. Submit Job
```http
POST /api/v1/jobs/submit
Content-Type: application/json

{
  "toolkit": "molecular_dynamics",
  "config": {
    "forcefield": "amber_ff14sb",
    "simulation_time": 100,
    "temperature": 300
  },
  "input_files": [],
  "priority": 5
}
```

#### 2. Get Job Status
```http
GET /api/v1/jobs/{jobId}
```

#### 3. List Jobs
```http
GET /api/v1/jobs/list?status=running&limit=50
```

#### 4. Cancel Job
```http
DELETE /api/v1/jobs/{jobId}
```

#### 5. System Stats
```http
GET /api/v1/stats
```

Response:
```json
{
  "total_jobs": 2847,
  "completed": 2801,
  "running": 12,
  "queued": 34,
  "success_rate": "98.7",
  "uptime": 86400
}
```

## Custom Domain Setup

1. **Purchase Domain:**
   - Buy from Namecheap, GoDaddy, etc.

2. **Configure in Render:**
   - Go to your service settings
   - Click "Custom Domain"
   - Add your domain (e.g., `app.yourdomain.com`)

3. **Update DNS:**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: app
     Value: your-app-name.onrender.com
     ```

4. **SSL Certificate:**
   - Render automatically provisions Let's Encrypt SSL
   - HTTPS will be enabled within minutes

## Performance Optimization

### 1. Caching
Add to `server.js`:
```javascript
app.use(express.static(__dirname, {
  maxAge: '1d',
  etag: true
}));
```

### 2. Compression
Install and use compression:
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring & Logs

### View Logs in Render
1. Go to your service dashboard
2. Click "Logs" tab
3. Real-time logs appear here

### Health Monitoring
Render automatically monitors your service using the health check endpoint.

If health check fails 3 times, Render will restart your service.

### Metrics Dashboard
- Request count
- Response times
- Error rates
- Memory usage
- CPU usage

Access in Render Dashboard → Metrics

## Troubleshooting

### Issue: Build Fails

**Solution:**
1. Check `package.json` is in root directory
2. Verify Node version: `"engines": { "node": ">=14.0.0" }`
3. Check build logs for specific errors

### Issue: Service Won't Start

**Solution:**
1. Verify `start` script in `package.json`: `"start": "node server.js"`
2. Check PORT environment variable
3. Ensure health check endpoint is accessible

### Issue: 502 Bad Gateway

**Solution:**
1. Check server is listening on `process.env.PORT`
2. Verify health check responds with 200 status
3. Check server logs for errors

### Issue: Slow Performance

**Solution:**
1. Upgrade from free tier to Starter ($7/month)
2. Enable compression middleware
3. Implement caching
4. Optimize database queries (if using database)

### Issue: API Not Working

**Solution:**
1. Check CORS configuration
2. Verify API routes in `server.js`
3. Test endpoints with Postman/curl
4. Check request/response logs

## Scaling

### Horizontal Scaling
Render supports scaling your service:
1. Go to service settings
2. Increase "Instance Count"
3. Requests are load-balanced automatically

### Database Integration
For production, integrate a database:

**PostgreSQL:**
```bash
# In Render, create PostgreSQL database
# Add DATABASE_URL to environment variables
```

**MongoDB:**
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

## Security Best Practices

### 1. API Key Authentication
Add to `server.js`:
```javascript
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/api/', authenticateAPI);
```

### 2. Input Validation
```bash
npm install express-validator
```

### 3. Helmet Security Headers
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Environment Variables
Never commit sensitive data. Use Render environment variables:
- API_KEY
- DATABASE_URL
- SECRET_KEY

## Cost Estimates

### Free Tier
- Static Sites: Unlimited
- Web Services: 750 hours/month
- Auto-sleep after 15 min inactivity
- 512 MB RAM

### Starter Tier ($7/month)
- No auto-sleep
- Always online
- 512 MB RAM
- Better performance

### Standard Tier ($25/month)
- 2 GB RAM
- Better CPU
- Priority support

## Continuous Deployment

Render automatically redeploys when you push to GitHub:

1. **Push Changes:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Automatic Deploy:**
   - Render detects changes
   - Builds automatically
   - Deploys if build succeeds
   - Zero downtime deployment

## Testing Locally

Before deploying:

```bash
# Install dependencies
npm install

# Start server
npm start

# Or with nodemon for development
npm run dev
```

Access at `http://localhost:3000`

## Support & Resources

- **Render Documentation:** https://render.com/docs
- **Node.js Express Guide:** https://expressjs.com/
- **API Testing:** Use Postman or cURL
- **Community:** Render Community Forum

## Next Steps

After deployment:

1. ✅ Test all API endpoints
2. ✅ Configure custom domain
3. ✅ Set up monitoring/alerts
4. ✅ Enable HTTPS (automatic)
5. ✅ Optimize performance
6. ✅ Add database (if needed)
7. ✅ Implement authentication
8. ✅ Set up CI/CD pipeline
9. ✅ Add error tracking (Sentry, etc.)
10. ✅ Document API for users

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Backup Strategy
- Database: Daily automated backups in Render
- Code: Version control with Git
- Configuration: Document environment variables

## Production Checklist

- [ ] Environment variables configured
- [ ] Health check working
- [ ] HTTPS enabled
- [ ] Custom domain configured
- [ ] Error tracking set up
- [ ] Monitoring enabled
- [ ] Rate limiting implemented
- [ ] Security headers added
- [ ] Input validation working
- [ ] API authentication enabled
- [ ] Database backups configured
- [ ] CI/CD pipeline active
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Alerts set up

---

**Ready to Deploy?** 🚀

Choose your deployment method and follow the steps above. Your ComputeLab platform will be live in minutes!

For questions or issues, check the troubleshooting section or contact support.