@echo off
title Instalar Certificado - Infinity AI
color 0b

echo ======================================================
echo   Instalador de Certificado de Confianca - Infinity AI
echo ======================================================
echo.

:: Verifica privilegios de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Para instalar o certificado de seguranca local,
    echo este script PRECISA ser executado como Administrador.
    echo.
    echo Como fazer:
    echo 1. Clique com o botao direito sobre este arquivo (.bat).
    echo 2. Selecione a opcao "Executar como Administrador".
    echo.
    pause
    exit /b
)

echo [*] Privilegios de Administrador confirmados!
echo [*] Instalando o certificado "infinity_ai.cer"...
echo.

:: Define o caminho do arquivo .cer com base no diretorio do script
set "CER_FILE=%~dp0infinity_ai.cer"

if not exist "%CER_FILE%" (
    echo [ERRO] O arquivo do certificado "%CER_FILE%" nao foi localizado.
    echo Certifique-se de manter o arquivo "infinity_ai.cer" na mesma pasta deste script.
    echo.
    pause
    exit /b
)

:: Executa a importacao do certificado no repositorio de Autoridades de Certificacao Raiz Confiaveis (Root)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Import-Certificate -FilePath '%CER_FILE%' -CertStoreLocation 'Cert:\LocalMachine\Root'" >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Falha ao importar para Autoridades Raiz Confiaveis.
    pause
    exit /b
)

:: Executa a importacao do certificado no repositorio de Editores Confiaveis (TrustedPublisher)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Import-Certificate -FilePath '%CER_FILE%' -CertStoreLocation 'Cert:\LocalMachine\TrustedPublisher'" >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Falha ao importar para Editores Confiaveis.
    pause
    exit /b
)

echo ======================================================
echo   [SUCESSO] Certificado instalado com sucesso!
echo ======================================================
echo.
echo O Windows agora reconhece a assinatura da Infinity AI.
echo O executavel "Abrir Navegador.exe" abrira normalmente 
echo sem exibir o aviso do SmartScreen.
echo.
pause
