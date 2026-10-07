# Sistema de Farmacia

API REST desarrollada con Node.js, Express y TypeScript para administrar las operaciones de una farmacia. El proyecto se construirá por módulos para mantener cada responsabilidad aislada y facilitar las pruebas y el mantenimiento.

## Estado actual

Esta primera entrega contiene la base técnica del sistema:

- servidor HTTP con Express;
- configuración validada mediante variables de entorno;
- cabeceras de seguridad con Helmet;
- soporte de CORS y JSON;
- manejo uniforme de rutas inexistentes y errores;
- endpoint `GET /api/v1/health`;
- pruebas automatizadas iniciales.

Los módulos de medicamentos, inventario, compras, ventas y usuarios se agregarán en entregas posteriores.

## Requisitos

- Node.js 22 o superior
- npm 10 o superior

## Instalación

```bash
npm install
```

Copie `.env.example` como `.env` y ajuste los valores si es necesario.

## Comandos

```bash
npm run dev          # Servidor con recarga automática
npm run build        # Compila TypeScript
npm start            # Ejecuta la versión compilada
npm test             # Ejecuta las pruebas
npm run lint         # Revisa la calidad del código
npm run format:check # Verifica el formato
```

## Estructura inicial

```text
src/
├── config/           # Configuración de la aplicación
├── modules/          # Funcionalidades separadas por dominio
├── shared/           # Componentes reutilizables
├── app.ts            # Configuración de Express
└── server.ts         # Arranque y cierre del servidor
```

Separar `app.ts` de `server.ts` permite probar la aplicación sin abrir un puerto real.
