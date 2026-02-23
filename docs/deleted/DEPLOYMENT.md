# Deployment Guide (Archived)

> **Archived**: Duplicate of `docs/VERCEL-DEPLOYMENT-GUIDE.md` and `deployment/` folder.
> Use `docs/VERCEL-DEPLOYMENT-GUIDE.md` for active deployment instructions.

## Quick Reference

### Vercel (One-Click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv&project-name=hedera-mrv-dashboard)

**Important:** Set Root Directory to `vercel-ui`

### Docker
```bash
docker-compose up -d
```
Starts: API (3000), PostgreSQL (5432), Redis (6379), Prometheus (9090), Grafana (3001)

### Monitoring URLs
| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Grafana | http://localhost:3001 (admin/admin) |
| Prometheus | http://localhost:9090 |

> See `docs/VERCEL-DEPLOYMENT-GUIDE.md` for the full, current guide.
