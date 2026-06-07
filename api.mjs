import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Pool } from 'pg';
import 'dotenv/config';

import { routerAPI } from './src/serverAPI/router.server.js';
import { Logger } from './src/servisesAPI/logger.servises.js';

const DIR_LOGS = process.env.DIR_LOGS || './error_logs';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const routing = {
  signature: '',
  params: {},
  body: '',
  userAccess: 0,
  pool,
  logger: new Logger(`${DIR_LOGS}/server.log`, 1024 * 64),
  entryPoint: path.dirname(fileURLToPath(import.meta.url)),
};

const PORT = process.env.PORT;
const server = http.createServer((req, res) => {
  routerAPI(req, res, routing);
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});
