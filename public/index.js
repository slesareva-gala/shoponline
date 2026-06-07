import './modules/const.js';
import { authorization } from './modules/authorization.js';
import { renderAPP } from './modules/render.js';

import './modules/search.js';
import './modules/filters.js';
import './modules/table.js';
import './modules/modal.js';
import './modules/goodscard.js';

import { fetchCategories } from './modules/category.js';
import { fetchUnits } from './modules/unit.js';

export const init = () => {
  authorization();

  fetchCategories();
  fetchUnits();

  renderAPP();
};
init();
