#!/usr/bin/env bash
# Deploy ccm-stakeholder-map to Cloudflare Pages (personal account)
set -euo pipefail
cd "$(dirname "$0")"

export CLOUDFLARE_API_TOKEN=$(pass show claude/api/cloudflare-full)
export CLOUDFLARE_ACCOUNT_ID="3d4b1d36109e30866bb7516502224b2c"

COMMIT_MSG=$(git log -1 --format="%h %s" 2>/dev/null || echo "manual deploy")
echo "Deploying ccm-stakeholder-map..."
echo "Commit: $COMMIT_MSG"

# Clear wrangler account cache (prevents cross-account contamination)
rm -f "$HOME/node_modules/.cache/wrangler/wrangler-account.json" "$HOME/node_modules/.cache/wrangler/pages.json" 2>/dev/null

npx wrangler pages deploy docs \
  --project-name=ccm-stakeholder-map \
  --branch=main \
  --commit-message="$COMMIT_MSG" --commit-dirty=true

echo "Done: https://ccm-stakeholder-map.pages.dev"
