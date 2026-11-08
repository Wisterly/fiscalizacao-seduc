Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "Fiscal.IA.apk" -Force

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path "Fiscal.IA.apk"))
$entry = $zip.GetEntry("AndroidManifest.xml")
$stream = $entry.Open()
$bytes = New-Object byte[] $entry.Length
$read = $stream.Read($bytes, 0, $bytes.Length)
$stream.Close()

$arscEntry = $zip.GetEntry("resources.arsc")
$arscStream = $arscEntry.Open()
$arscBytes = New-Object byte[] $arscEntry.Length
$arscRead = $arscStream.Read($arscBytes, 0, $arscBytes.Length)
$arscStream.Close()

$zip.Dispose()

$manifestUtf16 = [System.Text.Encoding]::Unicode.GetString($bytes)
$manifestUtf8 = [System.Text.Encoding]::UTF8.GetString($bytes)
$arscUtf8 = [System.Text.Encoding]::UTF8.GetString($arscBytes)

Write-Host "Manifest tem 'br.com.gprlab.fiscalia':" ($manifestUtf16.Contains("br.com.gprlab.fiscalia") -or $manifestUtf8.Contains("br.com.gprlab.fiscalia"))
Write-Host "Manifest tem 'kyro':" ($manifestUtf16.Contains("kyro") -or $manifestUtf8.Contains("kyro"))
Write-Host "Resources.arsc tem 'Fiscal.IA':" ($arscUtf8.Contains("Fiscal.IA"))
Write-Host "Resources.arsc tem 'KYRO':" ($arscUtf8.Contains("KYRO"))
