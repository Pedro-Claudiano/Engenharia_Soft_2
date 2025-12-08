@echo off
echo ========================================
echo Testando CI Localmente
echo ========================================

echo.
echo [1/3] Testando Backend...
cd backend
call npm test
if %errorlevel% neq 0 (
    echo ERRO: Testes do backend falharam!
    cd ..
    exit /b 1
)
cd ..

echo.
echo [2/3] Testando Lint do Frontend...
cd frontend
call npm run lint
if %errorlevel% neq 0 (
    echo ERRO: Lint do frontend falhou!
    cd ..
    exit /b 1
)

echo.
echo [3/3] Testando Build do Frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Build do frontend falhou!
    cd ..
    exit /b 1
)
cd ..

echo.
echo ========================================
echo ✅ Todos os testes passaram!
echo ========================================
