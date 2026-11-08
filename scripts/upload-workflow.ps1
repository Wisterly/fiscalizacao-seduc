$content = Get-Content -Raw -Path "_github_backup\workflows\android-build.yml"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$base64 = [Convert]::ToBase64String($bytes)
$body = @{
    message = "ci: adicionar workflow para compilar APK Fiscalização SEDUC"
    content = $base64
} | ConvertTo-Json

$body | gh api --method PUT repos/Wisterly/fiscalizacao-seduc/contents/.github/workflows/android-build.yml --input -
