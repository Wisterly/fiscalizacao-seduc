$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot"
$sdkManager = "C:\AndroidSDK\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "Aceitando licenças..."
@("y","y","y","y","y","y","y","y","y","y") | & $sdkManager --sdk_root="C:\AndroidSDK" --licenses

Write-Host "Instalando platforms;android-34, build-tools;34.0.0 e platform-tools..."
& $sdkManager --sdk_root="C:\AndroidSDK" "platforms;android-34" "build-tools;34.0.0" "platform-tools"
Write-Host "Pacotes do Android SDK instalados com sucesso!"
