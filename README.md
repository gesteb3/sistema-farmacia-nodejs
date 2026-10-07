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

## Documentación interactiva

Con el servidor iniciado, abra [http://localhost:3000/api-docs](http://localhost:3000/api-docs). Swagger UI muestra todos los endpoints, sus parámetros y ejemplos; el botón **Try it out** permite ejecutar solicitudes desde el navegador.

La especificación OpenAPI también está disponible como JSON en `GET /openapi.json`.

Los módulos de medicamentos, inventario, compras, ventas y usuarios se agregarán en entregas posteriores.

## API de medicamentos

| Método   | Ruta                      | Función                           |
| -------- | ------------------------- | --------------------------------- |
| `POST`   | `/api/v1/medications`     | Registrar un medicamento          |
| `GET`    | `/api/v1/medications`     | Listar, buscar y paginar          |
| `GET`    | `/api/v1/medications/:id` | Consultar por identificador       |
| `PATCH`  | `/api/v1/medications/:id` | Actualizar campos específicos     |
| `DELETE` | `/api/v1/medications/:id` | Desactivar sin borrar el registro |

La consulta de listado acepta `page`, `limit`, `search` e `includeInactive`. Los precios se envían como números y se devuelven como cadenas decimales para conservar su precisión.

## API de inventario

| Método | Ruta                                      | Función                             |
| ------ | ----------------------------------------- | ----------------------------------- |
| `POST` | `/api/v1/inventory/batches`               | Registrar lote y existencia inicial |
| `GET`  | `/api/v1/inventory/batches`               | Listar lotes y filtrar su estado    |
| `POST` | `/api/v1/inventory/batches/:id/entries`   | Registrar entrada de existencias    |
| `POST` | `/api/v1/inventory/batches/:id/exits`     | Registrar salida de existencias     |
| `GET`  | `/api/v1/inventory/batches/:id/movements` | Consultar historial del lote        |

Cada entrada o salida conserva el stock anterior y el nuevo stock. La actualización del lote y la creación del movimiento se realizan en una misma transacción: ambas operaciones se completan o ninguna se guarda.

## Requisitos

- Node.js 22 o superior
- npm 10 o superior
- Docker Desktop

## Instalación

```bash
npm install
```

Copie `.env.example` como `.env` y ajuste los valores si es necesario.

Inicie PostgreSQL y aplique las migraciones:

```bash
docker compose up -d
npm run db:migrate -- --name init
```

## Comandos

```bash
npm run dev          # Servidor con recarga automática
npm run build        # Compila TypeScript
npm start            # Ejecuta la versión compilada
npm test             # Ejecuta las pruebas
npm run lint         # Revisa la calidad del código
npm run format:check # Verifica el formato
npm run db:studio    # Abre el explorador visual de la base de datos
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

## Persistencia

PostgreSQL se ejecuta en Docker y Prisma mantiene el esquema y las migraciones. El primer modelo es `Medication`; contiene la información comercial del medicamento, pero no las existencias. El inventario se implementará como un módulo separado para registrar lotes, fechas de vencimiento y movimientos sin duplicar datos del catálogo.
