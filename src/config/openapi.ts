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
  tags: [
    { name: 'Sistema', description: 'Estado general de la API' },
    { name: 'Medicamentos', description: 'Catálogo de medicamentos' },
    { name: 'Inventario', description: 'Lotes y movimientos de existencias' },
  ],
  paths: {
    '/api/v1/health': {
      get: {
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
  },
  components: {
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
