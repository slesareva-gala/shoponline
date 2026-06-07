import { processAPI } from './process.server.js';
import { authorization } from '../servisesAPI/cripto.servises.js';
import { requestStatic } from '../servisesAPI/static.servises.js';

const NOT_FOUND_MESSAGE = 'Ресурс не найден';
const BAD_REQUEST_MESSAGE = 'Синтаксическая ошибка в запросе';

const entryAPI = '/api/';
const settingsRouting = {
  autch: {
    post: ['/api/autch'],
  },
  goods: {
    get: ['/api/goods', 'total,search,page,inwork'],
    get_byId: ['/api/goods/{idGoods}', 'inwork'],
    get_discount: ['/api/goods/discount', 'total,search,page,inwork'],
    get_categoriesById: [
      '/api/goods/categories/{idCategories}',
      'total,search,page,inwork',
    ],
    post: ['/api/goods'],
    patch_byId: ['/api/goods/{idGood}'],
    delete_byId: ['/api/goods/{idGoods}'],
  },
  categories: {
    get: ['/api/categories', 'search,page'],
    get_byId: ['/api/categories/{idCategories}', ''],
    post: ['/api/categories'],
    patch_byId: ['/api/categories/{idCategory}'],
    delete_byId: ['/api/categories/{idCategories}'],
  },
  units: {
    get: ['/api/units', 'search,page'],
    get_byId: ['/api/units/{idUnits}', ''],
    post: ['/api/units'],
    patch_byId: ['/api/units/{idUnit}'],
    delete_byId: ['/api/units/{idUnits}'],
  },
};

const settingsStatic = [
  /^\/$/,
  /\/index.html$/,
  /^\/favicon.ico$/,
  /^\/index.js$/,
  /^\/modules\/.+\.js$/,
  /^\/css\/.+\.css$/,
  /^\/fonts\/.+\.(woff|woff2)$/,
  /.+\.(jpg|png|svg|gif)$/,
];

export const routerAPI = async (req, res, routing) => {
  const method = req.method;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const query = url.searchParams;

  authorization(query, routing);

  if (settingsStatic.some(regex => regex.test(pathname))) {
    return await requestStatic(res, pathname, routing);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  if (pathname.slice(0, 5) !== entryAPI) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ message: NOT_FOUND_MESSAGE }));
  }
  for (const tableAlias in settingsRouting) {
    for (const queryAlias in settingsRouting[tableAlias]) {
      const methodAPI = queryAlias.split('_')[0].toUpperCase();
      if (methodAPI !== method) continue;

      const pathAPI = settingsRouting[tableAlias][queryAlias][0];
      const regexParamPathAPI = /(?<=\/{).+(?=}$)/g;
      const regexPathAPI = new RegExp(
        '^' + pathAPI.replace(regexParamPathAPI, '[^/]+') + '$',
      );
      if (!regexPathAPI.test(pathname)) continue;

      const queryKeys = [...query.keys()];
      const queryAPI = settingsRouting[tableAlias][queryAlias][1]
        ? settingsRouting[tableAlias][queryAlias][1].split(',')
        : [];
      if (queryKeys.some(param => !queryAPI.includes(param))) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: BAD_REQUEST_MESSAGE }));
      }

      const paramAPI = pathAPI.match(regexParamPathAPI) || [];
      const paramPath = paramAPI.reduce((acc, name) => {
        const value = pathname.match(regexParamPathAPI);
        acc[name] = value ? value[0] : null;
        return acc;
      }, {});
      const paramsQuery = queryAPI.reduce((acc, name) => {
        acc[name] = query.get(name);
        return acc;
      }, {});

      routing.signature = `${tableAlias}_${queryAlias}`;
      routing.params = { ...paramPath, ...paramsQuery };
      routing.body = '';

      return processAPI(req, res, routing);
    }
  }

  res.statusCode = 404;
  return res.end(JSON.stringify({ message: NOT_FOUND_MESSAGE }));
};
