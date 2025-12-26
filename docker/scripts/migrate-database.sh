#!/bin/bash
# Shiksha Database Migration Script
# Exports data from Supabase cloud and imports to self-hosted Docker instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Shiksha Database Migration Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if required environment variables are set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL is not set${NC}"
    echo "Example: postgres://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
    exit 1
fi

if [ -z "$DOCKER_DB_URL" ]; then
    echo -e "${YELLOW}DOCKER_DB_URL not set, using default localhost${NC}"
    DOCKER_DB_URL="postgres://postgres:your-super-secret-database-password@localhost:5432/postgres"
fi

# Create backup directory
BACKUP_DIR="./backups/migration_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Step 1: Exporting schema from Supabase...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --schema=school \
    --schema-only \
    --no-owner \
    --no-privileges \
    -f "$BACKUP_DIR/schema.sql"
echo -e "${GREEN}Schema exported to $BACKUP_DIR/schema.sql${NC}"

echo -e "${YELLOW}Step 2: Exporting data from Supabase...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --schema=school \
    --data-only \
    --no-owner \
    --no-privileges \
    -f "$BACKUP_DIR/data.sql"
echo -e "${GREEN}Data exported to $BACKUP_DIR/data.sql${NC}"

echo -e "${YELLOW}Step 3: Exporting auth schema (users)...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --schema=auth \
    --data-only \
    --no-owner \
    --no-privileges \
    --table=auth.users \
    -f "$BACKUP_DIR/auth_users.sql" 2>/dev/null || echo -e "${YELLOW}Auth users export skipped (requires admin access)${NC}"

echo -e "${YELLOW}Step 4: Creating school schema in Docker PostgreSQL...${NC}"
psql "$DOCKER_DB_URL" -c "CREATE SCHEMA IF NOT EXISTS school;"

echo -e "${YELLOW}Step 5: Importing schema to Docker...${NC}"
psql "$DOCKER_DB_URL" -f "$BACKUP_DIR/schema.sql"
echo -e "${GREEN}Schema imported successfully${NC}"

echo -e "${YELLOW}Step 6: Importing data to Docker...${NC}"
psql "$DOCKER_DB_URL" -f "$BACKUP_DIR/data.sql"
echo -e "${GREEN}Data imported successfully${NC}"

echo -e "${YELLOW}Step 7: Setting up execute_sql function...${NC}"
psql "$DOCKER_DB_URL" -f "./docker/migrations/00_execute_sql_function.sql"
echo -e "${GREEN}execute_sql function created${NC}"

echo -e "${YELLOW}Step 8: Setting up permissions...${NC}"
psql "$DOCKER_DB_URL" <<EOF
-- Grant usage on schema to roles
GRANT USAGE ON SCHEMA school TO anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA school TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA school TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA school TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA school TO authenticated, service_role;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT SELECT ON TABLES TO anon;
EOF
echo -e "${GREEN}Permissions configured${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backup files saved to: ${YELLOW}$BACKUP_DIR${NC}"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the new VITE_SUPABASE_URL"
echo "2. Migrate storage files (see migrate-storage.sh)"
echo "3. Test the application"
