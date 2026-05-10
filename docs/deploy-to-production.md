# Deploy to Production

Fresh VPS → live HTTPS app in ~15 minutes.

## Prerequisites

- A VPS (Ubuntu 22.04+ recommended) with at least 2 CPU / 4 GB RAM
- A domain pointing to your VPS IP
- Docker + Docker Compose installed on the VPS

## 1. Server setup

SSH into your VPS:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin (v2)
sudo apt install -y docker-compose-plugin
```

## 2. Clone and configure

```bash
mkdir -p /opt
cd /opt
git clone <your-repo-url> myapp
cd myapp

# Create production env
cp .env.prod.example .env.prod
nano .env.prod  # or vim
```

Required changes in `.env.prod`:

| Variable | Set to |
|----------|--------|
| `APP_URL` | `https://yourdomain.com` |
| `APP_DOMAIN` | `yourdomain.com` |
| `JWT_SECRET` | `openssl rand -hex 32` (run on server) |
| `SUPER_ADMIN_EMAIL` | Your admin email |
| `SUPER_ADMIN_PASSWORD` | Strong password |
| `POSTGRES_PASSWORD` | Strong DB password |
| `EMAIL_PROVIDER` | `resend`, `sendgrid`, or `smtp` |
| `RESEND_API_KEY` | Your actual API key (if using Resend) |

## 3. Initial SSL certificate

Before Nginx can start with SSL, you need a dummy cert or run certbot first:

```bash
# Create dummy certs so nginx can start
mkdir -p infra/nginx/certs
openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
  -keyout infra/nginx/certs/dummy.key \
  -out infra/nginx/certs/dummy.crt \
  -subj "/CN=localhost"
```

## 4. Start the app

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod up -d
```

Wait ~60 seconds for migrations and builds.

## 5. Issue real SSL certificate

```bash
docker compose -f infra/docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  -d yourdomain.com \
  --agree-tos --no-eff-email -m admin@yourdomain.com
```

Update `infra/nginx/nginx.conf` to use the real cert paths:

```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

Reload Nginx:

```bash
docker compose -f infra/docker-compose.prod.yml exec nginx nginx -s reload
```

## 6. Verify

```bash
# Health check
curl -s https://yourdomain.com/api/health
# Expected: {"status":"ok"}

# Check SSL
curl -vI https://yourdomain.com 2>&1 | grep "subject"
# Expected: subject: CN=yourdomain.com
```

Open `https://yourdomain.com` in your browser. Log in with super admin credentials.

## 7. Automated deploys

After the first deploy, updates are one command:

```bash
./infra/scripts/deploy.sh
```

## 8. Backups

```bash
# Manual backup
./infra/scripts/backup.sh

# Automate daily via cron
crontab -e
# Add: 0 2 * * * /opt/myapp/infra/scripts/backup.sh >> /var/log/myapp-backup.log 2>&1
```

Backups are stored in `/opt/myapp/backups/`. The script keeps the last 7 days.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `502 Bad Gateway` | Check backend health: `docker compose logs backend` |
| SSL not working | Check certbot logs: `docker compose logs certbot` |
| Database errors | Run migrations manually: `docker compose run --rm migrate` |
| Emails not sending | Verify `EMAIL_PROVIDER` and API key in `.env.prod` |
