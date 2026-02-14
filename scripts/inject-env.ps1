# Script PowerShell d'injection des variables d'environnement Vercel
# dans environment.prod.ts au moment du build

$ErrorActionPreference = "Stop"

Write-Host "🔧 Injection des variables d'environnement..." -ForegroundColor Cyan

# Lecture des variables d'environnement Vercel (avec valeurs par défaut)
$comingSoon = if ($env:COMING_SOON -eq 'false') { 'false' } else { 'true' }
$useMockData = if ($env:USE_MOCK_DATA -eq 'true') { 'true' } else { 'false' }

Write-Host "   COMING_SOON: $comingSoon (raw: '$env:COMING_SOON')" -ForegroundColor Yellow
Write-Host "   USE_MOCK_DATA: $useMockData (raw: '$env:USE_MOCK_DATA')" -ForegroundColor Yellow

# Génération du contenu du fichier environment.prod.ts
$envContent = @"
export const environment = {
  production: true,
  
  // Coming Soon Mode - Géré par variable Vercel COMING_SOON
  comingSoon: $comingSoon,
  
  // Configuration API KEPLER (via proxy Vercel)
  keplerVO: {
    apiUrl: '/api',  // Pointe vers le proxy Vercel (même domaine)
    timeout: 10000,
    cacheDuration: 600000,  // 10 minutes en production
    useMockData: $useMockData  // Géré par variable Vercel USE_MOCK_DATA
  }
};
"@

# Chemin du fichier cible
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetPath = Join-Path $scriptDir "..\src\environments\environment.prod.ts"
$targetPath = [System.IO.Path]::GetFullPath($targetPath)

Write-Host "📝 Écriture dans: $targetPath" -ForegroundColor Yellow

# Écriture du fichier
Set-Content -Path $targetPath -Value $envContent -Encoding UTF8

Write-Host "✅ Fichier environment.prod.ts généré avec succès" -ForegroundColor Green
