import path from 'node:path';
import { readFile } from 'node:fs/promises';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Внутренняя ошибка сервера';

const pathPublic = 'public';

const getContentType = pathname => {
  const ext = path.extname(pathname);

  switch (ext) {
    case '.ico':
      return 'image/x-icon';
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
};

export const requestStatic = async (res, pathname, routing) => {
  try {
    const filePath = path.join(
      routing.entryPoint,
      pathPublic,
      pathname + (pathname === '/' ? 'index.html' : ''),
    );
    const data = await readFile(filePath);
    const contentType = getContentType(filePath);

    res.writeHead(200, { 'Content-Type': contentType });
    return res.end(data);
  } catch (e) {
    routing.logger.log(`requestFiles: ${e.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: INTERNAL_SERVER_ERROR_MESSAGE }));
  }
};
