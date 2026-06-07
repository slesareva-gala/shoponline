import create, { appGoods } from './const.js';
const { table } = create;
import { getTotal } from './summs.js';

import { goodscard } from './goodscard.js';
import { viewingPicture } from './picture.js';

const createRow = ({
  id,
  title,
  price,
  category,
  count,
  units,
  discount,
  description,
  inwork,
  image,
}) => {
  const tr = document.createElement('tr');
  tr.classList.add('row');
  tr.dataset.id = id;

  const tdNumber = document.createElement('td');
  tdNumber.classList.add('table__cell', 'table__cell-num');

  const tdInwork = document.createElement('td');
  tdInwork.classList.add('table__cell', 'table__cell_left');
  if (!appGoods.autch) tdInwork.classList.add('visually-hidden');

  tdInwork.textContent = inwork ? 'оформление' : 'продажа';

  const tdTitle = document.createElement('td');
  tdTitle.classList.add('table__cell', 'table__cell_left', 'table__cell_name');

  const idSpan = document.createElement('span');
  idSpan.classList.add('table__cell-id');
  idSpan.textContent = 'ID: ' + id;
  tdTitle.textContent = title;

  tdTitle.prepend(idSpan);

  const tdCategory = document.createElement('td');
  tdCategory.classList.add('table__cell', 'table__cell_left');
  tdCategory.textContent = category;

  const tdUnit = document.createElement('td');
  tdUnit.classList.add('table__cell');
  tdUnit.textContent = units;

  const tdCount = document.createElement('td');
  tdCount.classList.add('table__cell');
  tdCount.textContent = count;

  const tdPrice = document.createElement('td');
  tdPrice.classList.add('table__cell', 'table__cell_right');
  tdPrice.textContent = price;

  const tdDiscount = document.createElement('td');
  tdDiscount.classList.add('table__cell', 'table__cell_right');
  tdDiscount.textContent = discount || '-';

  const tdTotal = document.createElement('td');
  tdTotal.classList.add('table__cell', 'table__cell_right', 'table__total');
  const total = getTotal(count, price, discount);
  tdTotal.textContent = total;

  const tdImages = document.createElement('td');
  tdImages.classList.add('table__cell', 'table__cell_btn-wrapper');

  const buttonPic = document.createElement('button');
  buttonPic.classList.add('table__btn', 'table__btn_pic');

  const buttonEye = document.createElement('button');
  buttonEye.classList.add('table__btn', 'table__btn_eye');
  if (appGoods.autch) buttonEye.classList.add('visually-hidden');

  const buttonEdit = document.createElement('button');
  buttonEdit.classList.add('table__btn', 'table__btn_edit');
  if (!appGoods.autch) buttonEdit.classList.add('visually-hidden');

  const buttonDel = document.createElement('button');
  buttonDel.classList.add('table__btn', 'table__btn_del');
  if (!appGoods.autch) buttonDel.classList.add('visually-hidden');

  tdImages.append(buttonPic, buttonEye, buttonEdit, buttonDel);

  tr.append(
    tdNumber,
    tdInwork,
    tdTitle,
    tdCategory,
    tdUnit,
    tdCount,
    tdPrice,
    tdDiscount,
    tdTotal,
    tdImages,
  );
  return tr;
};

const numbersInOrder = (page, inpage) => {
  const numTd = table.querySelectorAll('.table__cell-num');

  let n = (page - 1) * inpage + 1;
  numTd.forEach(i => {
    i.textContent = n++;
  });
};

table.addEventListener('click', async e => {
  if (e.target.closest('.table__btn')) {
    const mode = e.target.classList.value.split('_').pop();

    const row = e.target.closest('tr');
    appGoods.idGood = row.dataset.id;
    const good = await appGoods.query('good');
    if (good === null) return;

    if (mode === 'pic') return viewingPicture(good.image, good.title);
    goodscard(mode, good);
  }
});

export { numbersInOrder, createRow };
