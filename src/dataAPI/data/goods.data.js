import { uploadImage64, deleteImages } from './goods.images.js';

const PREFIX_NAME_IMAGE = process.env.PREFIX_NAME_IMAGE || 'image/';

const DB_INSUFFICIENT_STORAGE_MESSAGE =
  'Добавление товаров запрещено. Исчерпан лимит идентификаторов.';
const NOT_FOUND_MESSAGE = 'Данные не найдены';
const BAD_FORMAT_MESSAGE = 'Ошибка формата данных запроса';
const UPLOAD_IMAGE_MESSAGE = 'Ошибка загрузки. Изображение не сохранено';
const DELETE_IMAGE_MESSAGE = 'Ошибка удаления изображений товара';
const NOT_FOUND_DELETE_MESSAGE = 'Удаляемый товар не найден';

const bagError = (method, errMessage) =>
  new Error(`dataAPI/ goods${method}(): ${errMessage}`);

const goodsGet = async (mode, fields, routing) => {
  const g_fields = fields.map(f => `g.${f}`).join(',');
  const fix_fields = [...fields, 'categories_name', 'units_name']
    .filter(f => f !== 'inwork')
    .join(',');
  const designSQL = (
    mode,
    {
      selectInWork,
      selectRowNum,
      countRowNum,
      countTotal,
      orderDiscount,
      whereInwork,
      whereSearch,
      whereIdGoods,
      whereRowNum,
      whereDiscount,
      whereCategories,
    },
  ) => {
    const slicesSQL = {
      beginWITH: `WITH ranked_goods AS (`,
      selectWITH: `SELECT ${g_fields},
                   c.name as categories_name, u.name as units_name`,
      row_numberWITH: `, ROW_NUMBER() OVER (ORDER BY ${orderDiscount}RPAD(g.title,75,'.')||g.id) AS row_num`,
      fromWITH: `FROM goods g LEFT JOIN categories c ON g.categories_id=c.id
                   LEFT JOIN units u ON g.units_id=u.id`,
      whereWITH: `WHERE ${whereInwork} ${whereSearch} ${whereIdGoods} ${whereDiscount} ${whereCategories}`,
      endWITH: `)`,
      select: `SELECT ${countTotal} ${countRowNum} ${selectInWork} ${fix_fields} ${selectRowNum}`,
      from: `FROM ranked_goods`,
      where: `WHERE ${whereRowNum}`,
    };
    if (mode === 'byId') {
      [
        'beginWITH',
        'row_numberWITH',
        'endWITH',
        'select',
        'from',
        'where',
      ].forEach(name => (slicesSQL[name] = ''));
    }

    return `
    ${slicesSQL.beginWITH}
       ${slicesSQL.selectWITH} ${slicesSQL.row_numberWITH} ${slicesSQL.fromWITH} ${slicesSQL.whereWITH}
    ${slicesSQL.endWITH}
    ${slicesSQL.select} ${slicesSQL.from} ${slicesSQL.where}`;
  };

  const isParam = name =>
    routing.params.hasOwnProperty(name) && routing.params[name] !== null;
  const isParamPage = isParam('page');
  const paramsPage = isParamPage ? { ...routing.params.page } : null;
  const isParamTotal = isParam('total') ? routing.params.total : false;

  const makeWhereRowNum = paramsPage => {
    if (paramsPage === null) return 'row_num>0';

    const { mode, inpage, page } = paramsPage;
    return mode === 'number'
      ? `row_num BETWEEN ${inpage * (page - 1) + 1} AND ${inpage * page}`
      : `id = '${page}' limit 1`;
  };

  const makeCountRowNum = paramsPage => {
    if (paramsPage === null) return '';

    const { mode, inpage, page } = paramsPage;
    return mode === 'number'
      ? '(SELECT COUNT(*) FROM ranked_goods) AS row_total,'
      : '';
  };

  const paramSQL = {
    selectInWork: isParam('inwork') ? 'inwork,' : '',
    selectRowNum: mode === 'byId' ? '' : ', row_num',
    orderDiscount:
      mode === 'discount' ? `LPAD((100-g.discount)::VARCHAR(3),3,'0')||` : '',
    countTotal: isParamTotal
      ? '(SELECT SUM(price::bigint * count * (100-discount) / 100) FROM ranked_goods) AS total,'
      : '',
    whereInwork: ['true', 'g.inwork=false', 'g.inwork=true'][
      isParam('inwork') ? routing.params.inwork + 1 : 1
    ],
    whereSearch: isParam('search')
      ? `AND UPPER(g.title) LIKE ANY(ARRAY[` +
        routing.params.search.map(s => `UPPER('%${s}%')`).join(',') +
        `])`
      : '',
    whereIdGoods: isParam('idGoods')
      ? `AND (g.id IN (` +
        routing.params.idGoods.map(id => `'${id}'`).join(',') +
        `))`
      : '',
    whereDiscount: mode === 'discount' ? 'AND g.discount>0' : '',
    whereCategories:
      mode === 'categoriesById'
        ? `AND (c.id IN (` +
          routing.params.idCategories.map(id => `${id}`).join(',') +
          `))`
        : '',
  };
  paramSQL.whereRowNum = makeWhereRowNum(paramsPage);
  paramSQL.countRowNum = makeCountRowNum(paramsPage);

  let sql = designSQL(mode, paramSQL);

  try {
    let data = await routing.pool.query(sql);

    if (isParamPage && paramsPage.mode === 'id') {
      paramsPage.page = 0;
      if (data.rowCount > 0) {
        paramsPage.mode = 'number';
        paramsPage.page =
          Math.trunc((+data.rows[0].row_num - 1) / paramsPage.inpage) + 1;
        paramSQL.whereRowNum = makeWhereRowNum(paramsPage);
        paramSQL.countRowNum = makeCountRowNum(paramsPage);
        sql = designSQL(mode, paramSQL);
        data = await routing.pool.query(sql);
      }
    }

    const result = { rows: data.rows, rowCount: data.rowCount };
    if (isParamPage) {
      result.page = paramsPage.page;
      result.inpage = paramsPage.inpage;
      result.inpagesTotal = data.rowCount > 0 ? data.rows[0].row_total : 0;
    }
    if (isParamTotal) result.total = data.rowCount > 0 ? data.rows[0].total : 0;
    if (isParamPage || isParamTotal)
      result.rows.forEach(row => {
        delete row.row_total;
        delete row.total;
      });
    return result;
  } catch (e) {
    return e.cause ? e : bagError('Get', e.message);
  }
};

const goodsPost = async (mode, fields, defaultValues, routing) => {
  const isUploaded = routing.body.hasOwnProperty('imageBase64');
  if (isUploaded) {
    const ext = routing.body.imageBase64.ext;
    routing.body.image =
      ext.length > 0
        ? `${PREFIX_NAME_IMAGE}'||(select next_id from id_goods)||'.${ext}`
        : defaultValues.image;
  }

  const designSQL = (mode, { fieldsValues }) => {
    const slicesSQL = {
      generateID: `
      WITH id_goods AS (
        UPDATE countkey
          SET keycurrent = CASE
            WHEN keycurrent < keyfirst THEN keyfirst
            WHEN keycurrent < keybottom THEN keycurrent + 1
            ELSE keybottom+1
          END
        WHERE tables = 'goods'
        RETURNING LPAD(CAST(keycurrent AS VARCHAR),10,'0') AS next_id, keybottom
      )`,
      insert: `INSERT INTO goods (${fields.join(',')})`,
      select: `SELECT (select next_id from id_goods),${fieldsValues}`,
      whereNot: `WHERE NOT EXISTS ( select * from id_goods where next_id::BIGINT > keybottom )`,
      returning: `RETURNING ${fields.join(',')};`,
    };

    return `
    ${slicesSQL.generateID} ${slicesSQL.insert} ${slicesSQL.select} ${slicesSQL.whereNot} ${slicesSQL.returning}`;
  };

  const formatValue = v => (typeof v === 'string' ? `'${v}'` : v);
  const paramSQL = {
    fieldsValues: fields
      .filter(field => field !== 'id')
      .map(field =>
        formatValue(
          routing.body.hasOwnProperty(field)
            ? routing.body[field]
            : defaultValues[field],
        ),
      )
      .join(','),
  };

  let sql = designSQL(mode, paramSQL);

  try {
    let data = await routing.pool.query(sql);
    if (data.rowCount === 0)
      throw new Error(DB_INSUFFICIENT_STORAGE_MESSAGE, { cause: 507 });

    if (isUploaded) {
      routing.body.image = data.rows[0].image;
      if (routing.body.image !== defaultValues.image) {
        if (!(await uploadImage64(routing)))
          throw new Error(UPLOAD_IMAGE_MESSAGE, { cause: 500 });
      }
    }
    return { rows: data.rows, rowCount: data.rowCount };
  } catch (e) {
    return e.cause ? e : bagError('Post', e.message);
  }
};

const goodsPatch = async (mode, fields, defaultValues, routing) => {
  const isUploaded = routing.body.hasOwnProperty('imageBase64');
  if (isUploaded) {
    const ext = routing.body.imageBase64.ext;
    routing.body.image =
      ext.length > 0
        ? `${PREFIX_NAME_IMAGE}${routing.params.idGood}.${ext}`
        : defaultValues.image;
    fields.push('image');
  }

  const designSQL = (mode, { idGood, fieldsValues }) => {
    const slicesSQL = {
      update: `UPDATE goods`,
      set: `SET ${fieldsValues}`,
      where: `WHERE id = '${idGood}'`,
      returning: `RETURNING ${fields.join(',')};`,
    };

    return `
    ${slicesSQL.update} ${slicesSQL.set} ${slicesSQL.where} ${slicesSQL.returning}`;
  };

  const formatValue = v => (typeof v === 'string' ? `'${v}'` : v);

  const paramSQL = {
    idGood: routing.params.idGood,
    fieldsValues: Object.keys(routing.body)
      .filter(field => field !== 'id' && fields.includes(field))
      .map(field => `${field}=${formatValue(routing.body[field])}`)
      .join(','),
  };

  let sql = designSQL(mode, paramSQL);

  try {
    let data = await routing.pool.query(sql);
    if (data.rowCount === 0) throw new Error(NOT_FOUND_MESSAGE, { cause: 404 });

    if (isUploaded) {
      if (routing.body.image !== defaultValues.image) {
        if (!(await uploadImage64(routing)))
          throw new Error(UPLOAD_IMAGE_MESSAGE, { cause: 500 });
      }
    }

    return { rows: data.rows, rowCount: data.rowCount };
  } catch (e) {
    if (e.message.includes('UPDATE')) {
      e.cause = 400;
      e.message = BAD_FORMAT_MESSAGE;
    }
    return e.cause ? e : bagError('Patch', e.message);
  }
};

const goodsDelete = async (mode, fields, routing) => {
  const designSQL = (mode, { fieldsValues }) => {
    const slicesSQL = {
      delete: `DELETE FROM goods`,
      where: `WHERE id IN (${fieldsValues})`,
      returning: `RETURNING ${fields.join(',')};`,
    };

    return `
    ${slicesSQL.delete} ${slicesSQL.where} ${slicesSQL.returning}`;
  };

  const paramSQL = {
    fieldsValues: routing.params.idGoods.map(value => `'${value}'`).join(','),
  };

  let sql = designSQL(mode, paramSQL);

  try {
    if (!(await deleteImages(routing)))
      throw new Error(DELETE_IMAGE_MESSAGE, { cause: 500 });

    let data = await routing.pool.query(sql);
    if (data.rowCount === 0)
      throw new Error(NOT_FOUND_DELETE_MESSAGE, { cause: 404 });

    return { rows: data.rows, rowCount: data.rowCount };
  } catch (e) {
    return e.cause ? e : bagError('Delete', e.message);
  }
};

export const indexGoods = (method, mode, fields, defaultValues, routing) => {
  switch (method) {
    case 'get':
      return goodsGet(mode, fields, routing);
    case 'post':
      return goodsPost(mode, fields, defaultValues, routing);
    case 'patch':
      return goodsPatch(mode, fields, defaultValues, routing);
    case 'delete':
      return goodsDelete(mode, fields, routing);

    default:
      return new Error(`dataAPI: отсутствует обработчик ${routing.signature}`);
  }
};
