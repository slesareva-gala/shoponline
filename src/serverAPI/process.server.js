import {
  processAccessVerification,
  paramsAccessVerification,
} from './access.server.js';
import { validatorAPI } from './validator.server.js';
import { requestDataAPI } from '../dataAPI/request.data.js';

const SERVER_ERROR_MESSAGE = 'Ошибка обработки запроса';

const getRequestBody = async req => {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        resolve(data);
      });
      req.on('error', e => {
        reject(e);
      });
    });
    return body;
  } catch (e) {
    return e;
  }
};

export const processAPI = async (req, res, routing) => {
  if (!processAccessVerification(res, routing, 'params')) return;

  try {
    const method = routing.signature.split('_')[1];

    if (['post', 'patch'].includes(method)) {
      routing.body = await getRequestBody(req);
      if (routing.body instanceof Error) throw routing.body;
      routing.body = routing.body === '' ? '' : JSON.parse(routing.body);
    }

    if (!validatorAPI(req, res, routing)) return;
    if (!paramsAccessVerification(res, routing)) return;

    return requestDataAPI(res, routing);
  } catch (e) {
    routing.logger.log(`Ошибка чтения body: ${e.message}`);
    res.statusCode = 500;
    return res.end(JSON.stringify({ message: SERVER_ERROR_MESSAGE }));
  }
};
