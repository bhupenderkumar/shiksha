#!/bin/bash
# Shiksha Storage File Migration Script
# Downloads files from Supabase cloud and uploads to local Docker storage

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Shiksha Storage Migration Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration
SUPABASE_CLOUD_URL="https://ytfzqzjuhcdgcvvqihda.supabase.co"
SUPABASE_CLOUD_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Znpxemp1aGNkZ2N2dnFpaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwNjM1NjMsImV4cCI6MjA1MTYzOTU2M30.rXjVX0vZwZtD83oztSpcyY6331t6aitjgsvKuTgUzfg"

LOCAL_SUPABASE_URL="http://localhost:8000"
LOCAL_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjY3MzQzMTMsImV4cCI6MjA4MjA5NDMxM30.xGtVqbNIgSxruKLJvVT9GE8cudeaAc3gDSbosy8wmTc"

# Buckets to migrate
BUCKETS=("File" "admission-documents")

# Create temp directory
TEMP_DIR="/tmp/shiksha-storage-migration"
mkdir -p "$TEMP_DIR"

echo -e "${YELLOW}Temporary directory: $TEMP_DIR${NC}"
echo ""

# Function to list files in a bucket from cloud
list_cloud_files() {
    local bucket=$1
    curl -s \
        -H "Authorization: Bearer $SUPABASE_CLOUD_ANON_KEY" \
        -H "apikey: $SUPABASE_CLOUD_ANON_KEY" \
        "$SUPABASE_CLOUD_URL/storage/v1/object/list/$bucket" 2>/dev/null
}

# Function to URL encode a string
urlencode() {
    local string="$1"
    python3 -c "import urllib.parse; print(urllib.parse.quote('$string', safe='/'))"
}

# Function to download file from cloud
download_file() {
    local bucket=$1
    local file_path=$2
    local local_path=$3
    local encoded_path=$(urlencode "$file_path")
    
    mkdir -p "$(dirname "$local_path")"
    curl -s -L \
        -H "Authorization: Bearer $SUPABASE_CLOUD_ANON_KEY" \
        -H "apikey: $SUPABASE_CLOUD_ANON_KEY" \
        "$SUPABASE_CLOUD_URL/storage/v1/object/public/$bucket/$encoded_path" \
        -o "$local_path" 2>/dev/null
}

# Function to upload file to local storage
upload_file() {
    local bucket=$1
    local file_path=$2
    local local_path=$3
    local encoded_path=$(urlencode "$file_path")
    
    curl -s -X POST \
        -H "Authorization: Bearer $LOCAL_SERVICE_KEY" \
        -H "apikey: $LOCAL_SERVICE_KEY" \
        -F "file=@$local_path" \
        "$LOCAL_SUPABASE_URL/storage/v1/object/$bucket/$encoded_path" 2>/dev/null
}

# Get file paths from database
echo -e "${YELLOW}Getting file paths from database...${NC}"
FILE_PATHS=$(/opt/homebrew/opt/libpq/bin/psql "postgres://postgres:RRW6sNmuhCtFzJ2uPLQxlkvk@localhost:5432/postgres" -t -c "SELECT \"filePath\" FROM school.\"File\";" 2>/dev/null | grep -v '^$')

TOTAL_FILES=$(echo "$FILE_PATHS" | wc -l | tr -d ' ')
echo -e "Found ${CYAN}$TOTAL_FILES${NC} files to migrate"
echo ""

# Migrate files
SUCCESS=0
FAILED=0

while IFS= read -r file_path; do
    file_path=$(echo "$file_path" | xargs)  # Trim whitespace
    if [ -z "$file_path" ]; then
        continue
    fi
    
    echo -n "Migrating: $(basename "$file_path")... "
    
    # Download from cloud
    local_file="$TEMP_DIR/$file_path"
    download_file "File" "$file_path" "$local_file"
    
    if [ -f "$local_file" ] && [ -s "$local_file" ]; then
        # Upload to local
        result=$(upload_file "File" "$file_path" "$local_file")
        if echo "$result" | grep -q "error"; then
            echo -e "${RED}FAILED${NC}"
            ((FAILED++))
        else
            echo -e "${GREEN}OK${NC}"
            ((SUCCESS++))
        fi
    else
        echo -e "${RED}DOWNLOAD FAILED${NC}"
        ((FAILED++))
    fi
done <<< "$FILE_PATHS"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Successful: ${GREEN}$SUCCESS${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""
echo -e "${YELLOW}Cleaning up temp directory...${NC}"
rm -rf "$TEMP_DIR"
echo "Done!"
