#!/bin/bash
echo "🚀 Starting AI Documentation Demo Setup..."
echo ""

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENTS_DIR="$REPO_ROOT/Agents"
QUALITY_METRIC_DIR="$AGENTS_DIR/mcp-servers/quality-metric-mcp"
WRITING_RULES_DIR="$AGENTS_DIR/mcp-servers/writing-rules-mcp"

echo "📁 Repository root: $REPO_ROOT"
echo ""

echo "📦 Step 1: Building Quality Metric MCP Server..."
cd "$QUALITY_METRIC_DIR"
if [ ! -d "node_modules" ]; then
    npm install
fi
npx tsc
if [ -f "dist/index.js" ]; then
    echo "   ✅ Quality Metric MCP built successfully!"
else
    echo "   ❌ Build failed."
    exit 1
fi

echo ""
echo "📦 Step 2: Building Writing Rules MCP Server..."
cd "$WRITING_RULES_DIR"
if [ ! -d "node_modules" ]; then
    npm install
fi
npx tsc
if [ -f "dist/index.js" ]; then
    echo "   ✅ Writing Rules MCP built successfully!"
else
    echo "   ❌ Build failed."
    exit 1
fi

echo ""
echo "📁 Step 3: Creating required folders..."
mkdir -p "$REPO_ROOT/Output/UserGuide"
mkdir -p "$REPO_ROOT/Output/ReleaseNotes"
mkdir -p "$REPO_ROOT/Output/QualityReports"
mkdir -p "$REPO_ROOT/internal/user-guides"
mkdir -p "$REPO_ROOT/internal/release-notes"
mkdir -p "$REPO_ROOT/internal/quality-reports"
mkdir -p "$REPO_ROOT/docs/user-guides"
mkdir -p "$REPO_ROOT/docs/release-notes"
echo "   ✅ All folders created."

echo ""
echo "🎉 Setup complete!"
echo ""
echo "MCP Paths to register:"
echo "  Quality Metric: $QUALITY_METRIC_DIR/dist/index.js"
echo "  Writing Rules:  $WRITING_RULES_DIR/dist/index.js"