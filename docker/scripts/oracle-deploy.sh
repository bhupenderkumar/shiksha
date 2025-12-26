#!/bin/bash
# Shiksha Oracle Cloud Deployment Script
# Run this AFTER oracle-setup.sh and re-login

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SHIKSHA_DIR="$HOME/shiksha"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Shiksha - Deploying to Oracle Cloud  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

cd "$SHIKSHA_DIR"

# Check Docker
if ! docker ps &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Docker. Did you logout and login again?${NC}"
    exit 1
fi

# Generate proper JWT keys
echo -e "${CYAN}Step 1: Generating JWT keys...${NC}"
cd "$SHIKSHA_DIR/docker"

if [ -f "scripts/generate-keys.js" ]; then
    if command -v node &> /dev/null; then
        node scripts/generate-keys.js
    else
        echo -e "${YELLOW}Node.js not found. Using placeholder keys.${NC}"
        echo -e "${YELLOW}You should regenerate keys later with: node docker/scripts/generate-keys.js${NC}"
    fi
fi

# Start services
echo -e "${CYAN}Step 2: Starting Docker services...${NC}"
docker compose up -d db
echo "Waiting for database to be ready..."
sleep 15

# Start remaining services
echo -e "${CYAN}Step 3: Starting all services...${NC}"
docker compose up -d

# Wait for services
echo "Waiting for services to start..."
sleep 10

# Check status
echo -e "${CYAN}Step 4: Checking service status...${NC}"
docker compose ps

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!                 ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Access your services at:"
echo -e "  ${CYAN}Frontend:${NC}        http://$SERVER_IP:3000"
echo -e "  ${CYAN}Supabase API:${NC}    http://$SERVER_IP:8000"
echo -e "  ${CYAN}Supabase Studio:${NC} http://$SERVER_IP:3333"
echo ""
echo -e "${YELLOW}If frontend is not built, run:${NC}"
echo -e "  cd ~/shiksha && npm install && npm run build"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo -e "  docker compose logs -f"
echo ""
echo -e "${YELLOW}To stop all services:${NC}"
echo -e "  docker compose down"
echo ""
