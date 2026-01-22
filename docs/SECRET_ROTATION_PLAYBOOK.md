# Secret Rotation Playbook

This document helps you rotate and revoke exposed secrets safely and (optionally) programmatically.

Important: Do **not** paste secrets into chat. Run the provided scripts locally or on a secure CI runner with admin tokens set as environment variables.

## 1. High-level steps
1. **Detect** exposed secrets in working tree and history (run `bash scripts/scan-secrets.sh`).
2. **Rotate** secrets at provider dashboards or via management APIs. Providers below include commands and links.
3. **Update** deployment secrets (Vercel, Railway, GitHub repo secrets) with new values.
4. **Verify** new keys work by running tests/evaluation or health checks.
5. **Purge** secrets from git history (we will run git-filter-repo mirror rewrite after rotation).

---

## 2. Provider-specific instructions

### OpenAI
- Manual: https://platform.openai.com/account/api-keys -> Revoke old keys, create new key.
- After creating new key: update `OPENAI_API_KEY` secrets in Vercel/Railway/GitHub.

### xAI / Anthropic / Other AI Providers
- Use provider dashboard to rotate keys. If they provide a management API, consult their docs.

### Vercel
- Rotate via Vercel Dashboard -> Settings -> Tokens.
- API (requires VERCEL_MANAGEMENT_TOKEN): Use Vercel REST API to create a new token. Update `VERCEL_TOKEN` in CI/GitHub Secrets afterwards.

### Railway
- Use Railway Dashboard or CLI (`railway env set`) to replace variables. If you have `RAILWAY_TOKEN`, you can script it.

### Alchemy
- Rotate through Alchemy Dashboard (https://dashboard.alchemy.com).

### Sponsor Private Key (critical)
- Generate new wallet locally:

```python
from eth_account import Account
acct = Account.create()
print(acct.address)
print(acct.key.hex())
```

- Transfer funds from old sponsor to new sponsor, update deployments (Vercel/Railway/GitHub) with the new private key, and revoke the old private key locally.

### GitHub Repo Secrets
- Use the `gh` CLI: `echo "$NEW_OPENAI_KEY" | gh secret set OPENAI_API_KEY -R owner/repo` (requires `gh auth login` and a token with repo admin rights).

---

## 3. Automation helpers (what we added)
- `scripts/scan-secrets.sh`: finds probable secret patterns in the working tree and commits (run locally in a Bash environment).
- `scripts/rotate-assist.sh --scan`: generates `tmp/rotation_checklist.md` with per-provider instructions.
- `scripts/rotate-assist.sh --apply-set-github`: helper to SET GitHub repo secrets from environment variables (requires `GH_TOKEN` and `gh` CLI).

> Note: Some provider rotations cannot be fully automated due to provider limitations or lack of management API; in those cases the script prints next steps and links.

---

## 4. After rotation: purge history (mirror-based rewrite)
1. Confirm rotation complete.
2. I will perform a mirror-based rewrite using `git-filter-repo --sensitive-data-removal` to remove leaked secrets from *all refs* and force-push the cleaned history (this is destructive; collaborators must re-clone).

---

## 5. Checklist before requesting me to run the purge
- [ ] New keys have been created and tested in deployments.
- [ ] Old keys have been revoked at provider dashboards.
- [ ] `GH_TOKEN` set locally (for automating GitHub secrets if desired).
- [ ] You confirm you want the destructive rewrite to proceed.

If you want, I can automate parts of this for you — tell me which providers you want rotated and whether you can provide management tokens as environment variables on your machine or in the CI runner.
