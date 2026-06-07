import { autchPost } from '../servisesAPI/cripto.servises.js';
import { indexGoods } from './data/goods.data.js';
import { indexCategories } from './data/categories.data.js';
import { indexUnits } from './data/units.data.js';

import { defaultFieldsValues } from '../serverAPI/validator.server.js';

export const indexRequest = routing => {
  const [table, method, mode = ''] = routing.signature.split('_');
  const defaultValues = defaultFieldsValues[table];
  const fieldsTable = Object.keys(defaultValues).filter(
    f => defaultValues[f] !== 'pseudo',
  );

  switch (table) {
    case 'goods':
      return indexGoods(method, mode, fieldsTable, defaultValues, routing);
    case 'categories':
      return indexCategories(method, mode, fieldsTable, defaultValues, routing);
    case 'units':
      return indexUnits(method, mode, fieldsTable, defaultValues, routing);
    case 'autch':
      if (method === 'post') return autchPost(mode, routing);
      break;
  }
  return new Error(`dataAPI: отсутствует обработчик ${routing.signature}`);
};
