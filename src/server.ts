import { createApp } from './app.js';
import { database } from './config/database.js';
import { env } from './config/env.js';

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${env.PORT}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`${signal} recibido. Cerrando el servidor...`);

  server.close(async (error) => {
    if (error) {
      console.error('No fue posible cerrar el servidor correctamente.', error);
      process.exit(1);
    }

    await database.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
