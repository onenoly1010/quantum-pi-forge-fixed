# Quantum Resonance Status

## Recent Changes (2026-01-20)

- Added deployment GitHub Actions workflow: `.github/workflows/deploy.yml`
- Added helper scripts in `scripts/`:
  - `deploy-frontend.sh`, `deploy-backend.sh`, `rollback.sh`, `health-check.sh`, `daily-maintenance.sh`
- Hardened `autonomous_ai_nexus.py`: added dry-run, FORCE_ONCHAIN guard, gas estimation, balance checks, and retry/backoff logic
- Added `backend/src/config/cors.js` and `nginx/security_headers.conf`

Branch: `feature/deploy-workflows-hardening`

To run evaluation and health checks locally:

- `npm run health:check`
- `bash scripts/run-evaluation.sh` (requires Python)

If you want me to open the PR and push the branch to remote, confirm and I will proceed. If you prefer, you can review locally and push the branch yourself.
