$sdkRoot = "C:\AndroidSDK"
if (-not (Test-Path "$sdkRoot\cmdline-tools")) {
    New-Item -ItemType Directory -Force -Path "$sdkRoot\cmdline-tools" | Out-Null
}

Write-Host "Descompactando cmdline-tools.zip..."
Expand-Archive -Path "cmdline-tools.zip" -DestinationPath "$sdkRoot\cmdline-tools" -Force

if (Test-Path "$sdkRoot\cmdline-tools\cmdline-tools") {
    if (Test-Path "$sdkRoot\cmdline-tools\latest") {
        Remove-Item "$sdkRoot\cmdline-tools\latest" -Recurse -Force
    }
    Move-Item -Path "$sdkRoot\cmdline-tools\cmdline-tools" -Destination "$sdkRoot\cmdline-tools\latest" -Force
}

Remove-Item "cmdline-tools.zip" -Force -ErrorAction SilentlyContinue
Write-Host "Android Command Line Tools instalado com sucesso em C:\AndroidSDK!"
