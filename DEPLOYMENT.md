# 🚀 Hedera Hydropower MRV - Production Deployment Guide

## 📚 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Security Hardening](#security-hardening)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Hedera Account**: [Get testnet account](https://portal.hedera.com/) (free)
- **Hedera Topic IDs**: Create 2 HCS topics for audit logs and ML models
- **Node.js** 18+ (for local development)
- **PostgreSQL** 15+ (included in Docker Compose)
- **Redis** 7+ (included in Docker Compose)

### Optional
- **Verra API Key**: For carbon credit certification ([Verra Registry](https://registry.verra.org/))
- **Sentry DSN**: For error tracking ([Sentry.io](https://sentry.io/))
- **Slack Webhook**: For alerts ([Slack API](https://api.slack.com/messaging/webhooks))

---

## 📍 Quick Start (Docker)

### 1. Clone Repository

```bash
git clone https://github.com/BikramBiswas786/hedera-hydropower-mrv.git
cd hedera-hydropower-mrv
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env  # or vim/code .env
```

**Minimum required variables:**

```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT
HEDERA_PRIVATE_KEY=302e020100300506032b6570042204...
AUDIT_TOPIC_ID=0.0.YOUR_TOPIC
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 3. Deploy Stack

```bash
docker-compose up -d
```

**Services started:**
- ✅ **API**: http://localhost:3000
- ✅ **Grafana**: http://localhost:3001 (admin/admin)
- ✅ **Prometheus**: http://localhost:9090
- ✅ **PostgreSQL**: localhost:5432
- ✅ **Redis**: localhost:6379

### 4. Verify Deployment

```bash
curl http://localhost:3000/health
# Expected: {"status":"healthy","uptime":123}
```

### 5. Submit First Reading (Test)

```bash
curl -X POST http://localhost:3000/api/reading \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: test-device-key' \
  -d '{
    "deviceId": "HYDRO-001",
    "readings": {
      "flowRate_m3_per_s": 15.5,
      "headHeight_m": 42.0,
      "generatedKwh": 2.8,
      "pH": 7.2,
      "turbidity_ntu": 5.0,
      "temperature_celsius": 18.5
    }
  }'
```

---

## 🛠️ Manual Deployment

### 1. Install Dependencies

```bash
npm install --production
```

### 2. Setup Database

```bash
psql -U postgres -f scripts/init-db.sql
```

### 3. Train ML Model

```bash
npm run ml:train
```

### 4. Start API Server

```bash
npm start
# or with PM2:
pm2 start src/api/server.js --name hedera-mrv
```

---

## ⚙️ Environment Configuration

### Hedera Network

```env
# Testnet (development)
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_TESTNET_ACCOUNT
HEDERA_PRIVATE_KEY=YOUR_TESTNET_PRIVATE_KEY

# Mainnet (production)
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=0.0.YOUR_MAINNET_ACCOUNT
HEDERA_PRIVATE_KEY=YOUR_MAINNET_PRIVATE_KEY
```

### Security Keys

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API key salt
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Carbon Credits

```env
EF_GRID=0.82  # India's grid emission factor (tCO₂/MWh)
VERRA_API_KEY=your-verra-api-key
GOLD_STANDARD_API_KEY=your-gold-standard-key
```

### Monitoring & Alerts

```env
# Slack alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sentry error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## 📊 Monitoring Setup

### Grafana Dashboard

1. **Access Grafana**: http://localhost:3001
2. **Login**: admin / admin
3. **Add Data Source**:
   - Type: Prometheus
   - URL: http://prometheus:9090
4. **Import Dashboard**: `monitoring/grafana/dashboards/mrv-dashboard.json`

### Key Metrics

- **Anomaly Detection Rate**: Anomalies per minute
- **Trust Score Distribution**: Histogram of trust scores
- **HCS Transaction Success**: % successful Hedera transactions
- **API Latency**: p50, p95, p99 response times

### Alerts

Configure in **Prometheus** (`monitoring/prometheus.yml`):

```yaml
rule_files:
  - 'alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

**Example alert** (`alerts.yml`):

```yaml
groups:
  - name: mrv_alerts
    rules:
      - alert: HighAnomalyRate
        expr: rate(mrv_anomalies_detected[5m]) > 0.1
        for: 5m
        annotations:
          summary: "Anomaly rate > 10% for 5 minutes"
```

---

## 🔒 Security Hardening

### Production Checklist

- [ ] **JWT Secret**: Use 256-bit random key (not default)
- [ ] **API Keys**: Hash all device API keys with HMAC-SHA256
- [ ] **Rate Limiting**: Configure appropriate limits per endpoint
- [ ] **CORS**: Restrict to known dashboard domains
- [ ] **HTTPS**: Use SSL/TLS certificates (Let's Encrypt)
- [ ] **Firewall**: Only expose ports 443 (HTTPS) and 3001 (Grafana)
- [ ] **Database**: Use strong passwords, disable remote root access
- [ ] **Backups**: Daily PostgreSQL backups to S3/GCS
- [ ] **Secrets**: Use environment variables, never commit `.env`
- [ ] **Multi-Sig**: Enable 2-of-3 signatures for REC minting

### SSL/TLS Setup (Nginx Reverse Proxy)

```nginx
server {
    listen 443 ssl;
    server_name mrv.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/mrv.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mrv.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📝 API Reference

### Authentication

**JWT Token** (for dashboards):

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

**API Key** (for devices):

```bash
X-API-Key: YOUR_DEVICE_API_KEY
```

### Endpoints

#### Submit Reading

```http
POST /api/reading
Content-Type: application/json
X-API-Key: YOUR_DEVICE_KEY

{
  "deviceId": "HYDRO-001",
  "readings": {
    "flowRate_m3_per_s": 15.5,
    "headHeight_m": 42.0,
    "generatedKwh": 2.8,
    "pH": 7.2,
    "turbidity_ntu": 5.0,
    "temperature_celsius": 18.5
  }
}
```

#### Get Public Metrics (Investor Dashboard)

```http
GET /api/public/metrics

Response:
{
  "realtime": {
    "total_generation_mwh": 12500.5,
    "total_carbon_offset_tco2e": 10.25,
    "uptime_percentage": 98.5
  }
}
```

#### Generate Monthly Report

```http
GET /api/reports/monthly?month=2026-02
Authorization: Bearer JWT_TOKEN

Response:
{
  "period": "2026-02",
  "total_generation_mwh": 3500,
  "total_carbon_credits_tco2e": 2.87,
  "estimated_revenue_usd": 44.48
}
```

---

## 🔧 Troubleshooting

### Docker Containers Not Starting

```bash
# Check logs
docker-compose logs hedera-mrv

# Restart services
docker-compose restart

# Rebuild images
docker-compose up --build -d
```

### Hedera Transaction Failures

**Error**: `INSUFFICIENT_TX_FEE`

**Solution**: Fund your Hedera account with HBAR:

```bash
# Check balance
hedera account balance 0.0.YOUR_ACCOUNT

# Transfer from another account
hedera transfer --from 0.0.X --to 0.0.YOUR_ACCOUNT --amount 10
```

### ML Model Not Loading

```bash
# Retrain model
npm run ml:train

# Verify model file exists
ls -lh ml/model.json
```

### Database Connection Errors

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d hedera_mrv -c "SELECT COUNT(*) FROM devices;"

# Reset database
docker-compose down -v
docker-compose up -d postgres
psql -U postgres -f scripts/init-db.sql
```

### High Memory Usage

**Symptom**: Docker containers using > 4GB RAM

**Solution**: Increase Docker memory limit:

```bash
# Docker Desktop: Settings > Resources > Memory: 8GB

# Or limit per service in docker-compose.yml:
services:
  hedera-mrv:
    mem_limit: 2g
    mem_reservation: 1g
```

---

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/BikramBiswas786/hedera-hydropower-mrv/issues)
- **Email**: support@yourcompany.com
- **Slack**: [Join community](https://slack.yourcompany.com)

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details

---

**⚡ Powered by Hedera | 🌱 Verified Clean Energy | 🔒 Blockchain Security**
