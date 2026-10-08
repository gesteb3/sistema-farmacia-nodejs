const medicationProperties = {
  code: { type: 'string', example: 'MED-001' },
  name: { type: 'string', example: 'Acetaminofén' },
  activeIngredient: { type: 'string', example: 'Paracetamol' },
  presentation: { type: 'string', example: 'Caja con 20 tabletas' },
  concentration: { type: ['string', 'null'], example: '500 mg' },
  purchasePrice: { type: 'number', format: 'double', example: 10.5 },
  salePrice: { type: 'number', format: 'double', example: 15.75 },
  requiresPrescription: { type: 'boolean', default: false },
};

const jsonBody = (schema: unknown) => ({
  required: true,
  content: { 'application/json': { schema } },
});

const idParameter = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', format: 'uuid' },
});

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Sistema de Farmacia API',
    version: '1.0.0',
    description:
      'API REST para administrar medicamentos e inventario por lotes. Use “Try it out” para ejecutar solicitudes.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Sistema', description: 'Estado general de la API' },
    { name: 'Medicamentos', description: 'Catálogo de medicamentos' },
    { name: 'Inventario', description: 'Lotes y movimientos de existencias' },
    { name: 'Proveedores', description: 'Directorio de proveedores' },
    {
      name: 'Compras',
      description: 'Facturas de compra e ingresos de inventario',
    },
    { name: 'Clientes', description: 'Directorio de clientes' },
    { name: 'Ventas', description: 'Facturación y salidas de inventario' },
    { name: 'Autenticación', description: 'Sesión y usuarios del sistema' },
    { name: 'Reportes', description: 'Indicadores operativos' },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        security: [],
        tags: ['Sistema'],
        summary: 'Verificar que la API está activa',
        responses: {
          '200': {
            description: 'Servicio disponible',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        security: [],
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        requestBody: jsonBody({ $ref: '#/components/schemas/Login' }),
        responses: {
          '200': { description: 'Token y usuario' },
          '401': { description: 'Credenciales incorrectas' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Autenticación'],
        summary: 'Consultar usuario autenticado',
        responses: {
          '200': { description: 'Perfil actual' },
          '401': { description: 'Sesión inválida' },
        },
      },
    },
    '/api/v1/users': {
      get: {
        tags: ['Autenticación'],
        summary: 'Listar usuarios como administrador',
        responses: { '200': { description: 'Usuarios' } },
      },
      post: {
        tags: ['Autenticación'],
        summary: 'Crear usuario como administrador',
        requestBody: jsonBody({ $ref: '#/components/schemas/CreateUser' }),
        responses: {
          '201': { description: 'Usuario creado' },
          '403': { description: 'Permiso insuficiente' },
        },
      },
    },
    '/api/v1/reports/dashboard': {
      get: {
        tags: ['Reportes'],
        summary: 'Consultar indicadores y alertas del panel',
        responses: {
          '200': {
            description: 'Resumen de ventas, existencias y vencimientos',
          },
          '403': { description: 'Sólo administradores' },
        },
      },
    },
    '/api/v1/medications': {
      post: {
        tags: ['Medicamentos'],
        summary: 'Registrar un medicamento',
        requestBody: jsonBody({
          $ref: '#/components/schemas/CreateMedication',
        }),
        responses: {
          '201': { description: 'Medicamento registrado' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { description: 'El código ya existe' },
        },
      },
      get: {
        tags: ['Medicamentos'],
        summary: 'Listar y buscar medicamentos',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Busca por código, nombre o principio activo',
          },
          {
            name: 'includeInactive',
            in: 'query',
            schema: { type: 'boolean', default: false },
          },
        ],
        responses: { '200': { description: 'Listado paginado' } },
      },
    },
    '/api/v1/medications/{id}': {
      parameters: [idParameter('id', 'Identificador del medicamento')],
      get: {
        tags: ['Medicamentos'],
        summary: 'Consultar un medicamento',
        responses: {
          '200': { description: 'Medicamento encontrado' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Medicamentos'],
        summary: 'Actualizar parcialmente un medicamento',
        requestBody: jsonBody({
          $ref: '#/components/schemas/UpdateMedication',
        }),
        responses: {
          '200': { description: 'Medicamento actualizado' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Medicamentos'],
        summary: 'Desactivar un medicamento',
        responses: {
          '204': { description: 'Medicamento desactivado' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/v1/inventory/batches': {
      post: {
        tags: ['Inventario'],
        summary: 'Registrar un lote con existencia inicial',
        requestBody: jsonBody({ $ref: '#/components/schemas/CreateBatch' }),
        responses: {
          '201': { description: 'Lote registrado' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { description: 'Medicamento inexistente o inactivo' },
          '409': { description: 'Número de lote duplicado' },
        },
      },
      get: {
        tags: ['Inventario'],
        summary: 'Listar lotes',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'medicationId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['all', 'available', 'expired'],
              default: 'all',
            },
          },
        ],
        responses: { '200': { description: 'Listado paginado de lotes' } },
      },
    },
    '/api/v1/inventory/batches/{id}/entries': {
      post: {
        tags: ['Inventario'],
        summary: 'Registrar entrada de existencias',
        parameters: [idParameter('id', 'Identificador del lote')],
        requestBody: jsonBody({ $ref: '#/components/schemas/StockMovement' }),
        responses: {
          '201': { description: 'Entrada registrada' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/v1/inventory/batches/{id}/exits': {
      post: {
        tags: ['Inventario'],
        summary: 'Registrar salida de existencias',
        parameters: [idParameter('id', 'Identificador del lote')],
        requestBody: jsonBody({ $ref: '#/components/schemas/StockMovement' }),
        responses: {
          '201': { description: 'Salida registrada' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { description: 'Existencias insuficientes' },
        },
      },
    },
    '/api/v1/inventory/batches/{id}/movements': {
      get: {
        tags: ['Inventario'],
        summary: 'Consultar historial de movimientos',
        parameters: [idParameter('id', 'Identificador del lote')],
        responses: {
          '200': { description: 'Historial del lote' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/v1/suppliers': {
      post: {
        tags: ['Proveedores'],
        summary: 'Registrar un proveedor',
        requestBody: jsonBody({ $ref: '#/components/schemas/CreateSupplier' }),
        responses: {
          '201': { description: 'Proveedor registrado' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { description: 'El NIT ya existe' },
        },
      },
      get: {
        tags: ['Proveedores'],
        summary: 'Listar y buscar proveedores',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'includeInactive',
            in: 'query',
            schema: { type: 'boolean', default: false },
          },
        ],
        responses: { '200': { description: 'Listado paginado' } },
      },
    },
    '/api/v1/suppliers/{id}': {
      parameters: [idParameter('id', 'Identificador del proveedor')],
      get: {
        tags: ['Proveedores'],
        summary: 'Consultar un proveedor',
        responses: {
          '200': { description: 'Proveedor encontrado' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Proveedores'],
        summary: 'Actualizar parcialmente un proveedor',
        requestBody: jsonBody({ $ref: '#/components/schemas/UpdateSupplier' }),
        responses: {
          '200': { description: 'Proveedor actualizado' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Proveedores'],
        summary: 'Desactivar un proveedor',
        responses: {
          '204': { description: 'Proveedor desactivado' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/v1/purchases': {
      post: {
        tags: ['Compras'],
        summary: 'Registrar una compra e ingresar existencias',
        requestBody: jsonBody({ $ref: '#/components/schemas/CreatePurchase' }),
        responses: {
          '201': { description: 'Compra registrada' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { description: 'Proveedor o medicamento no encontrado' },
          '409': { description: 'Factura duplicada o lote incompatible' },
        },
      },
      get: {
        tags: ['Compras'],
        summary: 'Listar compras',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'supplierId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { '200': { description: 'Listado paginado de compras' } },
      },
    },
    '/api/v1/purchases/{id}': {
      get: {
        tags: ['Compras'],
        summary: 'Consultar una compra y su detalle',
        parameters: [idParameter('id', 'Identificador de la compra')],
        responses: {
          '200': { description: 'Compra encontrada' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/v1/customers': {
      post: {
        tags: ['Clientes'],
        summary: 'Registrar un cliente',
        requestBody: jsonBody({ $ref: '#/components/schemas/CreateCustomer' }),
        responses: {
          '201': { description: 'Cliente registrado' },
          '409': { description: 'NIT duplicado' },
        },
      },
      get: {
        tags: ['Clientes'],
        summary: 'Listar y buscar clientes',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Listado paginado' } },
      },
    },
    '/api/v1/customers/{id}': {
      parameters: [idParameter('id', 'Identificador del cliente')],
      get: {
        tags: ['Clientes'],
        summary: 'Consultar un cliente',
        responses: { '200': { description: 'Cliente encontrado' } },
      },
      patch: {
        tags: ['Clientes'],
        summary: 'Actualizar un cliente',
        requestBody: jsonBody({ $ref: '#/components/schemas/UpdateCustomer' }),
        responses: { '200': { description: 'Cliente actualizado' } },
      },
      delete: {
        tags: ['Clientes'],
        summary: 'Desactivar un cliente',
        responses: { '204': { description: 'Cliente desactivado' } },
      },
    },
    '/api/v1/sales': {
      post: {
        tags: ['Ventas'],
        summary: 'Registrar una venta y descontar existencias',
        requestBody: jsonBody({ $ref: '#/components/schemas/CreateSale' }),
        responses: {
          '201': { description: 'Venta registrada' },
          '404': { description: 'Cliente o medicamento no encontrado' },
          '409': { description: 'Factura duplicada o stock insuficiente' },
        },
      },
      get: {
        tags: ['Ventas'],
        summary: 'Listar ventas',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'customerId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { '200': { description: 'Listado paginado de ventas' } },
      },
    },
    '/api/v1/sales/{id}': {
      get: {
        tags: ['Ventas'],
        summary: 'Consultar factura y detalle de venta',
        parameters: [idParameter('id', 'Identificador de la venta')],
        responses: {
          '200': { description: 'Venta encontrada' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      Page: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
    },
    responses: {
      BadRequest: {
        description: 'Datos inválidos',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
    schemas: {
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          service: { type: 'string', example: 'sistema-farmacia-api' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      CreateMedication: {
        type: 'object',
        required: [
          'code',
          'name',
          'activeIngredient',
          'presentation',
          'purchasePrice',
          'salePrice',
        ],
        properties: medicationProperties,
      },
      UpdateMedication: {
        type: 'object',
        minProperties: 1,
        properties: {
          ...medicationProperties,
          isActive: { type: 'boolean' },
        },
      },
      CreateBatch: {
        type: 'object',
        required: [
          'medicationId',
          'batchNumber',
          'expirationDate',
          'initialStock',
        ],
        properties: {
          medicationId: { type: 'string', format: 'uuid' },
          batchNumber: { type: 'string', example: 'LOTE-2026-001' },
          expirationDate: {
            type: 'string',
            format: 'date',
            example: '2027-12-31',
          },
          initialStock: { type: 'integer', minimum: 1, example: 100 },
          reason: { type: 'string', example: 'Compra inicial' },
        },
      },
      StockMovement: {
        type: 'object',
        required: ['quantity', 'reason'],
        properties: {
          quantity: { type: 'integer', minimum: 1, example: 10 },
          reason: { type: 'string', example: 'Reposición de inventario' },
        },
      },
      CreateSupplier: {
        type: 'object',
        required: ['nit', 'name'],
        properties: {
          nit: { type: 'string', example: '1234567-8' },
          name: { type: 'string', example: 'Distribuidora Farmacéutica, S.A.' },
          contactName: { type: ['string', 'null'], example: 'Ana López' },
          phone: { type: ['string', 'null'], example: '+502 2222-3333' },
          email: {
            type: ['string', 'null'],
            format: 'email',
            example: 'ventas@proveedor.com',
          },
          address: { type: ['string', 'null'], example: 'Ciudad de Guatemala' },
        },
      },
      UpdateSupplier: {
        type: 'object',
        minProperties: 1,
        properties: {
          nit: { type: 'string' },
          name: { type: 'string' },
          contactName: { type: ['string', 'null'] },
          phone: { type: ['string', 'null'] },
          email: { type: ['string', 'null'], format: 'email' },
          address: { type: ['string', 'null'] },
          isActive: { type: 'boolean' },
        },
      },
      CreatePurchase: {
        type: 'object',
        required: ['supplierId', 'invoiceNumber', 'purchaseDate', 'items'],
        properties: {
          supplierId: { type: 'string', format: 'uuid' },
          invoiceNumber: { type: 'string', example: 'FAC-2026-001' },
          purchaseDate: {
            type: 'string',
            format: 'date',
            example: '2026-10-07',
          },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: [
                'medicationId',
                'batchNumber',
                'expirationDate',
                'quantity',
                'unitCost',
              ],
              properties: {
                medicationId: { type: 'string', format: 'uuid' },
                batchNumber: { type: 'string', example: 'LOTE-2026-001' },
                expirationDate: {
                  type: 'string',
                  format: 'date',
                  example: '2027-12-31',
                },
                quantity: { type: 'integer', minimum: 1, example: 100 },
                unitCost: { type: 'number', example: 8.5 },
              },
            },
          },
        },
      },
      CreateCustomer: {
        type: 'object',
        required: ['name'],
        properties: {
          nit: { type: ['string', 'null'], example: 'CF-123456' },
          name: { type: 'string', example: 'Juan Pérez' },
          phone: { type: ['string', 'null'], example: '+502 5555-1234' },
          email: { type: ['string', 'null'], format: 'email' },
          address: { type: ['string', 'null'] },
        },
      },
      UpdateCustomer: {
        type: 'object',
        minProperties: 1,
        properties: {
          nit: { type: ['string', 'null'] },
          name: { type: 'string' },
          phone: { type: ['string', 'null'] },
          email: { type: ['string', 'null'], format: 'email' },
          address: { type: ['string', 'null'] },
          isActive: { type: 'boolean' },
        },
      },
      CreateSale: {
        type: 'object',
        required: ['invoiceNumber', 'items'],
        properties: {
          customerId: { type: ['string', 'null'], format: 'uuid' },
          invoiceNumber: { type: 'string', example: 'V-2026-001' },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['medicationId', 'quantity'],
              properties: {
                medicationId: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1, example: 2 },
              },
            },
          },
        },
      },
      Login: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'admin@farmacia.local',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'Farmacia2026!',
          },
        },
      },
      CreateUser: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Cajero Principal' },
          email: {
            type: 'string',
            format: 'email',
            example: 'cajero@farmacia.local',
          },
          password: { type: 'string', format: 'password', minLength: 8 },
          role: {
            type: 'string',
            enum: ['ADMIN', 'CASHIER'],
            default: 'CASHIER',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
          details: { type: 'object' },
        },
      },
    },
  },
} as const;
