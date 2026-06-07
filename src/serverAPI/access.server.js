const FORBIDEN_REQUEST_MESSAGE =
  'Доступ запрещён. Отсутствуют права на выполнение запроса';
const FORBIDEN_REQUEST_PARAMS_MESSAGE =
  'Доступ запрещён. Отсутствуют права на параметры запроса';
const FORBIDEN_REQUEST_VALUES_MESSAGE =
  'Доступ к зарезервированным значениям параметров запрещён';

const settingsAccess = {
  autch: {
    post: { access: 2 },
  },
  goods: {
    get: { access: 2, params: { inwork: 1 } },
    post: { access: 1, body: { id: 0, image: 0 } },
    patch: { access: 1, body: { id: 0, image: 0 } },
    delete: { access: 1 },
  },
  categories: {
    get: { access: 2 },
    post: { access: 1, body: { id: 0 } },
    patch: { access: 1, body: { id: 0 } },
    delete: {
      access: 1,
      special: routing => (routing.params.idCategories.includes(1) ? 0 : 1),
    },
  },
  units: {
    get: { access: 2 },
    post: { access: 1, body: { id: 0 } },
    patch: { access: 1, body: { id: 0 } },
    delete: {
      access: 1,
      special: routing => (routing.params.idUnits.includes(1) ? 0 : 1),
    },
  },
};

const paramsAccessControl = (res, userAccess, params, accessParams) => {
  for (const param in params) {
    const value = params[param];

    if (value === null) continue;
    if (
      accessParams.hasOwnProperty(param) &&
      accessParams[param] < userAccess
    ) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: FORBIDEN_REQUEST_PARAMS_MESSAGE }));
      return false;
    }
  }
  return true;
};

export const processAccessVerification = (res, routing) => {
  const [table, method] = routing.signature.split('_');
  const checking = settingsAccess[table][method];

  if (checking.access < routing.userAccess) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: FORBIDEN_REQUEST_MESSAGE }));
    return false;
  }
  if (!checking.hasOwnProperty('params')) return true;

  return paramsAccessControl(
    res,
    routing.userAccess,
    routing.params,
    checking.params,
  );
};

export const paramsAccessVerification = (res, routing) => {
  const [table, method] = routing.signature.split('_');
  const checking = settingsAccess[table][method];

  if (checking.hasOwnProperty('special') && checking.special(routing) === 0) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: FORBIDEN_REQUEST_VALUES_MESSAGE }));
    return false;
  }

  if (!checking.hasOwnProperty('body') || routing.body === '') return true;

  if (
    !paramsAccessControl(res, routing.userAccess, routing.body, checking.body)
  )
    return false;

  return true;
};
