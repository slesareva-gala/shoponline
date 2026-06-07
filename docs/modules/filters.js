import { appGoods, appCategories } from './const.js';
import { renderGoods } from './render.js';

import { init } from '../index.js';

const panelFilters = document.querySelector('.panel__filter');
const filterCategory = panelFilters.querySelector('#category_filter');
const filterDiscount = panelFilters.querySelector('#discount_filter');
const filterInwork = panelFilters.querySelector('#inwork_filter');

export const clearParamFilters = (mode = '') => {
  if (mode === 'full') {
    appGoods.path = '';
    appGoods.idCategory = 0;
    filterCategory.selectedIndex = 0;

    filterDiscount.checked = false;

    appGoods.inwork = appGoods.autch ? -1 : 0;
    filterInwork.selectedIndex = appGoods.autch ? 0 : 1;
  } else if (filterDiscount.checked) {
    appGoods.path = '';
    filterDiscount.checked = false;
  }
};

const choiseFilter = e => {
  appGoods.path = '';
  appGoods.page = 1;

  switch (e.target) {
    case filterCategory:
      appGoods.idCategory =
        filterCategory.options[filterCategory.selectedIndex].value;
      filterDiscount.checked = false;
      break;
    case filterDiscount:
      appGoods.idCategory = 0;
      filterCategory.selectedIndex = appCategories.selectedIndex;
      break;
    case filterInwork:
      appGoods.inwork = +filterInwork.options[filterInwork.selectedIndex].value;
      break;
  }
  if (appGoods.idCategory > 0) appGoods.path = 'categories';
  else if (filterDiscount.checked) appGoods.path = 'discount';

  renderGoods();
};

panelFilters.addEventListener('change', choiseFilter);
