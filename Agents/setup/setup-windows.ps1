Write-Host "🚀 Starting AI Documentation Demo Setup..." -ForegroundColor Cyan

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$AgentsDir = Join-Path $RepoRoot "Agents"
$QualityMetricDir = Join-Path $AgentsDir "mcp-servers\quality-metric-mcp"
$WritingRulesDir = Join-Path $AgentsDir "mcp-servers\writing-rules-mcp"

Write-Host "📦 Step 1: Building Quality Metric MCP Server..." -ForegroundColor Yellow
Set-Location $QualityMetricDir
if (-not (Test-Path "node_modules")) { npm install }
npx tsc
if (Test-Path "dist\index.js") {
    Write-Host "   ✅ Quality Metric MCP built!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 2: Building Writing Rules MCP Server..." -ForegroundColor Yellow
Set-Location $WritingRulesDir
if (-not (Test-Path "node_modules")) { npm install }
npx tsc
if (Test-Path "dist\index.js") {
    Write-Host "   ✅ Writing Rules MCP built!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Step 3: Creating folders..." -ForegroundColor Yellow
$Folders = @(
    "$RepoRoot\Output\UserGuide",
    "$RepoRoot\Output\ReleaseNotes",
    "$RepoRoot\Output\QualityReports",
    "$RepoRoot\internal\user-guides",
    "$RepoRoot\internal\release-notes",
    "$RepoRoot\internal\quality-reports",
    "$RepoRoot\docs\user-guides",
    "$RepoRoot\docs\release-notes"
)
foreach ($Folder in $Folders) {
    New-Item -ItemType Directory -Force -Path $Folder | Out-Null
}
Write-Host "   ✅ All folders created." -ForegroundColor Green
Write-Host "🎉 Setup complete!" -ForegroundColor Cyan