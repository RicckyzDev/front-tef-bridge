# Script para criar icone do TEF Bridge
Add-Type -AssemblyName System.Drawing

$iconDir = "C:\Users\rickm\Documents\front-tef-bridge\src-tauri\icons"
if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

$bmp = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(102, 126, 234))
$g.FillRectangle($brush, 0, 0, 1024, 1024)

$font = New-Object System.Drawing.Font("Segoe UI", 500, [System.Drawing.FontStyle]::Bold)
$textBrush = [System.Drawing.Brushes]::White
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF(0, 0, 1024, 1024)
$g.DrawString("T", $font, $textBrush, $rect, $sf)

$bmp.Save("$iconDir\icon.png")
$g.Dispose()
$bmp.Dispose()

Write-Host "Icone criado em: $iconDir\icon.png"

