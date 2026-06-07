import crypto from 'node:crypto';

const UNAUTHORIZED_MESSAGE = 'Ошибка авторизации';
const SERVER_ERROR_AUTCH_MESSAGE = 'Ошибка сервера. Авторизация невозможна';

const formattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `0${now.getMonth() + 1}`.slice(-2);
  const day = `0${now.getDate()}`.slice(-2);
  return `${year}${month}${day}`;  
}

const currentAutchHash = (
  key = formattedDate()) => {
  return crypto
    .createHash('shake256', { outputLength: 5 })
    .update(key)
    .digest('hex');      
};

export const authorization = (query, routing) => {
  routing.userAccess = 2;
  if (query.get('autch')) {
    const hash = currentAutchHash();
    const autch = query.get('autch');
    query.delete('autch');
    if (autch === hash) routing.userAccess = 1;
  }
};

export const autchPost = (mode, routing) => {
  try {
    const autch = currentAutchHash();
    if (autch === currentAutchHash(routing.body.password)) return { autch };
    throw new Error(UNAUTHORIZED_MESSAGE, { cause: 401 });
  } catch (e) {
   return e.cause ? e : new Error(SERVER_ERROR_AUTCH_MESSAGE, { cause: 500 });
  }
};
