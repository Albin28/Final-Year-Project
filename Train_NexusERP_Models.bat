@echo off
title NexusERP AI Model Trainer
color 0B
cls

set "ROOT_DIR=%~dp0"
set "PYTHON_EXE=%ROOT_DIR%.venv\Scripts\python.exe"
set "SCRIPT=%ROOT_DIR%01_Project\backend\pretrain_all_products.py"

echo =====================================================================
echo                NEXUSERP - AI MODEL TRAINING AND CACHING
echo =====================================================================
echo.
echo  This tool trains your machine learning models (Prophet, Holt-Winters,
echo  SES, Random Forest, Gradient Boosting) on all 30 grocery products.
echo.
echo  - Incremental Check: ~0.05s (skips unchanged models)
echo  - Full Parallel Retrain: ~14s (12 CPU worker cores)
echo.
echo =====================================================================
echo.

"%PYTHON_EXE%" "%SCRIPT%" %*

echo.
echo =====================================================================
echo  Options:
echo   * Press [F] to FORCE retrain all 30 models from scratch
echo   * Press any other key to close this window
echo =====================================================================
choice /C FQ /N /T 10 /D Q /M "Choice [F = Force Retrain, Q = Close] (Auto-closes in 10s): "
if errorlevel 2 goto :end
if errorlevel 1 (
    echo.
    echo =====================================================================
    echo  Starting Force Retrain on All 30 Products...
    echo =====================================================================
    echo.
    "%PYTHON_EXE%" "%SCRIPT%" --force
    echo.
    pause
)

:end
