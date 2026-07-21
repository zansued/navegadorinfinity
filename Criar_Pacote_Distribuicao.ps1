# Script para Criar Pacote de Distribuição Limpo - Infinity AI
# Este script cria um arquivo ZIP contendo apenas os arquivos necessários para os clientes.
# Ele remove arquivos de código fonte, pastas de testes, perfis privados e scripts de admin.

$ErrorActionPreference = "Stop"

# Define caminhos
$sourceDir = $PSScriptRoot
$stagingDir = Join-Path $sourceDir "dist_staging"
$zipPathLeve = Join-Path $sourceDir "Infinity_AI_Cliente_Dist.zip"
$zipPathCompleto = Join-Path $sourceDir "Infinity_AI_Cliente_Dist_Com_Chrome.zip"

Write-Host "=== Criador de Pacote de Distribuição - Infinity AI ===" -ForegroundColor Green
Write-Host ""

# 1. Limpeza de pacotes e pastas temporárias anteriores
if (Test-Path $stagingDir) {
    Write-Host "[*] Removendo pasta temporária de staging anterior..." -ForegroundColor Cyan
    Remove-Item -Path $stagingDir -Recurse -Force
}
if (Test-Path $zipPathLeve) {
    Write-Host "[*] Removendo ZIP leve anterior..." -ForegroundColor Cyan
    Remove-Item -Path $zipPathLeve -Force
}
if (Test-Path $zipPathCompleto) {
    Write-Host "[*] Removendo ZIP completo anterior..." -ForegroundColor Cyan
    Remove-Item -Path $zipPathCompleto -Force
}

# 2. Cria pasta de staging limpa
Write-Host "[*] Criando estrutura temporária..." -ForegroundColor Cyan
New-Item -Path $stagingDir -ItemType Directory | Out-Null
New-Item -Path (Join-Path $stagingDir "manager") -ItemType Directory | Out-Null

# 3. Copia arquivos principais essenciais
Write-Host "[*] Copiando arquivos principais..." -ForegroundColor Cyan

# Copia executável compilado
$exePath = Join-Path $sourceDir "Abrir Navegador.exe"
if (Test-Path $exePath) {
    Copy-Item -Path $exePath -Destination $stagingDir
    Write-Host "[+] Abrir Navegador.exe copiado." -ForegroundColor Green
} else {
    Write-Error "Arquivo 'Abrir Navegador.exe' não encontrado na raiz! Por favor, compile o executável antes de empacotar."
}

# Copia certificado e instalador do certificado
$cerPath = Join-Path $sourceDir "infinity_ai.cer"
if (Test-Path $cerPath) {
    Copy-Item -Path $cerPath -Destination $stagingDir
}
$installCertBat = Join-Path $sourceDir "Instalar_Certificado.bat"
if (Test-Path $installCertBat) {
    Copy-Item -Path $installCertBat -Destination $stagingDir
}

# Copia arquivo de configuração do Supabase
$supConfigPath = Join-Path $sourceDir "supabase_config.json"
if (Test-Path $supConfigPath) {
    Copy-Item -Path $supConfigPath -Destination $stagingDir
    Write-Host "[+] supabase_config.json copiado." -ForegroundColor Green
}

# Copia script de integração web (1-Click Hub)
$hubScriptPath = Join-Path $sourceDir "integration_hub.js"
if (Test-Path $hubScriptPath) {
    Copy-Item -Path $hubScriptPath -Destination $stagingDir
    Write-Host "[+] integration_hub.js copiado." -ForegroundColor Green
}



# Copia a extensão do Chrome
$extDir = Join-Path $sourceDir "extension"
if (Test-Path $extDir) {
    Copy-Item -Path $extDir -Destination (Join-Path $stagingDir "extension") -Recurse
    Write-Host "[+] Pasta 'extension' copiada com sucesso." -ForegroundColor Green
} else {
    Write-Error "Diretório da extensão 'extension' não encontrado!"
}


# 4. Copia as configurações de perfis cadastradas (removendo apenas perfis de teste como 'test_profile')
Write-Host "[*] Copiando configurações de perfis para distribuição..." -ForegroundColor Cyan
$sourceConfigPath = Join-Path $sourceDir "manager\profiles_config.json"
$stagingConfigPath = Join-Path $stagingDir "manager\profiles_config.json"

if (Test-Path $sourceConfigPath) {
    $configContent = Get-Content -Raw -Path $sourceConfigPath
    try {
        $configJson = ConvertFrom-Json $configContent
        $newConfig = [ordered]@{}
        foreach ($prop in $configJson.PSObject.Properties) {
            # Copia todos os perfis cadastrados, exceto perfis de teste
            if ($prop.Name -ne "test_profile") {
                $newConfig.Add($prop.Name, $prop.Value)
            }
        }
        $newConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $stagingConfigPath -Encoding UTF8
        Write-Host "[+] Copiados todos os perfis configurados no gerenciador para a distribuição." -ForegroundColor Green
    } catch {
        # Fallback caso dê erro de parse
        Copy-Item -Path $sourceConfigPath -Destination $stagingConfigPath
        Write-Host "[!] Copiado arquivo bruto por falha no parse do JSON." -ForegroundColor Yellow
    }
} else {
    $cleanConfig = "{}"
    Set-Content -Path $stagingConfigPath -Value $cleanConfig -Encoding UTF8
    Write-Host "[!] Nenhuma configuração existente encontrada. Criada lista vazia." -ForegroundColor Yellow
}

# 5. Gera a versão leve (Sem Chrome portátil embutido - o programa baixa no primeiro uso se necessário)
Write-Host ""
Write-Host "[*] Criando ZIP de distribuição Leve (Infinity_AI_Cliente_Dist.zip)..." -ForegroundColor Cyan
# Usando tar.exe nativo do Windows para evitar erros de OutOfMemory (muito mais rápido e eficiente)
tar.exe -a -c -f "$zipPathLeve" -C "$stagingDir" .
Write-Host "[SUCESSO] ZIP Leve criado com sucesso! Tamanho aproximado: $((Get-Item $zipPathLeve).Length / 1MB -as [int]) MB" -ForegroundColor Green
Write-Host "-> Esta versão é recomendada para envio rápido. O Chrome portátil será baixado automaticamente na primeira execução do cliente." -ForegroundColor Gray

# 6. Gera a versão completa (Com Chrome portátil v129 embutido) - Opcional se a pasta existir
$chromeBinSrc = Join-Path $sourceDir "chrome-bin-v129"
if (Test-Path $chromeBinSrc) {
    Write-Host ""
    Write-Host "[*] Pasta 'chrome-bin-v129' detectada. Criando versão Completa offline..." -ForegroundColor Cyan
    Write-Host "[*] Copiando navegador portátil (isso pode levar alguns instantes)..." -ForegroundColor Cyan
    Copy-Item -Path $chromeBinSrc -Destination (Join-Path $stagingDir "chrome-bin-v129") -Recurse
    
    Write-Host "[*] Criando ZIP de distribuição Completa (Infinity_AI_Cliente_Dist_Com_Chrome.zip)..." -ForegroundColor Cyan
    # Usando tar.exe nativo do Windows para evitar erros de OutOfMemory (muito mais rápido e eficiente)
    tar.exe -a -c -f "$zipPathCompleto" -C "$stagingDir" .
    Write-Host "[SUCESSO] ZIP Completo criado com sucesso! Tamanho aproximado: $((Get-Item $zipPathCompleto).Length / 1MB -as [int]) MB" -ForegroundColor Green
    Write-Host "-> Esta versão é recomendada para entrega física ou quando o cliente não tiver boa conexão de internet." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "[AVISO] Pasta 'chrome-bin-v129' não encontrada na raiz. Não foi possível gerar o ZIP completo com o Chrome embutido." -ForegroundColor Yellow
    Write-Host "-> Para gerar a versão completa, execute o 'Abrir Navegador.exe' uma vez para baixar o navegador portátil e depois rode este script novamente." -ForegroundColor Gray
}

# 7. Limpa a pasta temporária de staging
if (Test-Path $stagingDir) {
    Remove-Item -Path $stagingDir -Recurse -Force
}

Write-Host ""
Write-Host "=== Processo de Empacotamento Concluído! ===" -ForegroundColor Green
Write-Host "Arquivos gerados na raiz do projeto." -ForegroundColor Green
