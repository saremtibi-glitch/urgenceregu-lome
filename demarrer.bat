@echo off
chcp 65001 >nul
title UrgenceRégu Lomé - Serveur
cd /d "%~dp0"

rem Première utilisation : création de l'environnement Python et installation des dépendances
if not exist ".venv\Scripts\python.exe" (
    echo Installation de l'environnement Python, patientez...
    py -m venv .venv || goto erreur
    ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt || goto erreur
)

rem Mise à jour : installe les dépendances ajoutées depuis (certificat HTTPS pour le GPS)
".venv\Scripts\python.exe" -c "import cryptography" 2>nul || ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt

rem Ouvre le navigateur 3 secondes après le démarrage du serveur
start "" cmd /c "timeout /t 3 >nul & start http://localhost:8090"

".venv\Scripts\python.exe" backend\main.py
pause
exit /b

:erreur
echo.
echo Une erreur est survenue pendant l'installation. Vérifiez que Python est installé.
pause
