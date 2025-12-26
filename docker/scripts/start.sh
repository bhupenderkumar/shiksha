#!/bin/bash
# Shiksha Self-Hosted Supabase Startup Script
# This script starts the Docker compose stack and initializes the database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Shiksha Self-Hosted Supabase Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f "$DOCKER_DIR/.env" ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
    cp "$DOCKER_DIR/.env.example" "$DOCKER_DIR/.env"
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
    REALTIME_SECRET=$(openssl rand -base64 64 | tr -d '/+=' | head -c 64)
    
    # Update .env file with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-super-secret-jwt-token-with-at-least-32-characters/$JWT_SECRET/" "$DOCKER_DIR/.env"
        sed -i '' "s/your-super-secret-database-password/$POSTGRES_PASSWORD/" "$DOCKER_DIR/.env"
        sed -i '' "s/supabase-realtime-secret-base-64-characters-minimum-for-security/$REALTIME_SECRET/" "$DOCKER_DIR/.env"
    else
        sed -i "s/your-super-secret-jwt-token-with-at-least-32-characters/$JWT_SECRET/" "$DOCKER_DIR/.env"
        sed -i "s/your-super-secret-database-password/$POSTGRES_PASSWORD/" "$DOCKER_DIR/.env"
        sed -i "s/supabase-realtime-secret-base-64-characters-minimum-for-security/$REALTIME_SECRET/" "$DOCKER_DIR/.env"
    fi
    
    echo -e "${GREEN}Generated secure secrets in .env file${NC}"
    echo -e "${YELLOW}IMPORTANT: Please generate proper ANON_KEY and SERVICE_ROLE_KEY${NC}"
    echo "Visit: https://supabase.com/docs/guides/self-hosting#api-keys"
    echo ""
fi

# Load environment variables
source "$DOCKER_DIR/.env"

# Check if critical secrets are still placeholder values
if [[ "$ANON_KEY" == "your-anon-key-here" ]]; then
    echo -e "${RED}Error: ANON_KEY is not set in .env${NC}"
    echo ""
    echo "You need to generate API keys. Run this command to generate them:"
    echo ""
    echo "  node -e \"const jwt = require('jsonwebtoken'); "
    echo "    const secret = '\$JWT_SECRET'; "
    echo "    console.log('ANON_KEY:', jwt.sign({ role: 'anon', iss: 'supabase' }, secret)); "
    echo "    console.log('SERVICE_ROLE_KEY:', jwt.sign({ role: 'service_role', iss: 'supabase' }, secret));\""
    echo ""
    exit 1
fi

echo -e "${YELLOW}Starting Docker containers...${NC}"
cd "$DOCKER_DIR"
docker compose up -d

echo ""
echo -e "${YELLOW}Waiting for services to be ready...${NC}"

# Wait for PostgreSQL to be ready
echo -n "Waiting for PostgreSQL..."
until docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo -e " ${GREEN}Ready!${NC}"

# Wait for Kong to be ready
echo -n "Waiting for Kong API Gateway..."
until curl -s "http://localhost:${KONG_HTTP_PORT:-8000}/health" > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo -e " ${GREEN}Ready!${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Shiksha Self-Hosted Supabase is Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Services available at:"
echo -e "  ${BLUE}API Gateway:${NC}     http://localhost:${KONG_HTTP_PORT:-8000}"
echo -e "  ${BLUE}Supabase Studio:${NC} http://localhost:${STUDIO_PORT:-3333}"
echo -e "  ${BLUE}PostgreSQL:${NC}      localhost:${POSTGRES_PORT:-5432}"
echo ""
echo -e "For your React app, update ${YELLOW}.env${NC} with:"
echo -e "  VITE_SUPABASE_URL=http://localhost:${KONG_HTTP_PORT:-8000}"
echo -e "  VITE_SUPABASE_ANON_KEY=${ANON_KEY:0:20}..."
echo -e "  VITE_SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY:0:20}..."
echo ""
echo "To stop the services:"
echo "  cd docker && docker compose down"
echo ""
