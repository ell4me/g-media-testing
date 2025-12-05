import { buildApp } from './app';
import { envConfig } from './config/env';

(async () => {
  const app = await buildApp();

  try {
    await app.listen({ port: envConfig.port, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${envConfig.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
