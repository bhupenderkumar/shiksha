# 🚀 Shiksha - Oracle Cloud Deployment Guide

Complete step-by-step guide to deploy Shiksha on Oracle Cloud Free Tier (Always Free).

---

## 📋 Prerequisites

- Email address
- Credit/Debit card (for verification only - you won't be charged for Always Free resources)
- ~45 minutes of time
- Basic terminal/SSH knowledge

---

## Part 1: Create Oracle Cloud Account

### Step 1.1: Sign Up

1. Go to: **https://www.oracle.com/cloud/free/**
2. Click **"Start for free"** button
3. Enter your **Email address** and **Country**
4. Click **"Next"**

### Step 1.2: Verify Email & Set Password

1. Check your inbox for "Verify your email" from Oracle
2. Click the verification link
3. Create a password (must include uppercase, lowercase, number, special char)

### Step 1.3: Complete Profile

1. Fill in your details:
   - First Name, Last Name
   - Mobile number (will receive OTP)
   - Company name (can be your name)
   - Department (can be "Personal")
   - Address details

### Step 1.4: Choose Home Region (IMPORTANT!)

⚠️ **This cannot be changed later!** Choose wisely:

| If you're in... | Choose Region |
|-----------------|---------------|
| India | **ap-mumbai-1** (Mumbai) or **ap-hyderabad-1** (Hyderabad) |
| Southeast Asia | **ap-singapore-1** (Singapore) |
| Middle East | **me-dubai-1** (Dubai) |
| Europe | **eu-frankfurt-1** (Frankfurt) |
| US | **us-ashburn-1** (Ashburn) or **us-phoenix-1** (Phoenix) |

### Step 1.5: Add Payment Method

1. Enter credit/debit card details
2. Oracle charges a small amount (~$1/₹100) for verification - **this is refunded**
3. Your card will **NOT** be charged for Always Free tier resources
4. Even if you upgrade, you only pay for what you use beyond free limits

### Step 1.6: Wait for Activation

1. Click **"Start my free trial"**
2. Wait for account provisioning (usually 2-10 minutes)
3. You'll receive email: "Get Started Now with Oracle Cloud"
4. Click **"Sign in to Oracle Cloud"**

---

## Part 2: Create Free Virtual Machine

### Step 2.1: Access Oracle Cloud Console

1. Go to: **https://cloud.oracle.com/**
2. Click **"Sign In"**
3. Enter your **Cloud Account Name** (you received this in the welcome email, e.g., `shiksha123`)
4. Click **"Next"**
5. Select **"oracleidentitycloudservice"** (default identity domain)
6. Enter your username (email) and password
7. Click **"Sign In"**

### Step 2.2: Navigate to Compute

1. Once logged in, you'll see the Oracle Cloud Console Dashboard
2. Click the **☰ (hamburger menu)** in the top-left corner
3. Scroll down to **"Compute"** section
4. Click **"Instances"**

### Step 2.3: Create VM Instance

1. Make sure you're in the correct **Compartment** (left side dropdown - usually "root" or your name)
2. Click the blue **"Create instance"** button

### Step 2.4: Configure Instance Details

#### Section 1: Name and Placement
- **Name**: `shiksha-server`
- **Create in compartment**: Leave as default (root)
- **Availability domain**: Leave as default (AD-1)

#### Section 2: Image and Shape (IMPORTANT - Click "Edit")

**Change Image:**
1. Click **"Edit"** button next to "Image and shape"
2. Click **"Change image"**
3. In the popup:
   - Platform: **Oracle Linux** (or click "Canonical Ubuntu")
   - OS version: **Ubuntu 22.04** (Jammy Jellyfish) - Recommended
   - Image build: Latest available
4. Click **"Select image"**

**Change Shape (IMPORTANT - This is for FREE tier!):**
1. Click **"Change shape"**
2. In the popup:
   - **Instance type**: Virtual machine
   - **Shape series**: Click **"Ampere"** tab ← THIS IS FREE!
   - **Shape name**: `VM.Standard.A1.Flex` will be auto-selected
   - **Number of OCPUs**: Drag slider to **4** (max free)
   - **Amount of memory (GB)**: Drag slider to **24** (max free)
3. Click **"Select shape"**

> 💡 **Free Tier Limits**: You get 4 OCPUs + 24GB RAM free forever on ARM (Ampere). You can create multiple VMs sharing these limits, or one VM with all resources.

#### Section 3: Networking

1. Click **"Edit"** if you want to modify (usually default is fine)
2. **Virtual cloud network**: Select "Create new virtual cloud network" OR select existing
3. **Subnet**: Select "Create new public subnet" OR select existing public subnet
4. **Public IPv4 address**: ✅ Make sure **"Assign a public IPv4 address"** is SELECTED

> ⚠️ If you don't assign a public IP, you won't be able to connect to your server!

#### Section 4: Add SSH Keys (IMPORTANT!)

You have 3 options:

**Option A - Generate new key pair (Recommended for beginners):**
1. Select **"Generate a key pair for me"**
2. Click **"Save private key"** → saves `ssh-key-xxxx-xx-xx.key`
3. Click **"Save public key"** → saves `ssh-key-xxxx-xx-xx.key.pub`
4. **Save these files securely!** You CANNOT download them again.

**Option B - Upload your existing public key:**
1. Select **"Upload public key files (.pub)"**
2. Drag and drop your `id_rsa.pub` or `id_ed25519.pub` file
3. Or click "browse" to select the file

**Option C - Paste public key:**
1. Select **"Paste public keys"**
2. Copy content from your `~/.ssh/id_rsa.pub`:
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```
3. Paste the entire key (starts with `ssh-rsa` or `ssh-ed25519`)

### Step 2.5: Create Instance

1. Review all settings
2. Click the blue **"Create"** button at the bottom
3. Wait 2-5 minutes - status will change from:
   - **PROVISIONING** → **STARTING** → **RUNNING**

### Step 2.6: Note Your Public IP

1. Once status is **RUNNING**, look at "Instance access" section
2. Copy the **Public IP address** (e.g., `129.146.xxx.xxx`)
3. Also note the **Username**: `ubuntu` (for Ubuntu) or `opc` (for Oracle Linux)

> 📝 **Save this IP!** You'll need it for SSH and accessing your app.

---

## Part 3: Configure Security Rules (Open Firewall Ports)

Oracle Cloud has TWO layers of firewall:
1. **Security Lists** (Oracle Cloud level) - Must configure in Console
2. **iptables** (OS level) - Must configure on server

### Step 3.1: Navigate to Security List

1. In Oracle Cloud Console, click **☰** (hamburger menu)
2. Go to **"Networking"** → **"Virtual cloud networks"**
3. Click on your VCN name (e.g., `vcn-20251226-xxxx`)
4. Under **"Resources"** on the left, you'll see **"Subnets"**
5. Click on your **public subnet** (e.g., `subnet-20251226-xxxx`)
6. Under **"Security Lists"**, click on **"Default Security List for vcn-xxxxx"**

### Step 3.2: View Current Rules

You'll see existing Ingress Rules:
- Port 22 (SSH) - Already open by default

### Step 3.3: Add New Ingress Rules

Click **"Add Ingress Rules"** button and add these rules one by one:

**Rule 1 - HTTP (Port 80):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: (leave empty - means All)
Destination Port Range: 80
Description: HTTP web traffic
```
Click **"Add Ingress Rules"**

**Rule 2 - HTTPS (Port 443):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: (leave empty)
Destination Port Range: 443
Description: HTTPS secure web traffic
```
Click **"Add Ingress Rules"**

**Rule 3 - Shiksha Frontend (Port 3000):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: (leave empty)
Destination Port Range: 3000
Description: Shiksha frontend app
```
Click **"Add Ingress Rules"**

**Rule 4 - Supabase API (Port 8000):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: (leave empty)
Destination Port Range: 8000
Description: Supabase API Gateway
```
Click **"Add Ingress Rules"**

**Rule 5 - Supabase Studio (Port 3333):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP  
Source Port Range: (leave empty)
Destination Port Range: 3333
Description: Supabase Studio admin panel
```
Click **"Add Ingress Rules"**

### Step 3.4: Verify All Rules Added

Your Ingress Rules should now show:
| Source | Protocol | Port | Description |
|--------|----------|------|-------------|
| 0.0.0.0/0 | TCP | 22 | SSH |
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |
| 0.0.0.0/0 | TCP | 3000 | Frontend |
| 0.0.0.0/0 | TCP | 8000 | Supabase API |
| 0.0.0.0/0 | TCP | 3333 | Supabase Studio |

---

## Part 4: Connect to Your Server via SSH

### Step 4.1: Prepare SSH Key (First time only)

**On Mac/Linux:**
```bash
# Move downloaded key to .ssh folder
mv ~/Downloads/ssh-key-*.key ~/.ssh/oracle-shiksha.key

# Set correct permissions (REQUIRED - SSH will refuse otherwise)
chmod 400 ~/.ssh/oracle-shiksha.key
```

**On Windows (PowerShell as Administrator):**
```powershell
# Move the key
Move-Item -Path "$env:USERPROFILE\Downloads\ssh-key-*.key" -Destination "$env:USERPROFILE\.ssh\oracle-shiksha.key"

# Set permissions (Windows doesn't require chmod, but this helps)
icacls "$env:USERPROFILE\.ssh\oracle-shiksha.key" /inheritance:r /grant:r "$env:USERNAME:(R)"
```

### Step 4.2: Connect to Server

**On Mac/Linux:**
```bash
# Replace YOUR_SERVER_IP with your actual IP (e.g., 129.146.123.45)
ssh -i ~/.ssh/oracle-shiksha.key ubuntu@YOUR_SERVER_IP
```

**On Windows (PowerShell):**
```powershell
ssh -i $env:USERPROFILE\.ssh\oracle-shiksha.key ubuntu@YOUR_SERVER_IP
```

**On Windows (using PuTTY):**
1. Download and open **PuTTYgen**
2. Click **"Load"** → Select your `.key` file (change filter to "All Files")
3. Click **"Save private key"** → Save as `oracle-shiksha.ppk`
4. Open **PuTTY**
5. Host Name: `ubuntu@YOUR_SERVER_IP`
6. Go to **Connection** → **SSH** → **Auth** → **Credentials**
7. Browse and select your `.ppk` file
8. Click **"Open"**

### Step 4.3: First Connection - Accept Fingerprint

When connecting for the first time, you'll see:
```
The authenticity of host 'YOUR_SERVER_IP' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxx
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Type: `yes` and press Enter

### Step 4.4: Verify Connection

You should now see:
```
Welcome to Ubuntu 22.04.x LTS (GNU/Linux 5.15.0-xxx aarch64)
...
ubuntu@shiksha-server:~$
```

🎉 **You're now connected to your Oracle Cloud server!**

---

## Part 5: Install Docker and Shiksha

### Step 5.1: Update System Packages

```bash
# Update package lists
sudo apt update

# Upgrade existing packages
sudo apt upgrade -y
```

### Step 5.2: Install Docker

```bash
# Install Docker using official convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker installed
docker --version
# Should show: Docker version 24.x.x or higher
```

### Step 5.3: Configure Docker Permissions

```bash
# Add your user to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER

# Apply the new group membership
newgrp docker

# Verify you can run docker without sudo
docker ps
# Should show empty container list, no permission error
```

### Step 5.4: Install Docker Compose

```bash
# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify Docker Compose
docker compose version
# Should show: Docker Compose version v2.x.x
```

### Step 5.5: Install Git and Clone Repository

```bash
# Install git
sudo apt install -y git

# Clone Shiksha repository
# Replace with YOUR actual GitHub repository URL
git clone https://github.com/YOUR_USERNAME/shiksha.git ~/shiksha

# Navigate to project
cd ~/shiksha

# Verify files exist
ls -la docker/
```

### Step 5.6: Configure OS-Level Firewall (iptables)

Oracle Linux/Ubuntu has iptables that also needs to allow traffic:

```bash
# Open required ports in iptables
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3333 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT

# Save iptables rules (persist after reboot)
sudo netfilter-persistent save

# If netfilter-persistent not found, install it:
sudo apt install iptables-persistent -y
sudo netfilter-persistent save
```

### Step 5.7: Make Scripts Executable

```bash
# Make all scripts executable
chmod +x ~/shiksha/docker/scripts/*.sh
```

---

## Part 6: Configure Environment Variables

### Step 6.1: Copy Environment Template

```bash
cd ~/shiksha/docker

# Check if .env.example exists
ls -la .env*

# Copy example to .env if it doesn't exist
cp .env.example .env
```

### Step 6.2: Generate Secure Secrets

Before editing, generate secure secrets:

```bash
# Generate JWT Secret (for auth tokens)
openssl rand -base64 32
# Copy this output!

# Generate Anon Key (for public API access)
# Use this Node.js command or online JWT generator
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use the Supabase JWT generator:
- Go to: https://supabase.com/docs/guides/self-hosting#api-keys
- Generate keys using your JWT secret

### Step 6.3: Edit Docker Environment File

```bash
nano ~/shiksha/docker/.env
```

**Update these critical values:**

```env
############
# Required Settings - MUST CHANGE
############

# Your server's public IP (from Oracle Console)
API_EXTERNAL_URL=http://YOUR_SERVER_IP:8000
SITE_URL=http://YOUR_SERVER_IP:3000

# Database password - CHANGE THIS!
POSTGRES_PASSWORD=your-super-secure-password-here

# JWT Secret - CHANGE THIS! (use openssl output from above)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Anon Key - for public/anonymous access
ANON_KEY=your-generated-anon-key

# Service Role Key - for admin access
SERVICE_ROLE_KEY=your-generated-service-role-key

############
# Optional - Email Configuration
############

# Gmail SMTP (create App Password at https://myaccount.google.com/apppasswords)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_SENDER_NAME=Shiksha School
SMTP_ADMIN_EMAIL=admin@yourschool.com

############
# Google Maps (optional - for location features)
############
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Save the file:**
- Press `Ctrl + O` (letter O, not zero)
- Press `Enter` to confirm
- Press `Ctrl + X` to exit

### Step 6.4: Edit Frontend Environment

```bash
nano ~/shiksha/.env
```

**Update:**
```env
VITE_SUPABASE_URL=http://YOUR_SERVER_IP:8000
VITE_SUPABASE_ANON_KEY=your-generated-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 6.5: Start All Services

```bash
cd ~/shiksha/docker

# Pull latest images
docker compose pull

# Start all services in background
docker compose up -d

# Watch the logs (Ctrl+C to exit logs, services keep running)
docker compose logs -f
```

### Step 6.6: Wait for Services to Initialize

First startup takes 2-5 minutes. Watch for:
- `db` should show "database system is ready to accept connections"
- `auth` should show "GoTrue API started"
- `rest` should show "Listening on port 3000"

```bash
# Check service status
docker compose ps

# All should show "Up" or "healthy"
```

---

## Part 7: Import Your Data (from Local Machine)

Skip this section if starting fresh. Use this to migrate data from your local Docker or Supabase Cloud.

### Step 7.1: Export Data from Local Machine (On Your Mac)

Open a new terminal on your Mac (not the SSH session):

```bash
# Navigate to your local Shiksha project
cd /Users/bhupender.kumar/projects/shiksha/docker

# Create backup directory if it doesn't exist
mkdir -p backups

# Export database schema
docker exec shiksha-db pg_dump -U postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  postgres > backups/schema_export.sql

# Export data only
docker exec shiksha-db pg_dump -U postgres \
  --data-only \
  --no-owner \
  --no-privileges \
  postgres > backups/data_export.sql

# Check files were created
ls -lh backups/*.sql
```

### Step 7.2: Copy Backup Files to Oracle Server

From your Mac terminal:

```bash
# Replace YOUR_SERVER_IP with your Oracle server IP
scp -i ~/.ssh/oracle-shiksha.key \
    /Users/bhupender.kumar/projects/shiksha/docker/backups/schema_export.sql \
    /Users/bhupender.kumar/projects/shiksha/docker/backups/data_export.sql \
    ubuntu@YOUR_SERVER_IP:~/shiksha/docker/backups/
```

### Step 7.3: Import Data on Oracle Server

SSH back to Oracle server and run:

```bash
# Navigate to docker directory
cd ~/shiksha/docker

# Import schema first
docker exec -i shiksha-db psql -U postgres -d postgres < backups/schema_export.sql

# Import data
docker exec -i shiksha-db psql -U postgres -d postgres < backups/data_export.sql

# Verify data imported
docker exec -it shiksha-db psql -U postgres -c "SELECT COUNT(*) as students FROM school.\"Student\";"
docker exec -it shiksha-db psql -U postgres -c "SELECT COUNT(*) as fees FROM school.\"Fee\";"
```

### Step 7.4: Restart Services After Import

```bash
cd ~/shiksha/docker
docker compose restart
```

---

## Part 8: Verify Deployment

### Step 8.1: Check All Services Are Running

```bash
cd ~/shiksha/docker
docker compose ps
```

**Expected output (all should show "Up" or "healthy"):**
```
NAME                STATUS              PORTS
shiksha-db          Up (healthy)        0.0.0.0:5432->5432/tcp
shiksha-kong        Up (healthy)        0.0.0.0:8000->8000/tcp
shiksha-auth        Up                  9999/tcp
shiksha-rest        Up                  3000/tcp
shiksha-storage     Up                  5000/tcp
shiksha-meta        Up                  8080/tcp
shiksha-studio      Up                  0.0.0.0:3333->3000/tcp
shiksha-imgproxy    Up                  8080/tcp
```

### Step 8.2: Check Service Health

```bash
# Check database
docker exec shiksha-db pg_isready -U postgres
# Should show: accepting connections

# Check API endpoint
curl -I http://localhost:8000/rest/v1/
# Should show: HTTP/1.1 200 OK

# Check auth
curl -I http://localhost:8000/auth/v1/health
# Should show: HTTP/1.1 200 OK
```

### Step 8.3: Access Your Application

Open these URLs in your web browser (replace YOUR_SERVER_IP):

| Service | URL | Purpose |
|---------|-----|---------|
| **Supabase API** | `http://YOUR_SERVER_IP:8000` | API Gateway (test this first) |
| **Supabase Studio** | `http://YOUR_SERVER_IP:3333` | Database admin panel |
| **Frontend** | `http://YOUR_SERVER_IP:3000` | Main application (if frontend built) |

### Step 8.4: Test Supabase Studio Access

1. Open `http://YOUR_SERVER_IP:3333` in browser
2. You should see Supabase Studio login
3. Default credentials:
   - **Email**: From your .env `DASHBOARD_USERNAME` (default: `supabase`)
   - **Password**: From your .env `DASHBOARD_PASSWORD`

### Step 8.5: Test Database Connection

```bash
# Connect to database and check tables
docker exec -it shiksha-db psql -U postgres -c "\dt school.*"

# Check student count
docker exec -it shiksha-db psql -U postgres -c "SELECT COUNT(*) FROM school.\"Student\";"
```

### Step 8.6: Troubleshooting Common Issues

**Issue: Cannot access from browser**
```bash
# Check if ports are listening
sudo netstat -tlnp | grep -E '3000|3333|8000'

# Check iptables
sudo iptables -L INPUT -n | grep -E '3000|3333|8000'

# If port not in iptables, add it:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save
```

**Issue: Service keeps restarting**
```bash
# Check service logs
docker compose logs -f auth
docker compose logs -f kong
```

**Issue: Database connection refused**
```bash
# Check db logs
docker compose logs db

# Restart database
docker compose restart db
```

---

## Part 9: Setup Domain & SSL (Recommended for Production)

### Option A: Free Domain with DuckDNS

#### Step 9.1: Create DuckDNS Account

1. Go to: **https://www.duckdns.org/**
2. Login with Google/GitHub/Twitter
3. Create a subdomain: `yourschool` (will be `yourschool.duckdns.org`)
4. Set the **Current IP** to your Oracle server IP
5. Save your **Token** (you'll need it for auto-updates)

#### Step 9.2: Auto-Update DuckDNS IP

```bash
# Create update script
mkdir -p ~/duckdns
cat > ~/duckdns/duck.sh << 'EOF'
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=YOURSUBDOMAIN&token=YOUR-TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
EOF

# Replace YOURSUBDOMAIN and YOUR-TOKEN
nano ~/duckdns/duck.sh

# Make executable
chmod 700 ~/duckdns/duck.sh

# Add to crontab (runs every 5 minutes)
crontab -e
# Add this line:
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

### Option B: Custom Domain (Purchased)

If you bought a domain from GoDaddy, Namecheap, etc:

1. Go to your domain registrar's DNS settings
2. Add an **A Record**:
   - **Type**: A
   - **Host/Name**: @ (or leave blank for root domain)
   - **Value/Points to**: YOUR_SERVER_IP
   - **TTL**: 3600 (or Auto)
3. Add another A Record for www:
   - **Type**: A
   - **Host/Name**: www
   - **Value**: YOUR_SERVER_IP

Wait 5-30 minutes for DNS propagation.

### Step 9.3: Install Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Verify Nginx installed
nginx -v

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test Nginx is running
curl http://localhost
```

### Step 9.4: Configure Nginx for Shiksha

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/shiksha
```

**Paste this configuration (replace `yourschool.duckdns.org` with your domain):**

```nginx
server {
    listen 80;
    server_name yourschool.duckdns.org www.yourschool.duckdns.org;

    # Frontend app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Supabase API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Supabase Studio (optional - restrict access in production)
    location /studio/ {
        rewrite ^/studio/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 9.5: Enable Site and Test

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/shiksha /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# If test passed, reload Nginx
sudo systemctl reload nginx
```

### Step 9.6: Install SSL with Certbot (Free HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourschool.duckdns.org

# Follow prompts:
# - Enter email for renewal notices
# - Agree to terms (A)
# - Share email with EFF (optional: N)
# - Redirect HTTP to HTTPS (select 2)
```

### Step 9.7: Auto-Renew SSL

Certbot sets up auto-renewal automatically. Verify:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check timer
sudo systemctl status certbot.timer
```

### Step 9.8: Update Environment Variables for Domain

```bash
# Update Docker .env with new domain
nano ~/shiksha/docker/.env
```

Change:
```env
API_EXTERNAL_URL=https://yourschool.duckdns.org/api
SITE_URL=https://yourschool.duckdns.org
```

```bash
# Update frontend .env
nano ~/shiksha/.env
```

Change:
```env
VITE_SUPABASE_URL=https://yourschool.duckdns.org/api
```

Restart services:
```bash
cd ~/shiksha/docker
docker compose down
docker compose up -d
```

---

## 🔧 Useful Commands Reference

### View Logs
```bash
cd ~/shiksha/docker

# All services (follow mode - Ctrl+C to exit)
docker compose logs -f

# Last 100 lines of specific service
docker compose logs --tail=100 db
docker compose logs --tail=100 auth
docker compose logs --tail=100 kong
docker compose logs --tail=100 storage

# Search logs for errors
docker compose logs | grep -i error
```

### Service Management
```bash
cd ~/shiksha/docker

# Check status of all services
docker compose ps

# Restart all services
docker compose restart

# Restart specific service
docker compose restart auth
docker compose restart db

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Rebuild and start (after code changes)
docker compose up -d --build
```

### Database Commands
```bash
# Connect to PostgreSQL
docker exec -it shiksha-db psql -U postgres

# Run SQL query directly
docker exec -it shiksha-db psql -U postgres -c "SELECT NOW();"

# List all tables in school schema
docker exec -it shiksha-db psql -U postgres -c "\dt school.*"

# Count records
docker exec -it shiksha-db psql -U postgres -c "SELECT COUNT(*) FROM school.\"Student\";"

# Backup database
docker exec shiksha-db pg_dump -U postgres postgres > ~/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Update Application
```bash
cd ~/shiksha

# Pull latest code from GitHub
git pull origin main

# Rebuild and restart containers
cd docker
docker compose down
docker compose pull
docker compose up -d --build
```

### Automated Daily Backup
```bash
# Create backup directory
mkdir -p ~/backups

# Add cron job
crontab -e

# Add this line (backs up at 2 AM daily):
0 2 * * * docker exec shiksha-db pg_dump -U postgres postgres > /home/ubuntu/backups/backup_$(date +\%Y\%m\%d).sql 2>&1

# Keep only last 7 days of backups (add this line too):
0 3 * * * find /home/ubuntu/backups -name "backup_*.sql" -mtime +7 -delete
```

### Monitor System Resources
```bash
# System memory and CPU
htop

# Docker container resources
docker stats

# Disk usage
df -h

# Docker disk usage
docker system df
```

### Clean Up Docker (if running low on disk)
```bash
# Remove unused images
docker image prune

# Remove all unused data (be careful!)
docker system prune -a

# Check what's using space
docker system df -v
```

---

## 🆘 Troubleshooting Guide

### Problem: Cannot SSH to Server

**Symptom**: Connection timeout or refused

**Solutions**:
```bash
# 1. Verify instance is running in Oracle Console
# Go to Compute → Instances → Check status is "RUNNING"

# 2. Verify you're using correct IP and username
# For Ubuntu: ubuntu@IP
# For Oracle Linux: opc@IP

# 3. Check SSH key permissions
chmod 400 ~/.ssh/oracle-shiksha.key

# 4. Verify Security List has port 22 open
# Go to VCN → Subnet → Security List → Check Ingress Rules

# 5. Try verbose SSH to see error details
ssh -vvv -i ~/.ssh/oracle-shiksha.key ubuntu@YOUR_SERVER_IP
```

### Problem: Cannot Access Web Ports from Browser

**Symptom**: Browser shows "connection refused" or timeout

**Solutions**:
```bash
# 1. Check if service is actually listening
sudo netstat -tlnp | grep -E '3000|3333|8000'

# 2. Check Docker containers are running
docker compose ps

# 3. Verify Oracle Security List has ports open
# Console → VCN → Subnet → Security List

# 4. Check OS-level firewall (iptables)
sudo iptables -L INPUT -n | grep -E '3000|3333|8000'

# 5. If ports not in iptables, add them:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3333 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save
```

### Problem: Docker Permission Denied

**Symptom**: "permission denied while trying to connect to the Docker daemon"

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply new group (or logout and login again)
newgrp docker

# Verify
docker ps
```

### Problem: Container Keeps Restarting

**Symptom**: Container shows "Restarting" status

**Solutions**:
```bash
# Check container logs for error
docker compose logs <service-name>

# Common causes:
# - Database: Wrong password in .env
# - Auth: Invalid JWT secret
# - Kong: Port conflict

# Fix and restart
nano ~/shiksha/docker/.env  # Fix the issue
docker compose down
docker compose up -d
```

### Problem: "Out of capacity" Error Creating Instance

**Symptom**: Oracle says no capacity available for ARM shape

**Solutions**:
1. **Try different Availability Domain**: When creating instance, change AD-1 to AD-2 or AD-3
2. **Try later**: Free tier resources are limited, try early morning or late night
3. **Try different region**: Create new account with different home region
4. **Use smaller shape**: Try 2 OCPUs, 12GB RAM instead of maximum
5. **Use x86 shape**: VM.Standard.E2.1.Micro (also free but limited)

### Problem: Database Connection Refused

**Symptom**: "connection refused" errors in logs

**Solutions**:
```bash
# Check database container health
docker compose logs db | tail -50

# Restart database
docker compose restart db

# Wait 30 seconds, then check
docker exec shiksha-db pg_isready -U postgres

# If still failing, recreate database container
docker compose down
docker volume rm docker_db-data  # WARNING: Deletes all data!
docker compose up -d
```

### Problem: SSL Certificate Errors

**Symptom**: Certbot fails to get certificate

**Solutions**:
```bash
# 1. Verify DNS is pointing to your server
nslookup yourschool.duckdns.org

# 2. Verify port 80 is accessible
curl -I http://yourschool.duckdns.org

# 3. Stop Nginx temporarily
sudo systemctl stop nginx

# 4. Use standalone mode
sudo certbot certonly --standalone -d yourschool.duckdns.org

# 5. Restart Nginx
sudo systemctl start nginx
```

### Problem: Storage/File Upload Failing

**Symptom**: File uploads return 500 error

**Solutions**:
```bash
# Check storage logs
docker compose logs storage

# Verify storage schema exists
docker exec -it shiksha-db psql -U postgres -c "\dt storage.*"

# Restart storage service
docker compose restart storage
```

---

## 📊 Oracle Cloud Free Tier Limits

Always stay within these limits to avoid charges:

| Resource | Free Tier Limit | Shiksha Usage |
|----------|-----------------|---------------|
| ARM Compute (OCPUs) | 4 OCPUs total | Using 4 ✅ |
| ARM Compute (Memory) | 24 GB total | Using 24 GB ✅ |
| x86 Compute | 2 VM.Standard.E2.1.Micro | Not using |
| Block Storage | 200 GB total | ~50 GB ✅ |
| Object Storage | 20 GB | Not using |
| Outbound Data | 10 TB/month | < 1 GB typical ✅ |
| Load Balancer | 1 (10 Mbps) | Not using |

### How to Monitor Usage

1. Login to Oracle Cloud Console
2. Click **☰** → **Governance & Administration** → **Limits, Quotas and Usage**
3. Check your current usage vs limits

### Upgrade Protection

To prevent accidental charges:
1. Go to **☰** → **Governance** → **Tenancy Details**
2. Ensure **"Upgrade to Paid Account"** is NOT clicked
3. Free tier accounts cannot be charged

---

## ✅ Deployment Checklist

### Phase 1: Oracle Cloud Setup
- [ ] Created Oracle Cloud account (https://www.oracle.com/cloud/free/)
- [ ] Email verified
- [ ] Payment method added (for verification only)
- [ ] Account activated

### Phase 2: VM Creation
- [ ] Created ARM VM instance (VM.Standard.A1.Flex)
- [ ] Selected 4 OCPUs and 24 GB RAM
- [ ] Chose Ubuntu 22.04 image
- [ ] Downloaded SSH key pair (save securely!)
- [ ] Instance is in RUNNING state
- [ ] Noted Public IP address: _______________

### Phase 3: Security Configuration
- [ ] Added Ingress Rule for port 80 (HTTP)
- [ ] Added Ingress Rule for port 443 (HTTPS)
- [ ] Added Ingress Rule for port 3000 (Frontend)
- [ ] Added Ingress Rule for port 3333 (Studio)
- [ ] Added Ingress Rule for port 8000 (API)

### Phase 4: Server Setup
- [ ] Connected via SSH successfully
- [ ] System packages updated
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] User added to docker group
- [ ] iptables configured for ports
- [ ] Git installed
- [ ] Repository cloned

### Phase 5: Application Deployment
- [ ] Environment variables configured in docker/.env
- [ ] Frontend .env configured
- [ ] Docker Compose started
- [ ] All containers showing "Up" status
- [ ] API responding (curl http://localhost:8000)

### Phase 6: Verification
- [ ] Can access http://YOUR_IP:8000 (API)
- [ ] Can access http://YOUR_IP:3333 (Studio)
- [ ] Database tables visible in Studio
- [ ] Data migrated (if applicable)

### Phase 7: Production Hardening (Optional)
- [ ] Domain configured (DuckDNS or custom)
- [ ] Nginx reverse proxy set up
- [ ] SSL certificate installed (Certbot)
- [ ] HTTPS working
- [ ] Automated backup configured
- [ ] Monitoring set up

---

## 💰 Cost Summary

| Resource | Free Tier | Monthly Cost |
|----------|-----------|--------------|
| Oracle Cloud ARM VM (4 OCPU, 24GB) | ✅ Always Free | ₹0 |
| Block Storage (50 GB Boot Volume) | ✅ Included | ₹0 |
| Outbound Bandwidth (10TB/month) | ✅ Included | ₹0 |
| Public IP Address | ✅ Included | ₹0 |
| DuckDNS Domain | ✅ Free | ₹0 |
| Let's Encrypt SSL | ✅ Free | ₹0 |
| Custom Domain (optional) | ❌ Paid | ₹500-1000/year |
| **Total** | | **₹0/month** |

> 💡 **Note**: Oracle's Always Free tier is truly free forever, not a trial. As long as you stay within the limits and don't upgrade to a paid account, you will never be charged.

---

## 📚 Additional Resources

### Official Documentation
- **Oracle Cloud Free Tier**: https://www.oracle.com/cloud/free/
- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/Content/home.htm
- **Supabase Self-Hosting**: https://supabase.com/docs/guides/self-hosting
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/

### Helpful Tutorials
- **DuckDNS Setup**: https://www.duckdns.org/install.jsp
- **Certbot (SSL)**: https://certbot.eff.org/instructions

### Community Support
- **Supabase Discord**: https://discord.supabase.com/
- **Oracle Cloud Community**: https://community.oracle.com/

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    SHIKSHA DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────┤
│ Server IP: YOUR_SERVER_IP                                   │
│ SSH: ssh -i ~/.ssh/oracle-shiksha.key ubuntu@YOUR_SERVER_IP │
├─────────────────────────────────────────────────────────────┤
│ URLS:                                                       │
│   API:     http://YOUR_SERVER_IP:8000                       │
│   Studio:  http://YOUR_SERVER_IP:3333                       │
│   App:     http://YOUR_SERVER_IP:3000                       │
├─────────────────────────────────────────────────────────────┤
│ COMMANDS:                                                   │
│   cd ~/shiksha/docker                                       │
│   docker compose ps          # Check status                 │
│   docker compose logs -f     # View logs                    │
│   docker compose restart     # Restart all                  │
│   docker compose down        # Stop all                     │
│   docker compose up -d       # Start all                    │
├─────────────────────────────────────────────────────────────┤
│ DATABASE:                                                   │
│   docker exec -it shiksha-db psql -U postgres               │
├─────────────────────────────────────────────────────────────┤
│ BACKUP:                                                     │
│   docker exec shiksha-db pg_dump -U postgres postgres > backup.sql │
└─────────────────────────────────────────────────────────────┘
```

---

*Last updated: December 2025*
*Guide version: 2.0*
