Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path "Fiscalizacao-SEDUC.apk"))
$entries = $zip.Entries | Where-Object { $_.FullName -like "*.png" -or $_.FullName -like "*.xml" } | Select-Object -ExpandProperty FullName
$zip.Dispose()
$entries
