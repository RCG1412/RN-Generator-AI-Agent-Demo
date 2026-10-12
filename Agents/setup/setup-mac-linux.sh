#!/bin/bash
echo "Starting Setup..."
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENTS_DIR="$REPO_ROOT/Agents"
QM_DIR="$AGENTS_DIR/mcp-servers/quality-metric-mcp"
WR_DIR="$AGENTS_DIR/mcp-servers/writing-rules-mcp"

cd "$QM_DIR" && npm install && npm install typescript --save-dev && npm run build && echo "Quality Metric MCP built"
cd "$WR_DIR" && npm install && npm install typescript --save-dev && npm run build && echo "Writing Rules MCP built"

mkdir -p "$REPO_ROOT/Output/UserGuide" "$REPO_ROOT/Output/ReleaseNotes" "$REPO_ROOT/Output/QualityReports"
mkdir -p "$REPO_ROOT/internal/user-guides" "$REPO_ROOT/internal/release-notes" "$REPO_ROOT/internal/quality-reports"
mkdir -p "$REPO_ROOT/docs/user-guides" "$REPO_ROOT/docs/release-notes"
echo "Setup complete!"