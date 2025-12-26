#!/bin/bash
# Shiksha Oracle Cloud Deployment Script
# Run this script on your Oracle Cloud VM after initial setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Shiksha - Oracle Cloud Setup Script  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}Running as root. Creating ubuntu user...${NC}"
    USER_HOME="/home/ubuntu"
else
    USER_HOME="$HOME"
fi

# Step 1: Update system
echo -e "${CYAN}Step 1: Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Docker
echo -e "${CYAN}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${GREEN}Docker already installed${NC}"
fi

# Step 3: Install Docker Compose
echo -e "${CYAN}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}Docker Compose already installed${NC}"
fi

# Step 4: Install useful tools
echo -e "${CYAN}Step 4: Installing useful tools...${NC}"
sudo apt install -y git curl wget nano htop ufw

# Step 5: Configure firewall
echo -e "${CYAN}Step 5: Configuring firewall...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Supabase API
sudo ufw allow 3333/tcp  # Supabase Studio
sudo ufw --force enable
echo -e "${GREEN}Firewall configured${NC}"

# Step 6: Clone repository
echo -e "${CYAN}Step 6: Setting up Shiksha...${NC}"
SHIKSHA_DIR="$USER_HOME/shiksha"

if [ -d "$SHIKSHA_DIR" ]; then
    echo -e "${YELLOW}Shiksha directory exists. Pulling latest...${NC}"
    cd "$SHIKSHA_DIR"
    git pull
else
    echo "Enter your GitHub repository URL (or press Enter for default):"
    read -r REPO_URL
    if [ -z "$REPO_URL" ]; then
        echo -e "${YELLOW}Please clone your repository manually:${NC}"
        echo "git clone https://github.com/YOUR_USERNAME/shiksha.git $SHIKSHA_DIR"
        exit 1
    fi
    git clone "$REPO_URL" "$SHIKSHA_DIR"
    cd "$SHIKSHA_DIR"
fi

# Step 7: Generate environment file
echo -e "${CYAN}Step 7: Generating environment configuration...${NC}"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo -e "Detected server IP: ${GREEN}$SERVER_IP${NC}"

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
ANON_KEY=$(openssl rand -base64 32)
SERVICE_ROLE_KEY=$(openssl rand -base64 32)

# Create docker/.env file
cat > "$SHIKSHA_DIR/docker/.env" << EOF
# Shiksha - Oracle Cloud Production Environment
# Generated on $(date)
# Server IP: $SERVER_IP

############
# Secrets
############
JWT_SECRET=$JWT_SECRET
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Supabase Keys (you can regenerate these using proper JWT format)
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzM1Mjc0MDAwLCJleHAiOjIwODIwOTQwMDB9.placeholder_replace_me
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3MzUyNzQwMDAsImV4cCI6MjA4MjA5NDAwMH0.placeholder_replace_me

############
# Database
############
POSTGRES_USER=postgres
POSTGRES_DB=postgres
POSTGRES_PORT=5432

############
# API Configuration
############
API_EXTERNAL_URL=http://$SERVER_IP:8000
SITE_URL=http://$SERVER_IP:3000
ADDITIONAL_REDIRECT_URLS=http://$SERVER_IP:3000
JWT_EXP=3600

############
# PostgREST
############
PGRST_DB_SCHEMAS=public,school
PGRST_PORT=3001

############
# Kong
############
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

############
# GoTrue (Auth)
############
GOTRUE_PORT=9999
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true

############
# Storage
############
STORAGE_PORT=5000

############
# Studio
############
STUDIO_PORT=3333

############
# Frontend
############
FRONTEND_PORT=3000

############
# SMTP (Optional - for email)
############
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_ADMIN_EMAIL=admin@yourschool.com

############
# Realtime
############
REALTIME_PORT=4000
REALTIME_DB_ENC_KEY=$(openssl rand -base64 32)
REALTIME_SECRET_KEY_BASE=$(openssl rand -base64 64 | tr -d '\n')
EOF

echo -e "${GREEN}Environment file created at docker/.env${NC}"

# Create frontend .env file
cat > "$SHIKSHA_DIR/.env" << EOF
# Shiksha Frontend Environment
# Generated on $(date)

# Supabase Configuration (Docker Self-Hosted)
VITE_SUPABASE_URL=http://$SERVER_IP:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzM1Mjc0MDAwLCJleHAiOjIwODIwOTQwMDB9.placeholder_replace_me
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3MzUyNzQwMDAsImV4cCI6MjA4MjA5NDAwMH0.placeholder_replace_me

# Database URL
DATABASE_URL=postgresql://postgres:$POSTGRES_PASSWORD@localhost:5432/postgres

# Google Maps (optional)
VITE_GOOGLE_MAPS_API_KEY=

# School Configuration
VITE_SCHOOL_ID=shiksha

# File Storage
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Application
VITE_API_BASE_URL=http://$SERVER_IP:3000
VITE_APP_ENV=production
EOF

echo -e "${GREEN}Frontend .env file created${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Initial Setup Complete!              ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: You need to logout and login again for Docker permissions${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. ${CYAN}exit${NC} (logout)"
echo -e "  2. SSH back in"
echo -e "  3. ${CYAN}cd ~/shiksha && ./docker/scripts/oracle-deploy.sh${NC}"
echo ""
echo -e "Or run manually:"
echo -e "  ${CYAN}cd ~/shiksha/docker && docker compose up -d${NC}"
echo ""
