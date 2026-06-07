const BAD_FORMAT_MESSAGE = 'Ошибка формата данных запроса';
const DEF_NAME_IMAGE = process.env.DEF_NAME_IMAGE || 'image/prototype.jpg';
const PREFIX_NAME_IMAGE = process.env.PREFIX_NAME_IMAGE || 'image/';
const regexNameImage = new RegExp(
  `^${PREFIX_NAME_IMAGE.slice(0, 5)}\/[0-9]{10}\.(jpg|png|svg)$`,
);

const validateField = {
  autch: { password: [value => (value + '').slice(0, 8), null] },
  goods: {
    id: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{10}$/.test(v) && +v > 0) return v;
        return null;
      },
      null,
    ],
    title: [
      (value, isFullSet = true) => {
        let v = (value + '').trim().replace(/\s\s/g, '').slice(0, 255);
        if (isFullSet) v = v[0].toUpperCase() + v.slice(1);
        if (/^[a-z0-9а-яё\s\-\/]+$/i.test(v)) return v;
        return null;
      },
      'товар',
    ],
    price: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{1,9}$/.test(v)) return +v;
        return null;
      },
      0,
    ],
    description: [
      value => {
        let v = (value + '').trim().replace(/\s\s/g, '').slice(0, 1300);
        if (/^[a-z0-9а-яё\s\!\"\№\;\%\:\?\*\(\)\-\+\=\/\.\,]*$/i.test(v))
          return v;
        return null;
      },
      '...',
    ],
    discount: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{1,3}$/.test(v) && v > -1 && v < 101) return +v;
        return null;
      },
      0,
    ],
    count: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{1,7}$/.test(v) && v > -1) return +v;
        return null;
      },
      0,
    ],
    image: [
      value => {
        let v = (value + '').replace(/\s/g, '').slice(0, 20).toLowerCase();
        if (v === DEF_NAME_IMAGE) return v;
        if (regexNameImage.test(v) && +v.slice(6, 16) > 0) return v;
        return null;
      },
      DEF_NAME_IMAGE,
    ],
    imageBase64: [
      value => {
        const format = value.match(/^data:image\/([a-z+]+);base64,/i)[1];
        if (['png', 'svg+xml', 'jpeg'].includes(format)) {
          const ext =
            format === 'svg+xml' ? 'svg' : format === 'jpeg' ? 'jpg' : 'png';
          return { value: value.split(';base64,')[1], ext };
        }
        return null;
      },
      'pseudo',
    ],
    categories_id: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{1,10}$/.test(v) && +v > 0) return +v;
        return null;
      },
      1,
    ],
    units_id: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{1,5}$/.test(v) && +v > 0) return +v;
        return null;
      },
      1,
    ],
    inwork: [value => (typeof value === 'boolean' ? value : null), true],
  },
  categories: {
    id: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{1,10}$/.test(v) && +v > 0) return +v;
        return null;
      },
      null,
    ],
    name: [
      (value, isFullSet) => {
        let v = (value + '').trim().replace(/\s\s/g, '').slice(0, 25);
        if (isFullSet) v = v[0].toUpperCase() + v.slice(1);
        if (/^[a-zа-яё\s]+$/i.test(v)) return v;
        return null;
      },
      'категория',
    ],
  },
  units: {
    id: [
      value => {
        const v = (value + '').trim();
        if (/^[0-9]{1,5}$/.test(v) && +v > 0) return +v;
        return null;
      },
      null,
    ],
    name: [
      value => {
        let v = (value + '')
          .trim()
          .replace(/\s\s/g, '')
          .slice(0, 6)
          .toLowerCase();
        if (/^[a-z0-9а-яё\s\.\/]+$/.test(v)) return v;
        return null;
      },
      'ед.изм.',
    ],
  },
};
export const defaultFieldsValues = Object.keys(validateField).reduce(
  (o, table) => (
    (o[table] = Object.keys(validateField[table]).reduce(
      (ot, field) => ((ot[field] = validateField[table][field][1]), ot),
      {},
    )),
    o
  ),
  {},
);

const validateParam = {
  search: (value, table) => {
    const field = table === 'goods' ? 'title' : 'name';
    const vs = decodeURIComponent(value)
      .split(',')
      .map(v => validateField[table][field][0](v, false));
    if (vs.includes(null)) return null;
    return vs;
  },
  page: (value, table) => {
    const vo = { mode: 'number' };

    [vo.page, vo.inpage] = value.replace(/\s/g, '').split(',');

    if (vo.page[0] === '{' && vo.page.slice(-1) === '}') vo.mode = 'id';

    if (vo.mode === 'number') {
      if (!vo.page) vo.page = '1';
      if (!/^[0-9]{1,10}$/.test(vo.page) || +vo.page < 1) return null;
      vo.page = +vo.page;
    } else {
      vo.page = validateField[table].id[0](vo.page.slice(1, -1));
      if (vo.page === null) return null;
    }

    if (!vo.inpage) vo.inpage = '10';
    if (!/^[0-9]{1,10}$/.test(vo.inpage) || +vo.inpage < 1) return null;
    vo.inpage = +vo.inpage;
    return vo;
  },
  inwork: value => {
    if (/^(1||-1||0)$/.test(value.trim())) return +value;
    return null;
  },
  total: value => {
    if (value.trim() === '') return true;
    if (/^(true||false)$/.test(value.trim())) return value.trim() === 'true';
    return null;
  },
  idGood: value => validateField.goods.id[0](value),
  idGoods: value => {
    const vs = value.split(',').map(v => validateField.goods.id[0](v));
    if (vs.includes(null)) return null;
    return vs;
  },
  idCategory: value => validateField.categories.id[0](value),
  idCategories: value => {
    const vs = value.split(',').map(v => validateField.categories.id[0](v));
    if (vs.includes(null)) return null;
    return vs;
  },
  idUnit: value => validateField.units.id[0](value),
  idUnits: value => {
    const vs = value.split(',').map(v => validateField.units.id[0](v));
    if (vs.includes(null)) return null;
    return vs;
  },
};

export const validatorAPI = (req, res, routing) => {
  try {
    const [table, method] = routing.signature.split('_');

    for (const param in routing.params) {
      const value = routing.params[param];
      if (value === null) continue;

      const valueValid = validateParam[param](value, table);
      if (valueValid === null) {
        throw new Error(
          `${BAD_FORMAT_MESSAGE}: ${param}=${routing.params[param]}`,
        );
      }
      routing.params[param] = valueValid;
    }

    if (['post', 'patch'].includes(method)) {
      const body = routing.body;
      if (
        !(typeof body === 'object' && body !== null && !Array.isArray(body))
      ) {
        throw new Error(
          `${BAD_FORMAT_MESSAGE}: ${method.toUpperCase()} тип body не объект`,
        );
      }

      for (const field in body) {
        if (!validateField[table].hasOwnProperty(field)) {
          throw new Error(
            `${BAD_FORMAT_MESSAGE}: ${method} не допустимое свойство ${field} в body`,
          );
        }

        const value = body[field];
        const valueValid = validateField[table][field][0](value);
        if (valueValid === null) {
          throw new Error(`${BAD_FORMAT_MESSAGE}: ${field}=${body[field]}`);
        }
        body[field] = valueValid;
      }
    }
    return true;
  } catch (e) {
    routing.logger.log(e.message);
    res.statusCode = 400;
    res.end(JSON.stringify({ message: BAD_FORMAT_MESSAGE }));
    return false;
  }
};
