# 🎯 Shiksha - Quick Deployment Reference Card

## SSH Connection

```bash
# First time: Set key permissions (Mac/Linux)
mv ~/Downloads/ssh-key-*.key ~/.ssh/oracle-shiksha.key
chmod 400 ~/.ssh/oracle-shiksha.key

# Connect to Oracle Cloud VM
ssh -i ~/.ssh/oracle-shiksha.key ubuntu@YOUR_SERVER_IP
```

## First Time Setup (on Oracle Server)

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# 4. Install Docker Compose
sudo apt install docker-compose-plugin -y

# 5. Clone repository
git clone https://github.com/YOUR_USERNAME/shiksha.git ~/shiksha
cd ~/shiksha/docker

# 6. Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 7. Open firewall ports (iptables)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3333 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo apt install iptables-persistent -y
sudo netfilter-persistent save

# 8. Start services
docker compose up -d

# 9. Verify
docker compose ps
```

## Environment Variables Quick Reference

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `API_EXTERNAL_URL` | `http://YOUR_IP:8000` | Supabase API URL |
| `SITE_URL` | `http://YOUR_IP:3000` | Frontend URL |
| `JWT_SECRET` | 32+ char random string | Token signing secret |
| `POSTGRES_PASSWORD` | Strong password | Database password |
| `ANON_KEY` | JWT token | Public API key |
| `SERVICE_ROLE_KEY` | JWT token | Admin API key |
| `SMTP_HOST` | `smtp.gmail.com` | Email server |
| `SMTP_USER` | `your@gmail.com` | Email username |
| `SMTP_PASS` | 16-char App Password | Gmail App Password |

## Service URLs

| Service | Port | URL |
|---------|------|-----|
| Supabase API | 8000 | `http://YOUR_IP:8000` |
| Supabase Studio | 3333 | `http://YOUR_IP:3333` |
| Frontend App | 3000 | `http://YOUR_IP:3000` |
| PostgreSQL | 5432 | Direct DB access |

## Essential Commands

```bash
cd ~/shiksha/docker

# Check status
docker compose ps

# View logs (Ctrl+C to exit)
docker compose logs -f

# View specific service logs
docker compose logs -f auth
docker compose logs -f db

# Restart all services
docker compose restart

# Restart specific service
docker compose restart auth

# Stop all
docker compose down

# Start all
docker compose up -d

# Rebuild and start
docker compose up -d --build
```

## Database Commands

```bash
# Connect to PostgreSQL
docker exec -it shiksha-db psql -U postgres

# Run SQL query
docker exec -it shiksha-db psql -U postgres -c "SELECT COUNT(*) FROM school.\"Student\";"

# List tables
docker exec -it shiksha-db psql -U postgres -c "\dt school.*"

# Backup database
docker exec shiksha-db pg_dump -U postgres postgres > ~/backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i shiksha-db psql -U postgres -d postgres < ~/backup_file.sql
```

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Cannot access ports from browser | Check Oracle Security List + iptables |
| Docker permission denied | `newgrp docker` or logout/login |
| Service keeps restarting | `docker compose logs <service>` |
| Database connection refused | `docker compose restart db` |
| Storage upload fails | `docker compose restart storage` |

## Files Location on Server

| Description | Path |
|-------------|------|
| Docker Compose | `~/shiksha/docker/docker-compose.yml` |
| Docker Environment | `~/shiksha/docker/.env` |
| Frontend Environment | `~/shiksha/.env` |
| Backups folder | `~/shiksha/docker/backups/` |
| Scripts | `~/shiksha/docker/scripts/` |

## Oracle Cloud Security List Ports

Add these Ingress Rules in Oracle Console:

| Port | Protocol | Description |
|------|----------|-------------|
| 22 | TCP | SSH (default) |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 3000 | TCP | Frontend |
| 3333 | TCP | Studio |
| 8000 | TCP | API Gateway |

## Generate Secrets

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Database Password
openssl rand -base64 24

# For Supabase API keys, use the Supabase JWT generator:
# https://supabase.com/docs/guides/self-hosting#api-keys
```

## Update Application

```bash
cd ~/shiksha
git pull origin main
cd docker
docker compose down
docker compose pull
docker compose up -d --build
```

## Backup Automation

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM:
0 2 * * * docker exec shiksha-db pg_dump -U postgres postgres > /home/ubuntu/backups/backup_$(date +\%Y\%m\%d).sql 2>&1

# Add cleanup of backups older than 7 days:
0 3 * * * find /home/ubuntu/backups -name "backup_*.sql" -mtime +7 -delete
```

---

📖 **Full Guide**: [ORACLE_CLOUD_DEPLOYMENT.md](ORACLE_CLOUD_DEPLOYMENT.md)
