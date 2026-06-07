import { renderGoods } from './render.js';
import { appGoods } from './const.js';

const subPanel = document.querySelector('.sub-panel');
subPanel.addEventListener('click', e => {
  if (e.target.closest('.sub-panel__left')) {
    --appGoods.page;
    return renderGoods();
  }
  if (e.target.closest('.sub-panel__right')) {
    ++appGoods.page;
    return renderGoods();
  }
});

export const renderPagination = ({ page, inpage, inpagesTotal }) => {
  if (inpagesTotal === 0) {
    subPanel.textContent = 'Данные отсутствуют';
    return;
  }

  subPanel.textContent = '';
  const choicePageElem = document.createElement('p');
  choicePageElem.classList.add('sub-panel__choice-pages');
  choicePageElem.textContent = `Показывать на странице: ${inpage}`;

  const pagesElem = document.createElement('p');
  pagesElem.classList.add('sub-panel__pages');
  pagesElem.textContent = `
    ${(page - 1) * inpage + 1} -
    ${page * inpage < inpagesTotal ? page * inpage : inpagesTotal} из
    ${inpagesTotal}`;

  const arrowsElem = document.createElement('div');
  arrowsElem.classList.add('sub-panel__arrows');

  const leftElem = document.createElement('button');
  leftElem.classList.add('sub-panel__left');
  if (page === 1) leftElem.disabled = true;
  leftElem.textContent = '<';

  const pageElem = document.createElement('p');
  pageElem.classList.add('sub-panel__page');
  pageElem.textContent = page;

  const rightElem = document.createElement('button');
  rightElem.classList.add('sub-panel__right');
  if (page * inpage >= inpagesTotal) rightElem.disabled = true;
  rightElem.textContent = '>';

  arrowsElem.append(leftElem, pageElem, rightElem);
  subPanel.append(choicePageElem, pagesElem, arrowsElem);
};
