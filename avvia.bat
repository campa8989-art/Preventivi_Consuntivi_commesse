@echo off
:: Configura la codifica caratteri su UTF-8 per supportare le lettere accentate in italiano
chcp 65001 > nul
title REKEEP-CMF Gestione Lavori - Server Locale

echo ==========================================================
echo           REKEEP-CMF - GESTIONE PREVENTIVI E CONSUNTIVI
echo ==========================================================
echo.
echo Avvio del server locale in corso...
echo.
echo Apertura del browser alla pagina principale...
start "" "http://localhost:8085/"
echo.
echo ----------------------------------------------------------
echo  AVVISO: Mantieni aperta questa finestra nera per tutto
echo  il tempo in cui utilizzi l'applicazione.
echo  Per chiudere l'applicazione, chiudi questa finestra.
echo ----------------------------------------------------------
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

echo.
echo Server arrestato.
pause
