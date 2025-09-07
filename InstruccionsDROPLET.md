# 🚀 **DROPLET UPDATE INSTRUCTIONS**

## **Step-by-Step Guide to Update Your Webapp**

### **Phase 1: Local Development & GitHub Updates**

#### **Step 1: Update Local Codebase**
```bash
# Navigate to your project directory
cd /Users/yoonjeffrey/ikonsystemsdash

# Create a new branch for updates
git checkout -b feature/ultimate-webapp-upgrade

# Make all the improvements (see detailed changes below)
# ... (all the code changes will be made here)

# Test locally
npm run dev
# Test at http://localhost:3000
```

#### **Step 2: Commit Changes to GitHub**
```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Ultimate webapp upgrade - production ready with live features"

# Push to GitHub
git push origin feature/ultimate-webapp-upgrade

# Create Pull Request (optional)
# Go to GitHub and create PR from feature/ultimate-webapp-upgrade to main
```

#### **Step 3: Merge to Main (after testing)**
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/ultimate-webapp-upgrade

# Push to main
git push origin main
```

### **Phase 2: Docker Build & Test**

#### **Step 4: Build New Docker Image**
```bash
# Build the new image
docker build -t ikon-systems-dashboard:ultimate .

# Test locally with Docker
docker-compose -f docker-compose.simple.yml up -d --build

# Test at http://localhost:3000
# Verify all new features work
```

#### **Step 5: Stop Local Docker**
```bash
# Stop local containers
docker-compose down
```

### **Phase 3: Deploy to Droplet**

#### **Step 6: Connect to Your Droplet**
```bash
# SSH into your droplet
ssh root@161.35.232.165
```

#### **Step 7: Update Code on Droplet**
```bash
# Navigate to app directory
cd /opt/ikon-systems-dashboard

# Pull latest changes from GitHub
git pull origin main

# Verify new files are present
ls -la
```

#### **Step 8: Update Environment Variables (if needed)**
```bash
# Edit environment file
nano .env

# Add new API keys if any were added:
# VITE_VAPI_API_KEY=your_vapi_key
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
# VITE_GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
```

#### **Step 9: Deploy New Version**
```bash
# Stop existing containers
docker-compose down

# Build and start new version
docker-compose -f docker-compose.simple.yml up -d --build

# Check status
docker ps

# Check logs
docker logs ikon-systems-app --tail 20
```

#### **Step 10: Verify Deployment**
```bash
# Test health endpoint
curl -f http://localhost:3000/health

# Test main app
curl -I https://app.ikonsystemsai.com
```

### **Phase 4: Post-Deployment Testing**

#### **Step 11: Test All Features**
1. **Visit:** https://app.ikonsystemsai.com
2. **Test Authentication:** Login with your credentials
3. **Test Navigation:** Toggle sidebar, navigate between pages
4. **Test CRUD Operations:** Add/edit/delete clients, projects, appointments
5. **Test Real-time Features:** Check if recent activity updates live
6. **Test Dark Mode:** Toggle theme
7. **Test Mobile Responsiveness:** Check on mobile device

#### **Step 12: Monitor Performance**
```bash
# Check container resources
docker stats

# Check logs for errors
docker logs ikon-systems-app --tail 50

# Check Nginx logs
tail -f /var/log/nginx/access.log
```

### **Phase 5: Rollback Plan (if needed)**

#### **If Something Goes Wrong:**
```bash
# Stop new containers
docker-compose down

# Revert to previous version
git checkout HEAD~1

# Rebuild and restart
docker-compose -f docker-compose.simple.yml up -d --build
```

---

## **🔧 Required API Keys Setup**

### **1. VAPI (Voice Agents)**
- **Sign up:** https://vapi.ai
- **Get API Key:** Dashboard → API Keys
- **Add to .env:** `VITE_VAPI_API_KEY=your_key_here`

### **2. Stripe (Payments)**
- **Sign up:** https://stripe.com
- **Get Publishable Key:** Dashboard → Developers → API Keys
- **Add to .env:** `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here`

### **3. Google Calendar**
- **Go to:** https://console.cloud.google.com
- **Create Project:** Enable Calendar API
- **Create OAuth 2.0:** Credentials → OAuth 2.0 Client IDs
- **Add to .env:** `VITE_GOOGLE_CALENDAR_CLIENT_ID=your_client_id_here`

---

## **📋 Pre-Deployment Checklist**

- [ ] All code changes committed to GitHub
- [ ] Local testing completed successfully
- [ ] Docker build successful
- [ ] Environment variables updated
- [ ] API keys obtained and configured
- [ ] Backup of current version created
- [ ] Rollback plan ready

---

## **🚨 Important Notes**

1. **Always test locally first** before deploying to droplet
2. **Keep backups** of working versions
3. **Monitor logs** after deployment
4. **Test all features** after each deployment
5. **Have rollback plan** ready

---

## **📞 Support Commands**

```bash
# Check container status
docker ps

# View logs
docker logs ikon-systems-app -f

# Restart services
docker-compose restart

# Check disk space
df -h

# Check memory usage
free -h
```

**Ready to make your webapp the ultimate business tool! 🚀**
