if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Force -Path "public" | Out-Null
}

$srcImage = "C:\Users\Lenovo\.gemini\antigravity\brain\441c7017-df81-483b-8f38-c612b1516008\.user_uploaded\media_1794127953582_5566b586.jpg"
Copy-Item $srcImage "public\app-icon.png" -Force
Copy-Item $srcImage "public\favicon.png" -Force

$obrasDir = "C:\Users\Lenovo\Documents\antigravity\Controle OBRAS E PACTUE"
Copy-Item "$obrasDir\logo-governo-piaui-seduc.png" "public\logo-seduc-piaui.png" -Force
Copy-Item "$obrasDir\logo-piaui-dark-theme.png" "public\logo-piaui-mapa.png" -Force
Copy-Item "$obrasDir\icone-piaui.png" "public\icone-piaui.png" -Force

Write-Host "Arquivos copiados para public com sucesso!"
Get-ChildItem -Path "public" | Select-Object Name, Length
