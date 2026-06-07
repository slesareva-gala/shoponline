import { indexRequest } from './index.data.js';

const DB_ERROR_MESSAGE = 'Ошибка обработки запроса данных';

export const requestDataAPI = async (res, routing) => {
  try {
    const data = await indexRequest(routing);
    if (data instanceof Error) throw data;

    res.statusCode = 200;
    return res.end(JSON.stringify({ ...data }));
  } catch (e) {
    routing.logger.log(`База данных: ${e.message}`);
    res.statusCode = e.cause || 500;
    return res.end(
      JSON.stringify({ message: e.cause ? e.message : DB_ERROR_MESSAGE }),
    );
  }
};
