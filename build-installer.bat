@echo off
chcp 65001 >nul
title Build TEF Bridge Completo

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           BUILD TEF BRIDGE - INSTALADOR COMPLETO             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=C:\Users\rickm\Documents\tef-bridge"
set "OUTPUT_DIR=%PROJECT_DIR%dist-installer"

echo [1/5] Compilando Backend Java...
cd /d "%BACKEND_DIR%"
call mvnw.cmd clean package -DskipTests -q
if errorlevel 1 (
    echo [ERRO] Falha ao compilar backend Java
    pause
    exit /b 1
)
echo       Backend compilado!

echo [2/5] Copiando JAR para resources...
if not exist "%PROJECT_DIR%src-tauri\resources" mkdir "%PROJECT_DIR%src-tauri\resources"
copy /y "%BACKEND_DIR%\target\tef-bridge-1.0.0.jar" "%PROJECT_DIR%src-tauri\resources\tef-bridge.jar" >nul
echo       JAR copiado!

echo [3/5] Instalando dependencias do frontend...
cd /d "%PROJECT_DIR%"
call npm install --silent
echo       Dependencias instaladas!

echo [4/5] Compilando Frontend Angular...
call npm run build
if errorlevel 1 (
    echo [ERRO] Falha ao compilar frontend Angular
    pause
    exit /b 1
)
echo       Frontend compilado!

echo [5/5] Gerando instalador com Tauri...
call npm run tauri:build
if errorlevel 1 (
    echo [ERRO] Falha ao gerar instalador Tauri
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              BUILD CONCLUÍDO COM SUCESSO!                    ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  O instalador foi gerado em:                                 ║
echo ║    src-tauri\target\release\bundle\                          ║
echo ║                                                              ║
echo ║  Arquivos:                                                   ║
echo ║    - TEF Bridge_1.0.0_x64-setup.exe  (Instalador NSIS)       ║
echo ║    - TEF Bridge_1.0.0_x64.msi        (Instalador MSI)        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Abrindo pasta do instalador...
start "" "%PROJECT_DIR%src-tauri\target\release\bundle\nsis"

pause
