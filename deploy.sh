#!/bin/bash
# Deploy script for finance.maiyuri.com
# Usage: ./deploy.sh

set -e

REMOTE_HOST="u643284018@in-mum-web1871.main-hosting.eu"
REMOTE_PORT="65002"
REMOTE_PATH="domains/finance.maiyuri.com/public_html"
LOCAL_DIST="./dist"

echo "🔨 Building..."
npm run build

echo "📤 Deploying to Hostinger..."
rsync -avz --delete \
  -e "ssh -p $REMOTE_PORT" \
  "$LOCAL_DIST/" \
  "$REMOTE_HOST:$REMOTE_PATH/"

echo "✅ Deployed successfully!"
echo "🌐 Visit: https://finance.maiyuri.com"
