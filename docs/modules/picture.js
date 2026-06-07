import { hasPicGood } from './const.js';
import { listModal } from './modal.js';

const modalTemplatePic = document.getElementById('modal-template-pic');
const modalLayoutPic = modalTemplatePic ? modalTemplatePic.content : null;

export const viewingPicture = async (image, title) => {
  if (modalLayoutPic === null) return;
  const cloneModalPic = modalLayoutPic.cloneNode(true);
  if (await hasPicGood(image)) {
    cloneModalPic.querySelector('img').src = image;
  }
  cloneModalPic.querySelector('.title_pic').textContent = title;

  const modalPic = listModal.open(cloneModalPic);
  modalPic.classList.add('table__modal_pic');
};

export const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('loadend', () => {
      resolve(reader.result);
    });
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
