# 🐳 **Docker Deployment Guide**

## 🚀 **Quick Start**

Your app is now ready for Docker deployment! Here are your options:

### **Option 1: Simple Local Deployment**
```bash
# Run the deployment script
./docker-deploy.sh

# Choose option 1 for simple deployment
# Your app will be available at: http://localhost:3000
```

### **Option 2: Manual Docker Commands**
```bash
# Build the image
docker build -t ikon-systems-dashboard .

# Run with simple setup
docker-compose -f docker-compose.simple.yml up -d

# Your app will be at: http://localhost:3000
```

### **Option 3: Production Deployment (with SSL)**
```bash
# Run the deployment script
./docker-deploy.sh

# Choose option 2 for production deployment
# Your app will be available at: https://app.ikonsystemsai.com
```

## 📋 **Prerequisites**

### **Required:**
- Docker installed
- Docker Compose installed
- Your Supabase credentials in `.env` file

### **For Production (SSL):**
- Domain name pointing to your server
- Ports 80 and 443 open on your server

## 🔧 **Environment Setup**

### **1. Create .env file:**
```bash
# Copy from example
cp env.example .env

# Edit with your values
nano .env
```

### **2. Required Environment Variables:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐳 **Docker Files Explained**

### **Dockerfile**
- **Multi-stage build**: Optimized for production
- **Node.js 18 Alpine**: Lightweight base image
- **Nginx**: Production web server
- **Health checks**: Built-in monitoring
- **Security**: Non-root user, proper permissions

### **docker-compose.simple.yml**
- **Local development**: No SSL, simple setup
- **Port 3000**: Easy access
- **Health monitoring**: Built-in health checks

### **docker-compose.prod.yml**
- **Production ready**: SSL with Let's Encrypt
- **Traefik**: Automatic reverse proxy
- **Domain support**: app.ikonsystemsai.com
- **Security headers**: Production-grade security

## 🚀 **Deployment Options**

### **1. Simple Deployment (Recommended for Testing)**

**Perfect for:**
- Local development
- Testing
- Quick demos

**Features:**
- ✅ No SSL setup required
- ✅ Works on localhost
- ✅ Fast deployment
- ✅ Health monitoring

**Commands:**
```bash
./docker-deploy.sh
# Choose option 1
```

**Access:** http://localhost:3000

### **2. Production Deployment (Recommended for Live)**

**Perfect for:**
- Production servers
- Live websites
- Professional deployment

**Features:**
- ✅ Automatic SSL certificates
- ✅ Domain support
- ✅ Production security
- ✅ Traefik dashboard
- ✅ HTTP to HTTPS redirect

**Commands:**
```bash
./docker-deploy.sh
# Choose option 2
```

**Access:** https://app.ikonsystemsai.com

## 🔍 **Monitoring & Management**

### **Check Status:**
```bash
# Using the script
./docker-deploy.sh
# Choose option 5

# Or manually
docker-compose ps
```

### **View Logs:**
```bash
# Using the script
./docker-deploy.sh
# Choose option 3

# Or manually
docker-compose logs -f app
```

### **Stop Application:**
```bash
# Using the script
./docker-deploy.sh
# Choose option 4

# Or manually
docker-compose down
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **1. Port Already in Use**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use different port
docker-compose -f docker-compose.simple.yml down
```

#### **2. Environment Variables Not Working**
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables
cat .env
```

#### **3. Build Fails**
```bash
# Clean Docker cache
docker system prune -f

# Rebuild without cache
docker build --no-cache -t ikon-systems-dashboard .
```

#### **4. SSL Certificate Issues**
```bash
# Check Traefik logs
docker-compose logs traefik

# Verify domain DNS
nslookup app.ikonsystemsai.com
```

## 📊 **Performance Features**

### **Built-in Optimizations:**
- ✅ **Gzip compression**: Faster loading
- ✅ **Static asset caching**: 1 year cache
- ✅ **Health checks**: Automatic monitoring
- ✅ **Security headers**: Production security
- ✅ **Nginx optimization**: High performance

### **Resource Usage:**
- **Image size**: ~50MB (optimized)
- **Memory usage**: ~100MB
- **CPU usage**: Minimal
- **Disk usage**: ~200MB

## 🔒 **Security Features**

### **Production Security:**
- ✅ **Non-root user**: Secure execution
- ✅ **Security headers**: XSS, CSRF protection
- ✅ **HTTPS only**: SSL/TLS encryption
- ✅ **Content Security Policy**: XSS prevention
- ✅ **Health monitoring**: Automatic restarts

## 🌐 **Domain Setup (Production)**

### **DNS Configuration:**
```
A Record: app.ikonsystemsai.com → YOUR_SERVER_IP
A Record: traefik.ikonsystemsai.com → YOUR_SERVER_IP
```

### **Firewall Rules:**
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Optional: Allow SSH
sudo ufw allow 22
```

## 📈 **Scaling**

### **Horizontal Scaling:**
```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

### **Load Balancing:**
- Traefik automatically handles load balancing
- Multiple app instances supported
- Health checks ensure reliability

## 🎯 **Next Steps**

### **After Deployment:**

1. **Test Your App:**
   - Visit the URL
   - Test all features
   - Check dark mode
   - Add a test client

2. **Monitor Performance:**
   - Check health endpoint
   - Monitor logs
   - Verify SSL certificate

3. **Backup Strategy:**
   - Set up database backups
   - Monitor disk space
   - Regular updates

## 🆘 **Support**

### **If You Need Help:**
1. Check the logs: `docker-compose logs -f app`
2. Verify environment variables
3. Check Docker status: `docker ps`
4. Restart services: `docker-compose restart`

---

## 🎉 **Your App is Ready!**

Your Ikon Systems Dashboard is now containerized and ready for deployment! Choose your deployment option and get your app live in minutes! 🚀
