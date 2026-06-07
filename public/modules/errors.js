import { appGoods } from './const.js';
import { listModal } from './modal.js';
import { delCookie } from './cookie.js';

export const bagErrors = ({ code = 0, message = '', target = '' }) => {
  switch (target) {
    case 'DELETE':
      return errorMessage(`<h3>ТОВАР НЕ УДАЛЕН</h3><span>${message}</span>`);
    case 'ADD':
      return errorMessage(`<h3>ТОВАР НЕ ДОБАВЛЕН</h3><span>${message}</span>`);
    case 'EDIT':
      return errorMessage(
        `<h3>ИЗМЕНЕНИЯ ТОВАРА НЕ СОХРАНЕНЫ</h3><span>${message}</span>`,
      );
  }

  switch (code) {
    case 401:
      return;
    case 403:
      delCookie();
      history.go(0);
      return;
  }
  errorMessage(`<h3>ОШИБКА - ${code}:</h3><span>${message}</span>`);
};

export const errorMessage = message => {
  const elError = document.createElement('div');
  elError.innerHTML = message;
  elError.classList.add('error_message');
  const errorModal = listModal.open(elError);
  errorModal.classList.add('light');
};
