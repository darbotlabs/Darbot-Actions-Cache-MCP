#!/bin/bash

echo "🧹 Removing old branding references and completing DAR-ACT-Cache rebrand..."

# Files to remove completely (if they exist)
echo "📁 Removing old files..."
rm -f LICENSE.old 2>/dev/null || true
rm -rf docs/content/falcondev 2>/dev/null || true
rm -rf .github/ISSUE_TEMPLATE/old_* 2>/dev/null || true

# Text replacements across all relevant files
echo "🔄 Updating text references..."

# Find and replace in TypeScript, JavaScript, JSON, YAML, and Markdown files
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -not -path "./charts/dar-act-cache/templates/*" \
  -exec sed -i 's/github-actions-cache-server/dar-act-cache/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -not -path "./charts/dar-act-cache/templates/*" \
  -exec sed -i 's/falcondev-oss/darbot/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -not -path "./charts/dar-act-cache/templates/*" \
  -exec sed -i 's/cache-server/dar-act-cache/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -not -path "./charts/dar-act-cache/templates/*" \
  -exec sed -i 's/gha-cache-server/dar-act-cache/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -not -path "./charts/dar-act-cache/templates/*" \
  -exec sed -i 's/GitHub Actions Cache Server/DAR-ACT-Cache/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -not -path "./charts/dar-act-cache/templates/*" \
  -exec sed -i 's/Github Actions Cache Server/DAR-ACT-Cache/g' {} \;

# Environment variable updates
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -exec sed -i 's/API_BASE_URL/DAR_ACT_BASE_URL/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -exec sed -i 's/STORAGE_DRIVER/DAR_ACT_STORAGE_BACKEND/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.tpl" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -exec sed -i 's/DB_DRIVER/DAR_ACT_DB_TYPE/g' {} \;

# Volume name updates
find . -type f \( -name "*.yml" -o -name "*.yaml" -o -name "*.md" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.output/*" \
  -not -path "./docs/node_modules/*" \
  -exec sed -i 's/cache-data/dar-cache-data/g' {} \;

echo "✅ Old branding cleanup complete!"
echo "🎉 DAR-ACT-Cache rebrand is now complete!"
echo ""
echo "📋 Summary of changes:"
echo "   • Package name: @darbot/dar-act-cache"
echo "   • Docker image: ghcr.io/darbot/dar-act-cache"
echo "   • Helm chart: dar-act-cache"
echo "   • CLI commands: darbot-act"
echo "   • Environment variables: DAR_ACT_*"
echo "   • Documentation site: dar-act-cache.darbot.io"
echo ""
echo "🔧 Next steps:"
echo "   1. Run: npm install"
echo "   2. Run: npm run build"
echo "   3. Test: npm run dev"
echo "   4. Update CI/CD pipelines"
echo "   5. Update container registry"
