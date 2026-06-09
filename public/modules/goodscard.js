import create, { appGoods, hasPicGood } from './const.js';
const { btnAddGoods, modalLayoutCard, defNameImage, preloader } = create;
import { listModal } from './modal.js';
import { getTotal } from './summs.js';
import { renderGoods } from './render.js';
import { toBase64 } from './picture.js';
import { errorMessage } from './errors.js';

const defaultGood = {
  title: '',
  description: '',
  categories_id: 1,
  units_id: 1,
  count: 0,
  discount: 0,
  price: 0,
  inwork: false,
  image: defNameImage,
};

const setDefaultSelect = (select, value) => {
  const setValue =
    select.id === 'category' ? appGoods.idCategory || value : value;
  let i = 0;
  for (let option of select) {
    if (option.value === setValue) {
      select.selectedIndex = i;
    }
    i++;
  }
  if (select.id === 'category')
    select.style.pointerEvents = appGoods.idCategory > 0 ? 'none' : 'auto';
};

const createGoodCard = async (mode, good) => {
  if (modalLayoutCard === null) return null;
  const cloneModalCard = modalLayoutCard.cloneNode(true);
  const modalCard = listModal.open(cloneModalCard);

  modalCard.querySelector('.card__title').textContent = {
    add: 'Новый товар',
    eye: 'Просмотр товара',
    edit: 'Редактировать товар',
    del: 'Удаление товара',
  }[mode];

  if (mode === 'eye' || mode === 'edit' || mode === 'del') {
    modalCard.querySelector('.vendor-code__txt').textContent = 'id: ';
    modalCard.querySelector('.vendor-code__id').textContent = good.id;
  } else modalCard.querySelector('.vendor-code').remove();

  modalCard.querySelector('#title').value = good.title;

  const categories = modalCard.querySelector('#category');
  setDefaultSelect(categories, `${good.categories_id}`);

  if (mode === 'add' || mode === 'edit' || mode === 'del') {
    const elInwork = modalCard.querySelector('#inwork');
    const inwork =
      mode === 'add'
        ? appGoods.inwork === -1 || appGoods.inwork === 1
        : good.inwork;
    elInwork.selectedIndex = inwork ? 1 : 0;
    elInwork.style.pointerEvents =
      appGoods.inwork === null || appGoods.inwork > -1 ? 'none' : 'auto';
  } else modalCard.querySelector('.card__label_inwork').remove();

  if (mode === 'add' || mode === 'edit' || mode === 'eye') {
    modalCard.querySelector('#price').value = good.price;
    modalCard.querySelector('#count').value = good.count;
    const units = modalCard.querySelector('#units');
    setDefaultSelect(units, `${good.units_id}`);
    modalCard.querySelector('#discount').value = good.discount;
  } else {
    modalCard.querySelector('.card__label_price').remove();
    modalCard.querySelector('.card__label_count').remove();
    modalCard.querySelector('.card__label_units').remove();
    modalCard.querySelector('.card__label_discount').remove();
  }

  if (mode === 'del') {
    modalCard.querySelector('.card__label_description').remove();
  } else if (mode === 'eye') {
    modalCard.querySelector('#description_eye').innerHTML =
      good.description.replaceAll('\\n', '<br/>');
    modalCard.querySelector('.card__input_textarea').remove();
  } else {
    modalCard.querySelector('#description').innerHTML =
      good.description.replaceAll('\\n', '&#13;&#10;');
    modalCard.querySelector('.card__input_textarea_eye').remove();
  }

  modalCard.querySelector('.card__total-price').innerHTML = `${getTotal(
    good.price,
    good.count,
    good.discount,
  )} &#8381;`;

  if (mode === 'add' || mode === 'eye' || mode === 'edit') {
    const cardImage = modalCard.querySelector('.card__label_file-add img');
    const nameImage = (await hasPicGood(good.image))
      ? good.image
      : defNameImage;
    cardImage.src = nameImage;
    cardImage.alt = `изображение товара${nameImage === defNameImage ? ' отсутствует' : ': ' + good.title}`;
  }
  if (mode === 'del') {
    modalCard.querySelector('.card__label_file-add').remove();
    modalCard.querySelector('.card__fieldset').classList.add('del');
  }
  if (mode === 'eye' || mode === 'del') {
    modalCard.querySelector('.card__label_file').remove();
    modalCard.querySelector('.card__fieldset').classList.add('eye');
  }

  const btnGoodCardSubmit = modalCard.querySelector('.card__submit');
  btnGoodCardSubmit.classList.add(mode);
  btnGoodCardSubmit.textContent = {
    add: 'Сохранить товар',
    eye: 'Закрыть',
    edit: 'Сохранить изменения',
    del: 'Удалить товар',
  }[mode];
  btnGoodCardSubmit.good = good;

  return modalCard;
};

const addEventCoodCard = (mode, modalCard, good) => {
  if (mode === 'eye') {
    modalCard.querySelector('.card__submit').addEventListener('click', e => {
      e.preventDefault();
      listModal.close();
    });
    return;
  }

  if (mode === 'del') {
    modalCard
      .querySelector('.card__submit')
      .addEventListener('click', async e => {
        e.preventDefault();

        preloader('.card__submit');
        appGoods.idGood = e.target.good.id;
        const data = await appGoods.query('del');

        preloader();
        if (data === null) return;

        listModal.close();
        renderGoods();
      });
    return;
  }

  const cardImage = modalCard.querySelector('.card__label_file-add img');
  modalCard.querySelector('.card__file').addEventListener('change', e => {
    if (e.target.files.length < 1) return;
    let isError = false;

    const selectedFile = e.target.files[0];
    if (selectedFile.type.match(/image\/((jpeg)|(png)|(svg\+xml))/)) {
      const fileSize500Kb = selectedFile.size / (512 * 1024);
      if (fileSize500Kb > 1) {
        isError = true;
        errorMessage(
          `<h3>НЕДОПУСТИМЫЙ РАЗМЕР ИЗОБРАЖЕНИЯ</h3>
          <span>Изображение не должно превышать 512 Кб,<br/>размер выбранного - ${(selectedFile.size / 1024).toFixed(1)} Kб<span>`,
        );
      }
    } else {
      isError = true;
      errorMessage(
        `<h3>НЕДОПУСТИМЫЙ ФОРМАТ ИЗОБРАЖЕНИЯ</h3>
          <span>Для загрузки используйте файлы с расширениями: <b>jpg</b> / <b>jpeg</b> или <b>png</b> или <b>svg</b><span>`,
      );
    }

    const src = isError ? defNameImage : URL.createObjectURL(selectedFile);
    cardImage.src = src;
  });

  const invalid = {
    title: /([^a-z0-9а-яё\s\-\/])|(\s{2,})/gi,
    description: /([^a-z0-9а-яё\s\!\"\№\;\%\:\?\*\(\)\-\+\=\/\.\,])/gi,
    number: /[^0-9]+/g,
  };

  const fieldsForm = target => {
    const fields = ['title', 'description', 'price', 'count', 'discount'];
    const index = fields.findIndex(id => target.closest(`#${id}`));
    if (index < 0) return null;
    return fields[index];
  };

  modalCard.addEventListener('input', e => {
    const field = fieldsForm(e.target);
    if (field === null) return;

    if (field === 'title' || field === 'description') {
      let value = e.target.value.replace(invalid[field], (_, text, spaces) =>
        spaces ? ' ' : '',
      );
      if (field === 'title' && value.length > 0)
        value = value[0].toUpperCase() + value.slice(1);
      value = value.slice(0, field === 'title' ? 255 : 1300);

      e.target.value = value;
      e.target.classList.remove('error-input');
      return;
    }
    if (field === 'price' || field === 'count' || field === 'discount') {
      const length = { price: 9, discount: 3, count: 7 };
      let value = +`${e.target.value}`
        .replace(invalid.number, '')
        .slice(0, length[field]);
      if (field === 'discount' && value > 100) value = 100;
      e.target.value = value;

      const form = e.target.form;
      form.querySelector('.card__total-price').innerHTML = `${getTotal(
        +form.querySelector('#price').value,
        +form.querySelector('#count').value,
        +form.querySelector('#discount').value,
      )} &#8381;`;

      e.target.classList.remove('error-input');
      return;
    }
  });

  modalCard.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formBody = {};
    const imageAdded =
      e.target.querySelector('#file-add img').src.slice(0, 5) === 'blob:';

    formData.forEach((val, key) => {
      const keyData =
        key === 'category'
          ? 'categories_id'
          : key === 'units'
            ? 'units_id'
            : key === 'image'
              ? imageAdded
                ? 'imageBase64'
                : null
              : key;
      if (keyData !== null)
        formBody[keyData] = key === 'inwork' ? val === '1' : val;
    });

    if (imageAdded) {
      try {
        formBody.imageBase64 = await toBase64(formBody.imageBase64);
      } catch {
        errorMessage(
          `<h3>ИЗОБРАЖЕНИE НЕДОСТУПНО</h3>
          <span>Невозможно получить досуп к выбранному для сохранения изображению<span>`,
        );
        return;
      }
    }

    const validate = data => {
      const invalid = [];
      if (data.title.length < 3) invalid.push('title');
      if (!data.inwork) {
        if (+data.price === 0) invalid.push('price');
        if (+data.count === 0) invalid.push('count');
      }
      invalid.forEach(idInput =>
        e.target.querySelector(`#${idInput}`).classList.add('error-input'),
      );
      return invalid.length === 0;
    };

    if (validate(formBody)) {
      if (mode === 'edit') {
        let edited = false;
        Object.keys(formBody).forEach(key => {
          if (`${formBody[key]}` === `${good[key]}`) {
            delete formBody[key];
          } else edited = true;
        });
        if (!edited) return listModal.close();

        appGoods.idGood = good.id;
      }

      preloader('.card__submit');

      appGoods.body = formBody;
      const data = await appGoods.query(mode);

      preloader();
      if (data === null) return;

      listModal.close();
      renderGoods(data.id);
    }
  });
};

export const goodscard = async (mode, currentGood = {}) => {
  const modalCard = await createGoodCard(mode, {
    ...defaultGood,
    ...currentGood,
  });
  if (modalCard === null) return;

  addEventCoodCard(mode, modalCard, currentGood);
};

btnAddGoods.addEventListener('click', async e => {
  goodscard('add');
});
