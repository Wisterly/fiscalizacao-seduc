Add-Type -AssemblyName System.Drawing

function Create-SeducIcon {
    param([int]$size, [string]$outPath)

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Fundo azul-marinho profundo (#090D16)
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#090D16"))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Círculo com borda turquesa sutil (#06B6D4)
    $turqColor = [System.Drawing.ColorTranslator]::FromHtml("#06B6D4")
    $turqPen = New-Object System.Drawing.Pen $turqColor, [float]($size * 0.04)
    $circleMargin = [float]($size * 0.08)
    $circleSize = [float]($size - ($circleMargin * 2))
    $g.DrawEllipse($turqPen, $circleMargin, $circleMargin, $circleSize, $circleSize)

    # Brilho de fundo turquesa translúcido
    $innerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 6, 182, 212))
    $g.FillEllipse($innerBrush, $circleMargin, $circleMargin, $circleSize, $circleSize)

    # Letras "GPR" / "SEDUC"
    $fontFamily = "Arial"
    $fontSize = [float]($size * 0.22)
    $font = New-Object System.Drawing.Font $fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Posição central
    $rect = New-Object System.Drawing.RectangleF 0, [float]($size * 0.28), [float]$size, [float]($size * 0.30)
    $g.DrawString("GPR", $font, $textBrush, $rect, $format)

    # Subtítulo "SEDUC"
    $subFontSize = [float]($size * 0.12)
    $subFont = New-Object System.Drawing.Font $fontFamily, $subFontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel
    $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"))
    $subRect = New-Object System.Drawing.RectangleF 0, [float]($size * 0.58), [float]$size, [float]($size * 0.20)
    $g.DrawString("SEDUC", $subFont, $subBrush, $subRect, $format)

    $parentDir = Split-Path -Parent $outPath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Ícone gerado: $outPath ($size x $size)"
}

# Gerar para todas as densidades Android
$resPath = "android\app\src\main\res"
Create-SeducIcon 48  "$resPath\mipmap-mdpi\ic_launcher.png"
Create-SeducIcon 48  "$resPath\mipmap-mdpi\ic_launcher_round.png"
Create-SeducIcon 72  "$resPath\mipmap-hdpi\ic_launcher.png"
Create-SeducIcon 72  "$resPath\mipmap-hdpi\ic_launcher_round.png"
Create-SeducIcon 96  "$resPath\mipmap-xhdpi\ic_launcher.png"
Create-SeducIcon 96  "$resPath\mipmap-xhdpi\ic_launcher_round.png"
Create-SeducIcon 144 "$resPath\mipmap-xxhdpi\ic_launcher.png"
Create-SeducIcon 144 "$resPath\mipmap-xxhdpi\ic_launcher_round.png"
Create-SeducIcon 192 "$resPath\mipmap-xxxhdpi\ic_launcher.png"
Create-SeducIcon 192 "$resPath\mipmap-xxxhdpi\ic_launcher_round.png"

# Splash screens
Create-SeducIcon 512 "$resPath\drawable\splash.png"

Write-Host "Todos os ícones nativos do Fiscalização SEDUC gerados com sucesso!"
