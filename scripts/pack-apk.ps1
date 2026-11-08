Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceItem = Get-Item "C:\Users\Lenovo\Documents\antigravity\*Finan*\KYRO-Finance.apk"
$destApk = Join-Path (Get-Location) "Fiscalizacao-SEDUC.apk"
Copy-Item $sourceItem.FullName $destApk -Force

$zip = [System.IO.Compression.ZipFile]::Open($destApk, [System.IO.Compression.ZipArchiveMode]::Update)
$entriesToRemove = @($zip.Entries | Where-Object { $_.FullName.StartsWith("assets/public/") })
foreach ($entry in $entriesToRemove) {
    $entry.Delete()
}

$distDir = Resolve-Path "dist"
$distFiles = Get-ChildItem -Path $distDir -Recurse -File
foreach ($file in $distFiles) {
    $relPath = $file.FullName.Substring($distDir.Path.Length + 1).Replace('\', '/')
    $targetEntryName = "assets/public/" + $relPath
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $targetEntryName)
}
$zip.Dispose()
Write-Output "APK Fiscalizacao-SEDUC.apk gerado com sucesso!"
