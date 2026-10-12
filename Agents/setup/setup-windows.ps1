Write-Host "Starting Setup..." -ForegroundColor Cyan
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$QM = Join-Path $RepoRoot "Agents\mcp-servers\quality-metric-mcp"
$WR = Join-Path $RepoRoot "Agents\mcp-servers\writing-rules-mcp"

Set-Location $QM; npm install; npm install typescript --save-dev; npm run build; Write-Host "Quality Metric MCP built" -ForegroundColor Green
Set-Location $WR; npm install; npm install typescript --save-dev; npm run build; Write-Host "Writing Rules MCP built" -ForegroundColor Green

$Folders = @("$RepoRoot\Output\UserGuide", "$RepoRoot\Output\ReleaseNotes", "$RepoRoot\Output\QualityReports", "$RepoRoot\internal\user-guides", "$RepoRoot\internal\release-notes", "$RepoRoot\internal\quality-reports", "$RepoRoot\docs\user-guides", "$RepoRoot\docs\release-notes")
foreach ($F in $Folders) { New-Item -ItemType Directory -Force -Path $F | Out-Null }
Write-Host "Setup complete!" -ForegroundColor Cyan