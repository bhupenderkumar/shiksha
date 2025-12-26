#!/bin/bash
# Shiksha Database Migration Script
# Exports data from Supabase cloud and imports to self-hosted Docker instance
# 
# USAGE:
#   1. Get your database connection string from Supabase Dashboard:
#      - Go to https://supabase.com/dashboard/project/ytfzqzjuhcdgcvvqihda/settings/database
#      - Find "Connection string" section
#      - Copy the "Direct connection" URI (not Supavisor/Pooler)
#      - It looks like: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
#
#   2. Run this script:
#      ./docker/scripts/migrate-from-cloud.sh "YOUR_CONNECTION_STRING"
#
# EXAMPLE:
#   ./docker/scripts/migrate-from-cloud.sh "postgresql://postgres.ytfzqzjuhcdgcvvqihda:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Shiksha Database Migration Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check for connection string argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide your Supabase database connection string as an argument${NC}"
    echo ""
    echo -e "${CYAN}To get your connection string:${NC}"
    echo "  1. Go to: https://supabase.com/dashboard/project/ytfzqzjuhcdgcvvqihda/settings/database"
    echo "  2. Find 'Connection string' section"
    echo "  3. Click 'Direct connection' (NOT Supavisor/Pooler)"
    echo "  4. Copy the URI and replace [YOUR-PASSWORD] with your actual password"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo '  ./docker/scripts/migrate-from-cloud.sh "postgresql://postgres.[REF]:[PASSWORD]@aws-0-....pooler.supabase.com:5432/postgres"'
    exit 1
fi

SUPABASE_DB_URL="$1"

# Load Docker environment
if [ -f "$(dirname "$0")/../.env" ]; then
    source "$(dirname "$0")/../.env"
fi

# Set Docker DB URL
DOCKER_DB_URL="postgres://postgres:${POSTGRES_PASSWORD:-RRW6sNmuhCtFzJ2uPLQxlkvk}@localhost:5432/postgres"

# Add libpq to PATH if installed via Homebrew
if [ -d "/opt/homebrew/opt/libpq/bin" ]; then
    export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
fi

# Check for pg_dump
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump not found${NC}"
    echo "Install PostgreSQL client tools:"
    echo "  brew install libpq && brew link --force libpq"
    exit 1
fi

# Create backup directory
BACKUP_DIR="$(dirname "$0")/../backups/migration_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "Backup directory: ${CYAN}$BACKUP_DIR${NC}"
echo ""

# Test connection to Supabase
echo -e "${YELLOW}Testing connection to Supabase cloud...${NC}"
if ! psql "$SUPABASE_DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to Supabase database${NC}"
    echo "Please check:"
    echo "  - Your connection string is correct"
    echo "  - Your password is correct"
    echo "  - The database is not paused (check Supabase dashboard)"
    exit 1
fi
echo -e "${GREEN}Connected to Supabase successfully!${NC}"
echo ""

# Test connection to Docker PostgreSQL
echo -e "${YELLOW}Testing connection to Docker PostgreSQL...${NC}"
if ! psql "$DOCKER_DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to Docker PostgreSQL${NC}"
    echo "Please check:"
    echo "  - Docker containers are running (docker compose ps)"
    echo "  - PostgreSQL is healthy"
    exit 1
fi
echo -e "${GREEN}Connected to Docker PostgreSQL successfully!${NC}"
echo ""

# Step 1: Export schema
echo -e "${YELLOW}Step 1: Exporting school schema from Supabase...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --schema=school \
    --schema-only \
    --no-owner \
    --no-privileges \
    -f "$BACKUP_DIR/schema.sql"
echo -e "${GREEN}Schema exported to $BACKUP_DIR/schema.sql${NC}"

# Step 2: Export data
echo -e "${YELLOW}Step 2: Exporting school data from Supabase...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --schema=school \
    --data-only \
    --no-owner \
    --no-privileges \
    -f "$BACKUP_DIR/data.sql"
echo -e "${GREEN}Data exported to $BACKUP_DIR/data.sql${NC}"

# Step 3: Export auth users (optional, may fail due to permissions)
echo -e "${YELLOW}Step 3: Exporting auth.users (if permissions allow)...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --schema=auth \
    --data-only \
    --no-owner \
    --no-privileges \
    --table=auth.users \
    -f "$BACKUP_DIR/auth_users.sql" 2>/dev/null || echo -e "${YELLOW}Auth users export skipped (requires admin access)${NC}"

# Step 4: Create school schema in Docker
echo -e "${YELLOW}Step 4: Creating school schema in Docker PostgreSQL...${NC}"
psql "$DOCKER_DB_URL" -c "CREATE SCHEMA IF NOT EXISTS school;"
echo -e "${GREEN}Schema created${NC}"

# Step 5: Import schema
echo -e "${YELLOW}Step 5: Importing schema to Docker...${NC}"
psql "$DOCKER_DB_URL" -f "$BACKUP_DIR/schema.sql"
echo -e "${GREEN}Schema imported successfully${NC}"

# Step 6: Import data
echo -e "${YELLOW}Step 6: Importing data to Docker...${NC}"
psql "$DOCKER_DB_URL" -f "$BACKUP_DIR/data.sql"
echo -e "${GREEN}Data imported successfully${NC}"

# Step 7: Import auth users if available
if [ -s "$BACKUP_DIR/auth_users.sql" ]; then
    echo -e "${YELLOW}Step 7: Importing auth users...${NC}"
    psql "$DOCKER_DB_URL" -f "$BACKUP_DIR/auth_users.sql" 2>/dev/null || echo -e "${YELLOW}Auth users import skipped${NC}"
fi

# Step 8: Set up execute_sql function
MIGRATE_SQL="$(dirname "$0")/../migrations/00_execute_sql_function.sql"
if [ -f "$MIGRATE_SQL" ]; then
    echo -e "${YELLOW}Step 8: Setting up execute_sql function...${NC}"
    psql "$DOCKER_DB_URL" -f "$MIGRATE_SQL"
    echo -e "${GREEN}execute_sql function created${NC}"
fi

# Step 9: Configure permissions
echo -e "${YELLOW}Step 9: Setting up permissions...${NC}"
psql "$DOCKER_DB_URL" <<EOF
-- Grant usage on schema to roles
GRANT USAGE ON SCHEMA school TO anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA school TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA school TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA school TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA school TO authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT SELECT ON TABLES TO anon;
EOF
echo -e "${GREEN}Permissions configured${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backup files saved to: ${CYAN}$BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update your .env file to use local Supabase:"
echo "     VITE_SUPABASE_URL=http://localhost:8000"
echo "     VITE_SUPABASE_ANON_KEY=(from docker/.env ANON_KEY)"
echo ""
echo "  2. Start your frontend:"
echo "     npm run dev"
echo ""
echo "  3. Access Supabase Studio:"
echo "     http://localhost:3333"
echo ""
