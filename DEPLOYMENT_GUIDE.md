# Deployment Guide

## Creating and Pushing to a New Repository

### Option 1: GitHub (Recommended)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `feedback-collection-platform`
   - Description: `A full-stack MERN application for collecting customer feedback through customizable forms`
   - Choose Public or Private
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code:**
   ```bash
   # Add GitHub as remote origin
   git remote add origin https://github.com/YOUR_USERNAME/feedback-collection-platform.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Option 2: GitLab

1. **Create a new project on GitLab:**
   - Go to https://gitlab.com/projects/new
   - Project name: `feedback-collection-platform`
   - Choose visibility level
   - Don't initialize with README
   - Click "Create project"

2. **Push your code:**
   ```bash
   # Add GitLab as remote origin
   git remote add origin https://gitlab.com/YOUR_USERNAME/feedback-collection-platform.git
   
   # Push to GitLab
   git branch -M main
   git push -u origin main
   ```

### Option 3: Bitbucket

1. **Create a new repository on Bitbucket:**
   - Go to https://bitbucket.org/repo/create
   - Repository name: `feedback-collection-platform`
   - Choose access level
   - Click "Create repository"

2. **Push your code:**
   ```bash
   # Add Bitbucket as remote origin
   git remote add origin https://YOUR_USERNAME@bitbucket.org/YOUR_USERNAME/feedback-collection-platform.git
   
   # Push to Bitbucket
   git branch -M main
   git push -u origin main
   ```

## Production Deployment

### Frontend Deployment (Vercel - Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy frontend:**
   ```bash
   cd client
   vercel
   # Follow the prompts
   ```

3. **Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `VITE_API_URL` with your backend URL

### Backend Deployment (Railway - Recommended)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy backend:**
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```

3. **Environment Variables in Railway:**
   - Go to your Railway dashboard
   - Select your project
   - Go to Variables tab
   - Add all variables from .env.example

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account:**
   - Go to https://www.mongodb.com/atlas
   - Create a free cluster

2. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update environment variables:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feedback-platform
   ```

## Alternative Deployment Options

### Heroku (Backend)

1. **Install Heroku CLI and login:**
   ```bash
   heroku login
   ```

2. **Create and deploy:**
   ```bash
   cd server
   heroku create your-app-name
   git subtree push --prefix server heroku main
   ```

### Netlify (Frontend)

1. **Build the project:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to https://netlify.com
   - Drag and drop the `dist` folder
   - Or connect your GitHub repository

### DigitalOcean App Platform

1. **Create new app:**
   - Go to DigitalOcean Apps
   - Connect your repository
   - Configure build settings

## Environment Configuration

### Production Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secure-production-secret
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Security Checklist for Production

- [ ] Update JWT_SECRET to a strong, unique value
- [ ] Set NODE_ENV=production
- [ ] Configure CORS with specific domain
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Update default passwords
- [ ] Enable firewall rules

## Post-Deployment Testing

1. **Test authentication:**
   - Register a new account
   - Login and logout
   - Access protected routes

2. **Test form functionality:**
   - Create a new form
   - Share public URL
   - Submit responses
   - View analytics

3. **Test data export:**
   - Export responses as CSV
   - Verify data integrity

## Monitoring and Maintenance

### Recommended Tools

- **Uptime monitoring:** UptimeRobot, Pingdom
- **Error tracking:** Sentry
- **Performance monitoring:** New Relic
- **Log management:** LogRocket, Papertrail

### Regular Maintenance

- Monitor database performance
- Update dependencies regularly
- Backup database weekly
- Review security logs
- Monitor API rate limits

## Troubleshooting Common Issues

### CORS Errors
```javascript
// Update server/src/index.js
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### Environment Variables Not Loading
- Check variable names (case-sensitive)
- Restart application after changes
- Verify deployment platform configuration

### Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Test connection from deployment platform

## Support

For deployment issues:
1. Check the deployment platform's documentation
2. Review application logs
3. Test locally with production environment variables
4. Contact platform support if needed

---

**Note:** Replace `YOUR_USERNAME` and other placeholders with your actual values.