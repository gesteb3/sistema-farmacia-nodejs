import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../app.js';

describe('GET /api/v1/health', () => {
  it('confirma que la API está disponible', async () => {
    const response = await request(createApp()).get('/api/v1/health');
    const body = response.body as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: 'ok',
      service: 'sistema-farmacia-api',
    });
    expect(typeof body.timestamp).toBe('string');
  });
});

describe('rutas inexistentes', () => {
  it('responde con estado 404 y un mensaje útil', async () => {
    const response = await request(createApp()).get('/api/v1/inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      message: 'La ruta GET /api/v1/inexistente no existe.',
    });
  });
});
