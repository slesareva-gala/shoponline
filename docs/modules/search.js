import { appGoods } from './const.js';
import { renderGoods } from './render.js';

const debounce = (func, ms = 300) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, ms);
  };
};

const searchInput = document.querySelector('.panel__input');
const invalidSearchInput = /([^a-z0-9а-яё\s\-\/])|(\s{2,})/gi;

const debounceSearch = debounce(() => {
  searchInput.value = searchInput.value
    .trim()
    .replace(invalidSearchInput, (_, text, spaces) => (spaces ? ' ' : ''))
    .slice(0, 25);

  if (appGoods.search !== searchInput.value) {
    appGoods.search = searchInput.value;
    appGoods.page = 1;
    renderGoods();
  }
}, 500);

export const clearParamSearch = () => {
  if (appGoods.search.length > 0) {
    searchInput.value = '';
    appGoods.search = '';
    return true;
  }
  return false;
};

searchInput.addEventListener('input', debounceSearch);
