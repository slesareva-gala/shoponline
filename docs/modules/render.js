import create, { appGoods } from './const.js';
const { panelFilterInwork, btnAddGoods, tableHeaderInwork, table } = create;

import { numbersInOrder, createRow } from './table.js';
import { sayTotalTableSum } from './summs.js';
import { renderPagination } from './pagination.js';
import { clearParamSearch } from './search.js';
import { clearParamFilters } from './filters.js';

export const renderAPP = async () => {
  const method = appGoods.autch ? 'remove' : 'add';
  [panelFilterInwork, btnAddGoods, tableHeaderInwork].forEach(el =>
    el.classList[method]('visually-hidden'),
  );

  await renderGoods();
};

export const renderGoods = async (idGood = null) => {
  if (idGood) {
    appGoods.idGood = idGood;
    clearParamSearch();
    clearParamFilters();
  }
  const data = await appGoods.query(idGood ? 'listId' : 'list');

  if (data === null) return;
  appGoods.inpagesTotal = +data.inpagesTotal;

  sayTotalTableSum(data.total);

  table.textContent = '';
  data.rows.forEach(product => {
    const {
      id,
      title,
      price,
      categories_name,
      count,
      units_name,
      discount,
      description,
      image,
      inwork,
    } = product;

    const row = createRow({
      id,
      title,
      price,
      category: categories_name,
      count,
      units: units_name,
      discount,
      description,
      image,
      inwork,
    });

    table.append(row);
  });

  numbersInOrder(data.page, appGoods.inpage);

  renderPagination({
    ...data,
  });
};
