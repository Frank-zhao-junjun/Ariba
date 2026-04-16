@echo off
setlocal
set "ROOT=%~dp0"

if /I "%1"=="verify" goto verify
if /I "%1"=="deploy" goto deploy

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root = (Resolve-Path '%ROOT%').Path;" ^
  "$prd = Get-Content -LiteralPath (Join-Path $root 'prd.json') -Raw | ConvertFrom-Json;" ^
  "$stories = @($prd.stories);" ^
  "$completed = @{}; foreach ($story in $stories) { $completed[$story.id] = [bool]$story.passes };" ^
  "$next = $stories | Where-Object { -not $_.passes -and (@($_.dependsOn) | Where-Object { -not $completed[$_] }).Count -eq 0 } | Sort-Object priority, id | Select-Object -First 1;" ^
  "if (-not $next) { Write-Host 'All Ralph stories are complete.'; exit 0 };" ^
  "Write-Host ('Next story: ' + $next.id + ' | ' + $next.title);" ^
  "Write-Host ('User story: ' + $next.userStory);" ^
  "Write-Host 'Acceptance:'; $next.acceptance | ForEach-Object { Write-Host (' - ' + $_) };" ^
  "Write-Host 'Verification:'; $next.testPlan | ForEach-Object { Write-Host (' - ' + $_) }"
exit /b %errorlevel%

:verify
pushd "%ROOT%"
call pnpm lint .
if errorlevel 1 exit /b %errorlevel%
call pnpm ts-check
if errorlevel 1 exit /b %errorlevel%
call pnpm exec next build
exit /b %errorlevel%

:deploy
pushd "%ROOT%"
call pnpm exec next build
if errorlevel 1 exit /b %errorlevel%
call pnpm exec next start --port 5000
exit /b %errorlevel%