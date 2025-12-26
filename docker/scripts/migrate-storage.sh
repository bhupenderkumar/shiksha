#!/bin/bash
# Shiksha Storage Migration Script
# Downloads files from Supabase Storage and uploads to self-hosted instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Shiksha Storage Migration Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check requirements
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI not found. Installing...${NC}"
    brew install supabase/tap/supabase || npm install -g supabase
fi

# Configuration
BACKUP_DIR="./backups/storage_$(date +%Y%m%d_%H%M%S)"
BUCKETS=("File" "admission-documents")

# Source Supabase (cloud)
SOURCE_PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
SOURCE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"

# Target (self-hosted)
TARGET_URL="${DOCKER_SUPABASE_URL:-http://localhost:8000}"
TARGET_SERVICE_KEY="${DOCKER_SERVICE_ROLE_KEY:-}"

if [ -z "$SOURCE_PROJECT_REF" ] || [ -z "$SOURCE_ACCESS_TOKEN" ]; then
    echo -e "${RED}Error: SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN must be set${NC}"
    echo ""
    echo "To get these values:"
    echo "1. Go to https://supabase.com/dashboard/project/[your-project]/settings/api"
    echo "2. SUPABASE_PROJECT_REF is your project reference ID"
    echo "3. SUPABASE_ACCESS_TOKEN: Go to https://supabase.com/dashboard/account/tokens"
    exit 1
fi

mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Step 1: Downloading files from Supabase cloud...${NC}"

for bucket in "${BUCKETS[@]}"; do
    echo -e "Processing bucket: ${GREEN}$bucket${NC}"
    mkdir -p "$BACKUP_DIR/$bucket"
    
    # Use Supabase CLI to list and download files
    # Note: This is a simplified approach. For large buckets, use pagination
    
    # Alternative: Use the Storage API directly
    curl -s \
        -H "Authorization: Bearer $SOURCE_ACCESS_TOKEN" \
        -H "apikey: $SOURCE_ACCESS_TOKEN" \
        "https://$SOURCE_PROJECT_REF.supabase.co/storage/v1/object/list/$bucket" \
        | jq -r '.[] | .name' 2>/dev/null | while read -r file; do
        
        if [ -n "$file" ] && [ "$file" != "null" ]; then
            echo "  Downloading: $file"
            curl -s \
                -H "Authorization: Bearer $SOURCE_ACCESS_TOKEN" \
                -H "apikey: $SOURCE_ACCESS_TOKEN" \
                "https://$SOURCE_PROJECT_REF.supabase.co/storage/v1/object/public/$bucket/$file" \
                -o "$BACKUP_DIR/$bucket/$file" 2>/dev/null || echo "    Failed to download $file"
        fi
    done
done

echo -e "${GREEN}Files downloaded to $BACKUP_DIR${NC}"

if [ -z "$TARGET_SERVICE_KEY" ]; then
    echo -e "${YELLOW}DOCKER_SERVICE_ROLE_KEY not set. Skipping upload to self-hosted instance.${NC}"
    echo "To upload files later, run:"
    echo "  ./docker/scripts/upload-storage.sh $BACKUP_DIR"
    exit 0
fi

echo -e "${YELLOW}Step 2: Uploading files to self-hosted instance...${NC}"

for bucket in "${BUCKETS[@]}"; do
    echo -e "Uploading to bucket: ${GREEN}$bucket${NC}"
    
    # Create bucket if it doesn't exist
    curl -s -X POST \
        -H "Authorization: Bearer $TARGET_SERVICE_KEY" \
        -H "apikey: $TARGET_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"id\": \"$bucket\", \"name\": \"$bucket\", \"public\": true}" \
        "$TARGET_URL/storage/v1/bucket" 2>/dev/null || true
    
    # Upload files
    if [ -d "$BACKUP_DIR/$bucket" ]; then
        for file in "$BACKUP_DIR/$bucket"/*; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "  Uploading: $filename"
                curl -s -X POST \
                    -H "Authorization: Bearer $TARGET_SERVICE_KEY" \
                    -H "apikey: $TARGET_SERVICE_KEY" \
                    -F "file=@$file" \
                    "$TARGET_URL/storage/v1/object/$bucket/$filename" 2>/dev/null || echo "    Failed to upload $filename"
            fi
        done
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Storage migration completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backup files saved to: ${YELLOW}$BACKUP_DIR${NC}"
