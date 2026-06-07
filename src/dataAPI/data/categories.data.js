const NOT_FOUND_MESSAGE = 'Данные не найдены';
const FORBIDEN_REQUEST_DELETE_MESSAGE =
  'Запрещено удалять категорию, назначенную товарам';

const bagError = (method, errMessage) =>
  new Error(`dataAPI/ categories${method}(): ${errMessage}`);

const categoriesGet = async (mode, fields, routing) => {
  const designSQL = (
    mode,
    { selectRowNum, countRowNum, whereSearch, whereIdCategories, whereRowNum },
  ) => {
    const slicesSQL = {
      beginWITH: `WITH ranked_categories AS (`,
      selectWITH: `SELECT ${fields.join()}`,
      row_numberWITH: `, ROW_NUMBER() OVER (ORDER BY RPAD(name,75,'.')||id::varchar(10)) AS row_num`,
      fromWITH: `FROM categories`,
      whereWITH: `WHERE true ${whereSearch} ${whereIdCategories}`,
      endWITH: `)`,
      select: `SELECT ${countRowNum} ${fields.join()} ${selectRowNum}`,
      from: `FROM ranked_categories`,
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

  const makeWhereRowNum = paramsPage => {
    if (paramsPage === null) return 'row_num>0';

    const { mode, inpage, page } = paramsPage;
    return mode === 'number'
      ? `row_num BETWEEN ${inpage * (page - 1) + 1} AND ${inpage * page}`
      : `id = '${page}' limit 1`;
  };

  const makeCountRowNum = paramsPaage => {
    if (paramsPage === null) return '';

    const { mode, inpage, page } = paramsPage;
    return mode === 'number'
      ? '(SELECT COUNT(*) FROM ranked_goods) AS row_total,'
      : '';
  };

  const paramSQL = {
    selectRowNum: mode === 'byId' ? '' : ', row_num',
    whereSearch: isParam('search')
      ? `AND UPPER(name) LIKE ANY(ARRAY[` +
        routing.params.search.map(s => `UPPER('%${s}%')`).join(',') +
        `])`
      : '',
    whereIdCategories: isParam('idCategories')
      ? `AND (id IN (` +
        routing.params.idCategories.map(id => `${id}`).join(',') +
        `))`
      : '',
  };
  paramSQL.whereRowNum = makeWhereRowNum(paramsPage);
  paramSQL.countRowNum = makeCountRowNum(paramSQL);

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

      result.rows.forEach(row => delete row.row_total);
    }
    return result;
  } catch (e) {
    return e.cause ? e : bagError('Get', e.message);
  }
};

const categoriesPost = async (mode, fields, defaultValues, routing) => {
  const designSQL = (mode, { fieldsValues }) => {
    const slicesSQL = {
      insert: `INSERT INTO categories (${fields.join(',')})`,
      values: `VALUES (DEFAULT,${fieldsValues})`,
      returning: `RETURNING ${fields.join(',')};`,
    };

    return `
    ${slicesSQL.insert} ${slicesSQL.values} ${slicesSQL.returning}`;
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

    return { rows: data.rows, rowCount: data.rowCount };
  } catch (e) {
    return bagError('Post', e.message);
  }
};

const categoriesPatch = async (mode, fields, routing) => {
  const designSQL = (mode, { idCategory, fieldsValues }) => {
    const slicesSQL = {
      update: `UPDATE categories`,
      set: `SET ${fieldsValues}`,
      where: `WHERE id = '${idCategory}'`,
      returning: `RETURNING ${fields.join(',')};`,
    };

    return `
    ${slicesSQL.update} ${slicesSQL.set} ${slicesSQL.where} ${slicesSQL.returning}`;
  };

  const formatValue = v => (typeof v === 'string' ? `'${v}'` : v);

  const paramSQL = {
    idCategory: routing.params.idCategory,
    fieldsValues: Object.keys(routing.body)
      .filter(field => field !== 'id' && fields.includes(field))
      .map(field => `${field}=${formatValue(routing.body[field])}`)
      .join(','),
  };

  let sql = designSQL(mode, paramSQL);

  try {
    let data = await routing.pool.query(sql);
    if (data.rowCount === 0) throw new Error(NOT_FOUND_MESSAGE, { cause: 404 });

    return { rows: data.rows, rowCount: data.rowCount };
  } catch (e) {
    return e.cause ? e : bagError('Patch', e.message);
  }
};

const categoriesDelete = async (mode, fields, routing) => {
  const designSQL = (mode, { fieldsValues }) => {
    const slicesSQL = {
      delete: `DELETE FROM categories`,
      where: `WHERE id IN (${fieldsValues})`,
      returning: `RETURNING ${fields.join(',')};`,
    };

    return `
    ${slicesSQL.delete} ${slicesSQL.where} ${slicesSQL.returning}`;
  };

  const paramSQL = {
    fieldsValues: routing.params.idCategories
      .map(value => `'${value}'`)
      .join(','),
  };

  let sql = designSQL(mode, paramSQL);

  try {
    let data = await routing.pool.query(sql);
    if (data.rowCount === 0) throw new Error(NOT_FOUND_MESSAGE, { cause: 404 });

    return { rows: data.rows, rowCount: data.rowCount };
  } catch (e) {
    if (e.message.includes('DELETE')) {
      e.cause = 403;
      e.message = FORBIDEN_REQUEST_DELETE_MESSAGE;
    }
    return e.cause ? e : bagError('Delete', e.message);
  }
};

export const indexCategories = (
  method,
  mode,
  fields,
  defaultValues,
  routing,
) => {
  switch (method) {
    case 'get':
      return categoriesGet(mode, fields, routing);
    case 'post':
      return categoriesPost(mode, fields, defaultValues, routing);
    case 'patch':
      return categoriesPatch(mode, fields, routing);
    case 'delete':
      return categoriesDelete(mode, fields, routing);

    default:
      return new Error(`dataAPI: отсутствует обработчик ${routing.signature}`);
  }
};
