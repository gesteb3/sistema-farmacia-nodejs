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

describe('documentación de la API', () => {
  it('redirige la página principal al panel web', async () => {
    const response = await request(createApp()).get('/');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/app/');
  });

  it('expone el documento OpenAPI', async () => {
    const response = await request(createApp()).get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      openapi: '3.1.0',
      info: { title: 'Sistema de Farmacia API' },
    });
  });

  it('sirve la interfaz web y sus recursos', async () => {
    const [page, script] = await Promise.all([
      request(createApp()).get('/app/'),
      request(createApp()).get('/app/app.js'),
    ]);

    expect(page.status).toBe(200);
    expect(page.text).toContain('FarmaControl');
    expect(script.status).toBe(200);
    expect(script.headers['content-type']).toContain('javascript');
  });
});
