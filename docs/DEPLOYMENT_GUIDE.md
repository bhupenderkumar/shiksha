# Shiksha Deployment Guide - Oracle Cloud Free Tier

## Why Oracle Cloud?
- **Always Free**: 2 AMD VMs or 4 ARM cores, 24GB RAM
- **200GB Storage**: Enough for years of school data
- **10TB Bandwidth**: More than enough for a school
- **No Credit Card Charge**: Won't charge after trial

---

## Step 1: Create Oracle Cloud Account

1. Go to: https://www.oracle.com/cloud/free/
2. Sign up with email
3. Add credit card (for verification only - won't be charged for free tier)
4. Wait for account activation (5-30 minutes)

---

## Step 2: Create Free VM

1. Go to Oracle Cloud Console
2. Click **Compute** → **Instances** → **Create Instance**
3. Configure:
   - **Name**: `shiksha-server`
   - **Image**: Ubuntu 22.04 (or Oracle Linux)
   - **Shape**: Click "Change Shape"
     - Select **Ampere** (ARM) for free tier
     - Choose: **VM.Standard.A1.Flex**
     - OCPUs: 4 (max free)
     - Memory: 24 GB (max free)
   - **Networking**: Create new VCN or use default
   - **SSH Key**: Upload your public key or generate new

4. Click **Create**

---

## Step 3: Configure Firewall

In Oracle Cloud Console:
1. Go to **Networking** → **Virtual Cloud Networks**
2. Click your VCN → **Security Lists** → **Default Security List**
3. Add **Ingress Rules**:

| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 3000 | TCP | 0.0.0.0/0 | Frontend |
| 8000 | TCP | 0.0.0.0/0 | Supabase API |

---

## Step 4: Connect to VM & Install Docker

```bash
# SSH into your VM
ssh ubuntu@<YOUR_VM_PUBLIC_IP>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
exit
```

---

## Step 5: Clone and Deploy Shiksha

```bash
# SSH back in
ssh ubuntu@<YOUR_VM_PUBLIC_IP>

# Clone your repository
git clone https://github.com/YOUR_USERNAME/shiksha.git
cd shiksha

# Copy environment files
cp docker/.env.example docker/.env

# Edit environment variables
nano docker/.env
# Update:
# - SITE_URL=http://YOUR_VM_PUBLIC_IP:3000
# - API_EXTERNAL_URL=http://YOUR_VM_PUBLIC_IP:8000

# Start all services
cd docker
docker compose up -d

# Check status
docker compose ps
```

---

## Step 6: Build and Serve Frontend

Option A: **Add to Docker Compose** (already included in your setup)

```bash
# Build frontend
cd /home/ubuntu/shiksha
docker build -t shiksha-frontend .

# Or use the docker compose
docker compose up -d --build frontend
```

Option B: **Use Nginx directly**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Build frontend
cd /home/ubuntu/shiksha
npm install
npm run build

# Install and configure Nginx
sudo apt install -y nginx
sudo cp -r dist/* /var/www/html/
```

---

## Step 7: Setup Domain (Optional but Recommended)

### Free Domain Options:
1. **Freenom**: Free .tk, .ml, .ga domains
2. **DuckDNS**: Free subdomain (yourname.duckdns.org)
3. **No-IP**: Free dynamic DNS

### Setup with Cloudflare (Recommended):
1. Get a domain (or use free subdomain)
2. Add to Cloudflare (free plan)
3. Point A record to your VM IP
4. Enable Cloudflare proxy for free SSL

---

## Step 8: SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

---

## Quick Reference

### Useful Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop everything
docker compose down

# Update and rebuild
git pull
docker compose up -d --build

# View database
docker exec -it shiksha-db psql -U postgres

# Backup database
docker exec shiksha-db pg_dump -U postgres postgres > backup.sql
```

### Service URLs (replace with your IP/domain)

| Service | URL |
|---------|-----|
| Frontend | http://YOUR_IP:3000 |
| Supabase API | http://YOUR_IP:8000 |
| Supabase Studio | http://YOUR_IP:3333 |
| PostgreSQL | YOUR_IP:5432 |

---

## Estimated Costs

| Platform | Monthly Cost | Notes |
|----------|--------------|-------|
| Oracle Cloud (Free Tier) | $0 | Always free |
| Domain (optional) | $0-12/year | Free options available |
| Cloudflare | $0 | Free plan sufficient |
| **Total** | **$0-1/month** | |

---

## Alternative: Fly.io Deployment

If you prefer managed hosting:

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create Postgres
fly postgres create --name shiksha-db

# Deploy app
fly launch

# Deploy
fly deploy
```

Create `fly.toml`:
```toml
app = "shiksha"
primary_region = "sin"  # Singapore or nearest region

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 80
  force_https = true

[[services]]
  internal_port = 8000
  protocol = "tcp"
  [[services.ports]]
    port = 443
```

---

## Need Help?

1. Oracle Cloud Docs: https://docs.oracle.com/en-us/iaas/Content/home.htm
2. Docker Docs: https://docs.docker.com/
3. Supabase Self-Hosting: https://supabase.com/docs/guides/self-hosting
