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

Los módulos se incorporan progresivamente y cada operación crítica se valida con pruebas automatizadas.

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

## API de proveedores

| Método   | Ruta                    | Función                     |
| -------- | ----------------------- | --------------------------- |
| `POST`   | `/api/v1/suppliers`     | Registrar un proveedor      |
| `GET`    | `/api/v1/suppliers`     | Listar y buscar proveedores |
| `GET`    | `/api/v1/suppliers/:id` | Consultar un proveedor      |
| `PATCH`  | `/api/v1/suppliers/:id` | Actualizar un proveedor     |
| `DELETE` | `/api/v1/suppliers/:id` | Desactivar un proveedor     |

## API de compras

| Método | Ruta                    | Función                     |
| ------ | ----------------------- | --------------------------- |
| `POST` | `/api/v1/purchases`     | Registrar compra e ingreso  |
| `GET`  | `/api/v1/purchases`     | Listar compras              |
| `GET`  | `/api/v1/purchases/:id` | Consultar factura y detalle |

Registrar una compra crea o actualiza los lotes, incrementa sus existencias y genera los movimientos de entrada. La factura, sus detalles y el inventario se guardan en una única transacción.

## API de clientes

| Método   | Ruta                    | Función                  |
| -------- | ----------------------- | ------------------------ |
| `POST`   | `/api/v1/customers`     | Registrar un cliente     |
| `GET`    | `/api/v1/customers`     | Listar y buscar clientes |
| `GET`    | `/api/v1/customers/:id` | Consultar un cliente     |
| `PATCH`  | `/api/v1/customers/:id` | Actualizar un cliente    |
| `DELETE` | `/api/v1/customers/:id` | Desactivar un cliente    |

## API de ventas

| Método | Ruta                | Función                           |
| ------ | ------------------- | --------------------------------- |
| `POST` | `/api/v1/sales`     | Registrar venta y descontar stock |
| `GET`  | `/api/v1/sales`     | Listar ventas                     |
| `GET`  | `/api/v1/sales/:id` | Consultar factura y detalle       |

Las ventas consumen primero los lotes con vencimiento más cercano (FEFO), ignoran lotes vencidos y rechazan la operación completa cuando el stock es insuficiente.

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
npm run db:seed
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
