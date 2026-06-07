import { setCookie, getCookie, delCookie } from './cookie.js';
import { appGoods } from './const.js';
import { renderAPP } from './render.js';

const blockAutch = document.querySelector('.autch');
const panelAutch = blockAutch.querySelector('.panel__autch');
const btnUIexit = blockAutch.querySelector('.button-ui_exit');
const inputPassword = panelAutch.querySelector('.password');
const checkRemember = panelAutch.querySelector('#remember');
const textWarning = panelAutch.querySelector('.text-warning');

const clearPanelAutch = () => {
  inputPassword.value = '';
  checkRemember.checked = false;
  textWarning.style.display = 'none';
};

const entryAdmin = autch => {
  appGoods.autch = autch;
  if (('check', checkRemember.checked)) setCookie(autch);
  panelAutch.classList.remove('open');
  clearPanelAutch();
  setAutchName();
  refrechAPP();
};

export const exitAdmin = () => {
  appGoods.autch = '';
  delCookie();
  setAutchName();
  refrechAPP();
};

const refrechAPP = () => {
  const isAdmin = appGoods.autch.length > 0;
  appGoods.inwork = isAdmin ? -1 : null;
  renderAPP();
};

blockAutch.addEventListener('click', async e => {
  if (e.target.closest('.autch__btn')) {
    if (appGoods.autch) {
      btnUIexit.classList.toggle('open');
      return;
    }
    if (panelAutch.classList.contains('open')) {
      clearPanelAutch();
    }
    panelAutch.classList.toggle('open');
    setAutchName();
    return;
  }

  if (e.target.closest('.button-ui_exit')) {
    btnUIexit.classList.remove('open');
    exitAdmin();
    return;
  }

  if (e.target.closest('.button-ui_form')) {
    let autch = null;
    const password = inputPassword.value;
    if (password.trim() !== '') {
      appGoods.body.password = password.slice(0, 10).trim();
      autch = await appGoods.query('autch');
    }
    if (autch === null) {
      inputPassword.value = '';
      textWarning.style.display = 'inline-block';
      return;
    }

    entryAdmin(autch);
  }
});

blockAutch.addEventListener('input', e => {
  if (e.target.matches('.password')) {
    e.target.nextElementSibling.style.display = '';
  }
});

blockAutch.addEventListener('submit', e => {
  e.preventDefault();
});

const setAutchName = () => {
  setTimeout(() => {
    const name = appGoods.autch ? 'Администратор' : 'Гость';
    blockAutch.querySelector('.autch__name').textContent = name;
  }, 0);
};

export const authorization = () => {
  const autch = getCookie();

  if (autch) {
    appGoods.autch = autch;
    appGoods.inwork = -1;
  }
  setAutchName();
};
