# Generates the Fire TV launcher banner (320x180) and icon (192x192) for your app.
#   powershell -ExecutionPolicy Bypass -File tools/make-banner.ps1 -Title "My App"
# Replace with your own artwork whenever you like: android/app/src/main/res/drawable/{banner,icon}.png
param(
    [string]$Title = 'Web Shell',
    [string]$Background = '#1d2a52',
    [string]$Accent = '#ff9f1c',
    [string]$OutDir = (Join-Path $PSScriptRoot '..\android\app\src\main\res\drawable')
)
Add-Type -AssemblyName System.Drawing

function New-Art([int]$w, [int]$h, [string]$path, [string]$text, [float]$size) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml($Background))
    $bar = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($Accent))
    $g.FillRectangle($bar, 0, $h - [int]($h * 0.06), $w, [int]($h * 0.06))
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
    $font = New-Object System.Drawing.Font 'Segoe UI', $size, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString($text, $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 0, 0, $w, ($h * 0.94)), $fmt)
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

New-Item -ItemType Directory -Force $OutDir | Out-Null
$bannerSize = [Math]::Min(64, [Math]::Floor(560 / [Math]::Max(1, $Title.Length)))
New-Art 320 180 (Join-Path $OutDir 'banner.png') $Title $bannerSize
New-Art 192 192 (Join-Path $OutDir 'icon.png') $Title.Substring(0, 1).ToUpper() 120
Write-Host "Wrote banner.png and icon.png to $OutDir"
