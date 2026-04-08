# Deploy script for local Obsidian testing
# Usage: .\deploy-local.ps1

param(
    [string]$VaultPath = "C:\Obsidian\AlexanderWaller",
    [switch]$SkipBuild = $false
)

$PluginName = "wpis-plugin-inventar"
$PluginDir = Join-Path $VaultPath ".obsidian\plugins\$PluginName"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  WPIS Plugin-Inventar - Local Deployment Script           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Validate vault path
if (-not (Test-Path $VaultPath)) {
    Write-Host "❌ Vault path not found: $VaultPath" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 Vault: $VaultPath" -ForegroundColor Green
Write-Host ""

# Step 1: Build
if (-not $SkipBuild) {
    Write-Host "📦 Building plugin..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping build (--SkipBuild)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Create plugin directory
Write-Host "📁 Creating plugin directory..." -ForegroundColor Yellow
if (-not (Test-Path $PluginDir)) {
    New-Item -ItemType Directory -Path $PluginDir -Force | Out-Null
    Write-Host "✅ Created: $PluginDir" -ForegroundColor Green
} else {
    Write-Host "✓ Directory exists: $PluginDir" -ForegroundColor Green
}

Write-Host ""

# Step 3: Copy build files
Write-Host "📋 Copying files..." -ForegroundColor Yellow

$Files = @(
    @{ Source = "dist\main.js"; Dest = "$PluginDir\main.js" },
    @{ Source = "manifest.json"; Dest = "$PluginDir\manifest.json" }
)
foreach ($File in $Files) {
    if (Test-Path $File.Source) {
        Copy-Item $File.Source -Destination $File.Dest -Force
        Write-Host "  ✅ $(Split-Path $File.Source -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ File not found: $($File.Source)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 4: Verify
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow

$mainJs = Join-Path $PluginDir "main.js"
$manifestJson = Join-Path $PluginDir "manifest.json"

$mainSize = (Get-Item $mainJs).Length
$manifestSize = (Get-Item $manifestJson).Length

Write-Host "  ✅ main.js ($(($mainSize/1KB).ToString('F1')) KB)" -ForegroundColor Green
Write-Host "  ✅ manifest.json ($(($manifestSize/1KB).ToString('F1')) KB)" -ForegroundColor Green

Write-Host ""

# Step 5: Instructions
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Next Steps                                               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Reload Obsidian:" -ForegroundColor Yellow
Write-Host "   • Close Obsidian completely"
Write-Host "   • Reopen Obsidian"
Write-Host "   OR press Ctrl+R inside Obsidian"
Write-Host ""
Write-Host "2️⃣  Enable the plugin:" -ForegroundColor Yellow
Write-Host "   • Settings → Community Plugins"
Write-Host "   • Search for 'Plugin Inventar'"
Write-Host "   • Click Enable"
Write-Host ""
Write-Host "3️⃣  Test the plugin:" -ForegroundColor Yellow
Write-Host "   • Open Command Palette (Ctrl+P)"
Write-Host "   • Run: 'Plugin Inventar: Manual Update'"
Write-Host "   • Check: $VaultPath\System\Plugin-Inventar\<VaultName>_<DeviceName>.md"
Write-Host ""
Write-Host "4️⃣  View logs:" -ForegroundColor Yellow
Write-Host "   • In Obsidian: Ctrl+Shift+I (Developer Console)"
Write-Host "   • Look for: 'Plugin Inventar loaded'"
Write-Host ""

Write-Host "✨ Deployment complete! Reload Obsidian now." -ForegroundColor Green
Write-Host ""
