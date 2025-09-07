# 🐳 **Docker Setup Guide**

## 🚨 **Docker Not Running**

I see that Docker is not currently running on your system. Here's how to get it set up:

## 📥 **Install Docker**

### **For macOS:**
1. **Download Docker Desktop:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Download Docker Desktop for Mac
   - Install the .dmg file

2. **Start Docker Desktop:**
   - Open Docker Desktop from Applications
   - Wait for it to start (you'll see the Docker whale icon in your menu bar)
   - The icon should be steady (not animated) when ready

### **For Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

### **For Windows:**
1. **Download Docker Desktop:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Download Docker Desktop for Windows
   - Install and restart your computer

2. **Start Docker Desktop:**
   - Open Docker Desktop from Start Menu
   - Wait for it to start

## ✅ **Verify Docker Installation**

Once Docker is running, test it:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Test Docker
docker run hello-world
```

## 🚀 **Deploy Your App**

Once Docker is running, you can deploy your app:

### **Option 1: Use the Deployment Script**
```bash
./docker-deploy.sh
```

### **Option 2: Manual Commands**
```bash
# Build the image
docker build -t ikon-systems-dashboard .

# Run with simple setup
docker-compose -f docker-compose.simple.yml up -d
```

## 🔧 **Troubleshooting**

### **Docker Desktop Won't Start:**
- **macOS**: Check System Preferences → Security & Privacy
- **Windows**: Make sure WSL 2 is enabled
- **Linux**: Check if virtualization is enabled in BIOS

### **Permission Denied:**
```bash
# Linux only - add user to docker group
sudo usermod -aG docker $USER
# Then log out and back in
```

### **Port Already in Use:**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use different port
```

## 📱 **Quick Start After Docker is Running**

1. **Start Docker Desktop**
2. **Wait for it to be ready** (whale icon steady)
3. **Run the deployment script:**
   ```bash
   ./docker-deploy.sh
   ```
4. **Choose option 1** for simple deployment
5. **Visit:** http://localhost:3000

## 🎯 **What Happens Next**

Once Docker is running and you deploy:

1. **Your app builds** in a container
2. **Nginx serves** your React app
3. **Health checks** monitor the app
4. **Your app is available** at http://localhost:3000

## 🆘 **Need Help?**

If you're still having issues:

1. **Check Docker status:**
   ```bash
   docker info
   ```

2. **Restart Docker Desktop**

3. **Check system requirements:**
   - macOS: macOS 10.15 or later
   - Windows: Windows 10/11 with WSL 2
   - Linux: Any modern distribution

---

## 🎉 **Ready to Deploy!**

Once Docker is running, your fully functional Ikon Systems Dashboard will be containerized and ready to deploy anywhere! 🚀
