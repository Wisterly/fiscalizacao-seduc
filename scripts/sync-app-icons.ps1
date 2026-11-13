Add-Type -AssemblyName System.Drawing

$srcImage = Resolve-Path "public\app-icon.png"
$resDir = Resolve-Path "android\app\src\main\res"

Write-Host "Iniciando atualizacao completa de icones do aplicativo..." -ForegroundColor Cyan

# 1. Atualizar cor de fundo do icone adaptativo para preto (#000000)
$bgXmlContent = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#000000</color>
</resources>
"@
Set-Content -Path "$resDir\values\ic_launcher_background.xml" -Value $bgXmlContent -Encoding UTF8
Write-Host "-> ic_launcher_background.xml atualizado para #000000" -ForegroundColor Green

# Funcao para redimensionar imagem simples
function Resize-Image {
    param([string]$sourcePath, [string]$targetPath, [int]$width, [int]$height)
    
    $srcBitmap = [System.Drawing.Image]::FromFile($sourcePath)
    $destBitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($srcBitmap, 0, 0, $width, $height)
    
    $parent = Split-Path -Parent $targetPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    
    $destBitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcBitmap.Dispose()
    Write-Host "Gerado: $targetPath ($width x $height)"
}

# Funcao para gerar icone circular (round) com anti-aliasing
function Resize-RoundImage {
    param([string]$sourcePath, [string]$targetPath, [int]$size)
    
    $srcBitmap = [System.Drawing.Image]::FromFile($sourcePath)
    $destBitmap = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $graphics.SetClip($path)
    $graphics.DrawImage($srcBitmap, 0, 0, $size, $size)
    
    $parent = Split-Path -Parent $targetPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    
    $destBitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $path.Dispose()
    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcBitmap.Dispose()
    Write-Host "Gerado Round: $targetPath ($size x $size)"
}

# Funcao para gerar o Foreground adaptativo (centralizado com margem segura de 72%)
function Generate-AdaptiveForeground {
    param([string]$sourcePath, [string]$targetPath, [int]$canvasSize)
    
    $srcBitmap = [System.Drawing.Image]::FromFile($sourcePath)
    $destBitmap = New-Object System.Drawing.Bitmap $canvasSize, $canvasSize
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Fundo transparente
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # O logo oficial ocupa 72% do canvas central (zona segura estrita do Android)
    $logoSize = [int][Math]::Round($canvasSize * 0.72)
    $offset = [int][Math]::Round(($canvasSize - $logoSize) / 2)
    
    $graphics.DrawImage($srcBitmap, $offset, $offset, $logoSize, $logoSize)
    
    $parent = Split-Path -Parent $targetPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    
    $destBitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcBitmap.Dispose()
    Write-Host "Gerado Adaptive Foreground: $targetPath ($canvasSize x $canvasSize | Logo $logoSize x $logoSize)" -ForegroundColor Yellow
}

# Funcao para Splash Screen com o logo centralizado em fundo #090D16
function Generate-SplashScreen {
    param([string]$sourcePath, [string]$targetPath, [int]$w, [int]$h)
    
    $srcBitmap = [System.Drawing.Image]::FromFile($sourcePath)
    $destBitmap = New-Object System.Drawing.Bitmap $w, $h
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Fundo #090D16
    $bgColor = [System.Drawing.ColorTranslator]::FromHtml("#090D16")
    $bgBrush = New-Object System.Drawing.SolidBrush $bgColor
    $graphics.FillRectangle($bgBrush, 0, 0, $w, $h)
    
    # Tamanho do logo: max 40% da menor dimensao ou 280px
    $minDim = [Math]::Min($w, $h)
    $logoSize = [Math]::Min([int]($minDim * 0.45), 320)
    if ($logoSize -lt 64) { $logoSize = 64 }
    
    $posX = [int](($w - $logoSize) / 2)
    $posY = [int](($h - $logoSize) / 2)
    
    $graphics.DrawImage($srcBitmap, $posX, $posY, $logoSize, $logoSize)
    
    $parent = Split-Path -Parent $targetPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    
    $destBitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bgBrush.Dispose()
    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcBitmap.Dispose()
    Write-Host "Gerado Splash: $targetPath ($w x $h)"
}

# 2. Gerar Adaptive Foreground para todas as densidades (API 26+)
Generate-AdaptiveForeground $srcImage "$resDir\mipmap-mdpi\ic_launcher_foreground.png" 108
Generate-AdaptiveForeground $srcImage "$resDir\mipmap-hdpi\ic_launcher_foreground.png" 162
Generate-AdaptiveForeground $srcImage "$resDir\mipmap-xhdpi\ic_launcher_foreground.png" 216
Generate-AdaptiveForeground $srcImage "$resDir\mipmap-xxhdpi\ic_launcher_foreground.png" 324
Generate-AdaptiveForeground $srcImage "$resDir\mipmap-xxxhdpi\ic_launcher_foreground.png" 432

# 3. Gerar ic_launcher legado para todas as densidades
Resize-Image $srcImage "$resDir\mipmap-mdpi\ic_launcher.png" 48 48
Resize-Image $srcImage "$resDir\mipmap-hdpi\ic_launcher.png" 72 72
Resize-Image $srcImage "$resDir\mipmap-xhdpi\ic_launcher.png" 96 96
Resize-Image $srcImage "$resDir\mipmap-xxhdpi\ic_launcher.png" 144 144
Resize-Image $srcImage "$resDir\mipmap-xxxhdpi\ic_launcher.png" 192 192

# 4. Gerar ic_launcher_round circular para todas as densidades
Resize-RoundImage $srcImage "$resDir\mipmap-mdpi\ic_launcher_round.png" 48
Resize-RoundImage $srcImage "$resDir\mipmap-hdpi\ic_launcher_round.png" 72
Resize-RoundImage $srcImage "$resDir\mipmap-xhdpi\ic_launcher_round.png" 96
Resize-RoundImage $srcImage "$resDir\mipmap-xxhdpi\ic_launcher_round.png" 144
Resize-RoundImage $srcImage "$resDir\mipmap-xxxhdpi\ic_launcher_round.png" 192

# 5. Gerar Splash screens
Resize-Image $srcImage "$resDir\drawable\splash.png" 512 512
Generate-SplashScreen $srcImage "$resDir\drawable-port-mdpi\splash.png" 320 480
Generate-SplashScreen $srcImage "$resDir\drawable-port-hdpi\splash.png" 480 800
Generate-SplashScreen $srcImage "$resDir\drawable-port-xhdpi\splash.png" 720 1280
Generate-SplashScreen $srcImage "$resDir\drawable-port-xxhdpi\splash.png" 960 1600
Generate-SplashScreen $srcImage "$resDir\drawable-port-xxxhdpi\splash.png" 1280 1920

Generate-SplashScreen $srcImage "$resDir\drawable-land-mdpi\splash.png" 480 320
Generate-SplashScreen $srcImage "$resDir\drawable-land-hdpi\splash.png" 800 480
Generate-SplashScreen $srcImage "$resDir\drawable-land-xhdpi\splash.png" 1280 720
Generate-SplashScreen $srcImage "$resDir\drawable-land-xxhdpi\splash.png" 1600 960
Generate-SplashScreen $srcImage "$resDir\drawable-land-xxxhdpi\splash.png" 1920 1280

Write-Host "`nTodas as densidades de icones e splash screens foram sincronizadas com a logo oficial do projeto!" -ForegroundColor Green
