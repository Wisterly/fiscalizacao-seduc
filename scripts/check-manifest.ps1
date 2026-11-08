Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path "Fiscalizacao-SEDUC.apk"))
$entry = $zip.GetEntry("AndroidManifest.xml")
$stream = $entry.Open()
$bytes = New-Object byte[] $entry.Length
$read = $stream.Read($bytes, 0, $bytes.Length)
$stream.Close()
$zip.Dispose()

$utf8 = [System.Text.Encoding]::UTF8.GetString($bytes)
$utf16 = [System.Text.Encoding]::Unicode.GetString($bytes)

Write-Host "Manifest UTF8 has kyro:" ($utf8.Contains("kyro"))
Write-Host "Manifest UTF16 has kyro:" ($utf16.Contains("kyro"))
Write-Host "Manifest UTF8 has seduc:" ($utf8.Contains("seduc"))
