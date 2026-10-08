@echo off
title Sistema de Farmacia
cd /d "%~dp0"

echo.
echo ========================================
echo       INICIANDO SISTEMA DE FARMACIA
echo ========================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
  echo ERROR: Docker Desktop no esta instalado o no esta disponible.
  echo Instale o abra Docker Desktop e intente nuevamente.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado o no esta disponible.
  pause
  exit /b 1
)

echo [1/5] Iniciando PostgreSQL...
docker compose up -d
if errorlevel 1 (
  echo ERROR: No fue posible iniciar PostgreSQL.
  echo Verifique que Docker Desktop este abierto.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [2/5] Instalando dependencias por primera vez...
  call npm install
  if errorlevel 1 goto :error
) else (
  echo [2/5] Dependencias listas.
)

echo [3/5] Generando cliente de base de datos...
call npm run db:generate
if errorlevel 1 goto :error

echo [4/5] Aplicando actualizaciones de base de datos...
call npx prisma migrate deploy
if errorlevel 1 goto :error

echo [5/5] Cargando datos iniciales...
call npm run db:seed
if errorlevel 1 goto :error

echo.
echo Sistema listo en http://localhost:3000/app/
echo Esta ventana debe permanecer abierta.
echo Para detener el servidor, presione Ctrl+C.
echo.
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000/app/"
call npm run dev
exit /b 0

:error
echo.
echo ERROR: El sistema no pudo completar la preparacion.
pause
exit /b 1
