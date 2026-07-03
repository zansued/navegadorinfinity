# Script de Geração de Certificado e Assinatura Digital do Executável
# Executar este script no PowerShell como Administrador na máquina de desenvolvimento

$ErrorActionPreference = "Stop"

# Define o nome do certificado
$certSubject = "CN=Infinity AI, O=Infinity AI, C=BR"
$certFriendlyName = "Infinity AI Code Signing"

Write-Host "=== Assinatura Digital - Infinity AI ===" -ForegroundColor Green
Write-Host ""

# 1. Verifica se o certificado já existe no repositório pessoal do usuário
$cert = Get-ChildItem -Path Cert:\CurrentUser\My | Where-Object { $_.Subject -like "*$certSubject*" } | Select-Object -First 1

if (-not $cert) {
    Write-Host "[*] Criando novo certificado de assinatura de código autoassinado..." -ForegroundColor Cyan
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject $certSubject -FriendlyName $certFriendlyName -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(5)
    Write-Host "[+] Certificado criado com sucesso! Válido por 5 anos." -ForegroundColor Green
} else {
    Write-Host "[+] Certificado existente localizado no repositório." -ForegroundColor Green
}

Write-Host "Thumbprint do Certificado: $($cert.Thumbprint)" -ForegroundColor Gray
Write-Host ""

# 2. Exporta a parte pública do certificado para distribuição (.cer)
$cerPath = Join-Path $PSScriptRoot "infinity_ai.cer"
Write-Host "[*] Exportando chave pública do certificado para: $cerPath..." -ForegroundColor Cyan
Export-Certificate -Cert $cert -FilePath $cerPath -Force | Out-Null
Write-Host "[+] Chave pública exportada com sucesso!" -ForegroundColor Green
Write-Host ""

# 3. Assina o executável "Abrir Navegador.exe"
$exePath = Join-Path $PSScriptRoot "Abrir Navegador.exe"
if (Test-Path $exePath) {
    Write-Host "[*] Assinando digitalmente o executável: $exePath..." -ForegroundColor Cyan
    
    # Assina usando o Set-AuthenticodeSignature nativo do PowerShell
    $sig = Set-AuthenticodeSignature -FilePath $exePath -Certificate $cert -HashAlgorithm SHA256 -TimestampServer "http://timestamp.digicert.com"
    
    if ($sig.Status -eq "Valid") {
        Write-Host "[+] Executável assinado com sucesso e verificado!" -ForegroundColor Green
    } else {
        Write-Host "[-] Falha ao assinar. Status da assinatura: $($sig.Status)" -ForegroundColor Red
        # Tenta assinar sem timestamp caso o servidor de timestamp esteja inacessível
        Write-Host "[*] Tentando assinar sem servidor de timestamp..." -ForegroundColor Yellow
        $sigFallback = Set-AuthenticodeSignature -FilePath $exePath -Certificate $cert -HashAlgorithm SHA256
        if ($sigFallback.Status -eq "Valid") {
            Write-Host "[+] Executável assinado com sucesso (sem timestamp)!" -ForegroundColor Green
        } else {
            Write-Host "[ERRO] Falha crítica ao aplicar assinatura: $($sigFallback.Status)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "[AVISO] Executável '$exePath' não foi encontrado para assinatura." -ForegroundColor Yellow
    Write-Host "Certifique-se de compilar o executável com PyInstaller antes de rodar este script." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Processo Concluído ===" -ForegroundColor Green
