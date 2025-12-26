#!/bin/bash
# Shiksha Self-Hosted Supabase Stop Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

echo "Stopping Shiksha Self-Hosted Supabase..."
cd "$DOCKER_DIR"
docker compose down

echo "Services stopped."
echo ""
echo "To remove all data (WARNING: This is destructive!):"
echo "  docker compose down -v"
