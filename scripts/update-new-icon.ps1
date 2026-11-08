Add-Type -AssemblyName System.Drawing

$srcImage = "C:\Users\Lenovo\.gemini\antigravity\brain\441c7017-df81-483b-8f38-c612b1516008\.user_uploaded\media_1794128266844_41eda467.jpg"
$publicDir = Resolve-Path "public"
$resDir = Resolve-Path "android\app\src\main\res"

# Copiar a imagem nova para a pasta public
Copy-Item $srcImage "$publicDir\app-icon.png" -Force
Copy-Item $srcImage "$publicDir\favicon.png" -Force

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
    Write-Host "Ícone gerado: $targetPath ($width x $height)"
}

# Redimensionar para todas as densidades Android
Resize-Image $srcImage "$resDir\mipmap-mdpi\ic_launcher.png" 48 48
Resize-Image $srcImage "$resDir\mipmap-mdpi\ic_launcher_round.png" 48 48
Resize-Image $srcImage "$resDir\mipmap-hdpi\ic_launcher.png" 72 72
Resize-Image $srcImage "$resDir\mipmap-hdpi\ic_launcher_round.png" 72 72
Resize-Image $srcImage "$resDir\mipmap-xhdpi\ic_launcher.png" 96 96
Resize-Image $srcImage "$resDir\mipmap-xhdpi\ic_launcher_round.png" 96 96
Resize-Image $srcImage "$resDir\mipmap-xxhdpi\ic_launcher.png" 144 144
Resize-Image $srcImage "$resDir\mipmap-xxhdpi\ic_launcher_round.png" 144 144
Resize-Image $srcImage "$resDir\mipmap-xxxhdpi\ic_launcher.png" 192 192
Resize-Image $srcImage "$resDir\mipmap-xxxhdpi\ic_launcher_round.png" 192 192

# Splash
Resize-Image $srcImage "$resDir\drawable\splash.png" 512 512

Write-Host "Novo ícone 3D oficial com capacete SEDUC Piauí aplicado em todas as densidades!"
