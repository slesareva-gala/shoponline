import { bagErrors } from './errors.js';

const API_URL = 'http://a1262840.xsph.ru/';
const GOODS_URL = `${API_URL}api/goods`;
const CATEGORY_URL = `${API_URL}api/categories`;
const UNIT_URL = `${API_URL}api/units`;
const AUTCH_URL = `${API_URL}api/autch`;
const defNameImage = 'image/prototype.jpg';

class Goods {
  constructor(url) {
    this.url = url || GOODS_URL;
    this.urlAutch = this.urlAutch || AUTCH_URL;
    this.path = '';
    this.page = 1;
    this.inpage = 5;
    this.search = '';
    this.idCategory = 0;
    this.idGood = '';
    this.body = {};
    this.autch = '';
    this.inwork = null;
    this.inpagesTotal = 0;
  }

  async query(mode = 'list') {
    let path = '',
      params = '';

    switch (mode) {
      case 'list':
      case 'listId':
        path = this.path.length > 0 ? `/${this.path}` : '';
        if (this.path === 'categories') path += `/{${this.idCategory}}`;
        params = `?total&page=${mode === 'list' ? this.page : `{${this.idGood}}`},${this.inpage}`;
        params +=
          this.search.length > 0
            ? `&search=${encodeURIComponent(this.search)}`
            : '';
        params += this.inwork === null ? '' : `&inwork=${this.inwork}`;
        params += this.autch === '' ? '' : `&autch=${this.autch}`;
        this.idGood = '';
        return await this.load(path, params);

      case 'good':
        path = `/{${this.idGood}}`;
        params = this.inwork === null ? '' : `?inwork=${this.inwork}`;
        params += this.autch === '' ? '' : `&autch=${this.autch}`;
        this.idGood = '';
        return await this.loadId(path, params);

      case 'add':
      case 'edit':
        if (mode === 'edit') path = `/{${this.idGood}}`;
        params = this.autch === '' ? '' : `?autch=${this.autch}`;
        this.idGood = '';
        return await this.saveId(
          mode === 'add' ? 'POST' : 'PATCH',
          path,
          params,
        );

      case 'del':
        path = `/{${this.idGood}}`;
        params = this.autch === '' ? '' : `?autch=${this.autch}`;
        this.idGood = '';
        return await this.delId(path, params);

      case 'autch':
        return await this.getAutch();
    }
  }

  async load(path, params) {
    const url = `${this.url}${path}${params}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message, { cause: response.status });
      return data;
    } catch (e) {
      bagErrors({ code: e.cause, message: e.message, target: url });
      return null;
    }
  }

  async loadId(path, params) {
    const url = `${this.url}${path}${params}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message, { cause: response.status });
      if (data.rowCount === 0) throw new Error('error');
      return data.rows[0];
    } catch (e) {
      bagErrors({ code: e.cause, message: e.message, target: url });
      return null;
    }
  }

  async saveId(method, path, params) {
    const url = `${this.url}${path}${params}`;
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.body),
      });
      this.body = {};

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message, { cause: response.status });
      if (data.rowCount === 0) throw new Error('error');
      return data.rows[0];
    } catch (e) {
      bagErrors({
        code: e.cause,
        message: e.message,
        target: method === 'POST' ? 'ADD' : 'EDIT',
      });
      return null;
    }
  }

  async delId(path, params) {
    const url = `${this.url}${path}${params}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message, { cause: response.status });

      if (
        appGoods.page > 1 &&
        appGoods.inpagesTotal - appGoods.inpage * (appGoods.page - 1) === 1
      )
        appGoods.page--;
      return true;
    } catch (e) {
      bagErrors({ code: e.cause, message: e.message, target: 'DELETE' });
      return null;
    }
  }

  async getAutch() {
    const url = this.urlAutch;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.body),
      });
      this.body = {};

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message, { cause: response.status });
      if (data.rowCount === 0) throw new Error('error');
      return data.autch;
    } catch (e) {
      bagErrors({ code: e.cause, message: e.message, target: url });
      return null;
    }
  }
}

class Quide {
  constructor(url) {
    this.url = url;
    this.defaultID = 1;
    this.selectedIndex = 0;
  }

  async query(mode = 'list') {
    let path = '',
      params = '';

    switch (mode) {
      case 'list':
        return await this.load(path, params);
    }
  }

  async load(path, params) {
    const url = `${this.url}${path}${params}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message, { cause: response.status });
      return data.rows;
    } catch (e) {
      bagErrors({ code: e.cause, message: e.message, target: url });
      return null;
    }
  }
}

export const appGoods = new Goods(GOODS_URL);
export const appCategories = new Quide(CATEGORY_URL);
export const appUnits = new Quide(UNIT_URL);

export const hasPicGood = async pic => {
  try {
    if (pic === defNameImage) return true;
    const response = await fetch(`${API_URL}${pic}`, {
      method: 'HEAD',
    });
    if (response.ok) return true;
    return false;
  } catch {
    return false;
  }
};

const panelFilterInwork = document.querySelector('.panel__filter_inwork');
const btnAddGoods = document.querySelector('.panel__add-goods');
const tableHeaderInwork = document.querySelector('.table__header-inwork');
const table = document.querySelector('.table__body');

const modalTemplateCard = document.getElementById('modal-template-card');
const modalLayoutCard = modalTemplateCard ? modalTemplateCard.content : null;

function setPreloader(elPreloader) {
  let elCurrent = null;
  let preloaderCount = 0;
  return selector => {
    elCurrent = selector ? document.querySelector(selector) : null;
    preloaderCount += selector ? 1 : -1;

    if (elCurrent) {
      elCurrent.append(elPreloader);
      elPreloader.style.display = 'block';
    } else if (preloaderCount === 0) {
      document.querySelector('body').append(elPreloader);
      elPreloader.style.display = '';
    }
  };
}
const preloader = setPreloader(document.getElementById('preloader'));

export default {
  panelFilterInwork,
  btnAddGoods,
  tableHeaderInwork,
  table,
  defNameImage,
  modalLayoutCard,
  preloader,
};
