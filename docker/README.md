# Shiksha Self-Hosted Supabase Docker Setup

This directory contains the Docker configuration for running a self-hosted Supabase instance for the Shiksha School Management System.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node.js 18+ (for key generation)
- PostgreSQL client tools (`psql`, `pg_dump`) for migrations

## Quick Start

### 1. Generate API Keys

```bash
# First, copy the environment example
cp .env.example .env

# Generate a secure JWT secret
openssl rand -base64 32

# Add the JWT secret to .env, then generate API keys
node scripts/generate-keys.js
```

### 2. Update .env File

Edit `.env` and add the generated keys:

```env
JWT_SECRET=your-generated-jwt-secret
ANON_KEY=your-generated-anon-key
SERVICE_ROLE_KEY=your-generated-service-role-key
```

### 3. Start Services

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Start all services
./scripts/start.sh
```

### 4. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| API Gateway (Kong) | http://localhost:8000 | Main Supabase API endpoint |
| Supabase Studio | http://localhost:3333 | Database admin UI |
| PostgreSQL | localhost:5432 | Direct database access |

### 5. Configure React App

Update your project's `.env` file:

```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-generated-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-generated-service-role-key
```

## Migration from Supabase Cloud

### Database Migration

```bash
# Set environment variables
export SUPABASE_DB_URL="postgres://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
export DOCKER_DB_URL="postgres://postgres:your-password@localhost:5432/postgres"

# Run migration
./scripts/migrate-database.sh
```

### Storage Migration

```bash
# Set environment variables
export SUPABASE_PROJECT_REF="your-project-ref"
export SUPABASE_ACCESS_TOKEN="your-access-token"
export DOCKER_SUPABASE_URL="http://localhost:8000"
export DOCKER_SERVICE_ROLE_KEY="your-service-role-key"

# Run migration
./scripts/migrate-storage.sh
```

## Directory Structure

```
docker/
├── docker-compose.yml      # Main Docker Compose configuration
├── .env.example            # Environment variables template
├── .env                    # Your environment variables (not in git)
├── backups/                # Database and storage backups
├── migrations/             # SQL migration files
│   └── 00_execute_sql_function.sql
├── scripts/
│   ├── start.sh           # Start all services
│   ├── stop.sh            # Stop all services
│   ├── generate-keys.js   # Generate Supabase API keys
│   ├── migrate-database.sh # Migrate database from cloud
│   └── migrate-storage.sh  # Migrate storage from cloud
└── volumes/
    ├── db/
    │   └── init/          # Database initialization scripts
    │       ├── 01-init-schema.sql
    │       └── 02-init-storage.sql
    └── kong/
        └── kong.yml       # Kong API Gateway configuration
```

## Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| db | supabase/postgres:15.1.0.117 | 5432 | PostgreSQL database |
| kong | kong:2.8.1 | 8000/8443 | API Gateway |
| auth | supabase/gotrue:v2.99.0 | 9999 | Authentication service |
| rest | postgrest/postgrest:v11.2.0 | 3001 | REST API |
| storage | supabase/storage-api:v0.40.4 | 5000 | File storage |
| studio | supabase/studio:latest | 3333 | Admin UI |
| meta | supabase/postgres-meta:v0.68.0 | 8080 | Postgres metadata |
| realtime | supabase/realtime:v2.25.27 | 4000 | Realtime subscriptions |
| imgproxy | darthsim/imgproxy:v3.8.0 | 5001 | Image transformations |
| postgres-backup | prodrigestivill/postgres-backup-local | - | Automatic backups |

## Backups

Automatic daily backups are configured with:
- **Daily backups**: Kept for 7 days
- **Weekly backups**: Kept for 4 weeks
- **Monthly backups**: Kept for 6 months

Backups are stored in `./backups/` directory.

### Manual Backup

```bash
# Create a manual backup
docker compose exec db pg_dump -U postgres -d postgres --schema=school > backups/manual_backup.sql
```

### Restore from Backup

```bash
# Restore from backup
docker compose exec -T db psql -U postgres -d postgres < backups/your_backup.sql
```

## Stopping Services

```bash
# Stop services (data preserved)
./scripts/stop.sh

# Stop and remove all data (DESTRUCTIVE!)
docker compose down -v
```

## Troubleshooting

### Services won't start

1. Check if Docker is running: `docker info`
2. Check for port conflicts: `lsof -i :8000`
3. View logs: `docker compose logs -f`

### Database connection issues

1. Wait for PostgreSQL to be ready: `docker compose exec db pg_isready`
2. Check database logs: `docker compose logs db`

### Storage issues

1. Verify bucket exists in Studio: http://localhost:3333
2. Check storage logs: `docker compose logs storage`

### Authentication issues

1. Verify API keys are correct in `.env`
2. Check GoTrue logs: `docker compose logs auth`
3. Ensure JWT_SECRET matches between services

## Production Deployment

For production, additional steps are recommended:

1. **Use HTTPS**: Set up Nginx/Caddy reverse proxy with SSL
2. **Secure secrets**: Use a secrets manager
3. **External backups**: Sync backups to cloud storage
4. **Monitoring**: Add Prometheus/Grafana stack
5. **Resource limits**: Configure Docker resource constraints

See the main [SUPABASE_TO_DOCKER_MIGRATION_PLAN.md](../docs/SUPABASE_TO_DOCKER_MIGRATION_PLAN.md) for detailed production recommendations.

## System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 40 GB SSD | 100 GB SSD |

## Support

For issues related to:
- **Supabase self-hosting**: https://supabase.com/docs/guides/self-hosting
- **This project**: Check the main project README or open an issue
