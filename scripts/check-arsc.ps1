Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path "Fiscalizacao-SEDUC.apk"))
$entry = $zip.GetEntry("resources.arsc")
$stream = $entry.Open()
$bytes = New-Object byte[] $entry.Length
$read = $stream.Read($bytes, 0, $bytes.Length)
$stream.Close()
$zip.Dispose()

$utf8 = [System.Text.Encoding]::UTF8.GetString($bytes)
$utf16 = [System.Text.Encoding]::Unicode.GetString($bytes)

Write-Host "UTF8 contains KYRO:" ($utf8.Contains("KYRO"))
Write-Host "UTF16 contains KYRO:" ($utf16.Contains("KYRO"))
Write-Host "UTF8 contains SEDUC:" ($utf8.Contains("SEDUC"))
