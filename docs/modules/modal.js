const modalTemplate = document.getElementById('modal-template');
const modalLayout = modalTemplate ? modalTemplate.content : null;

export const listModal = {
  list: [],
  open: contentNode => {
    if (modalLayout === null) return null;
    if (!(contentNode instanceof Node)) return null;
    if (listModal.list.length === 0) document.body.style.overflow = 'hidden';

    const cloneModal = modalLayout.cloneNode(true);
    cloneModal.querySelector('.modal-content-wrapper').appendChild(contentNode);

    document.body.appendChild(cloneModal);
    const modal = document.body.lastElementChild;
    modal.id = `modal-${listModal.list.length}`;
    modal.querySelector('.modal-close').setAttribute('data-modal', modal.id);

    listModal.list.push(modal);

    window.setTimeout(() => {
      modal.classList.add('open');
    }, 0);

    return modal;
  },
  close: () => {
    let modal = listModal.list.length > 0 ? listModal.list.pop() : null;
    if (modal) {
      modal.remove();
    }
    if (listModal.list.length === 0) document.body.style.overflow = '';
    return modal;
  },
};

document.body.addEventListener('click', e => {
  let button = e.target.closest('[data-modal]');
  let modal = button
    ? document.getElementById(button.dataset.modal)
    : e.target.closest('.modal');
  let modalDialog = modal ? modal.querySelector('.modal-dialog') : null;

  if (
    button ||
    (modal &&
      !e.composedPath().includes(modalDialog) &&
      modal.classList.contains('open'))
  ) {
    e.preventDefault();

    if (modal.classList.contains('open')) {
      listModal.close();
    } else {
      listModal.open(modal, e.target);
    }
  }
});

document.body.addEventListener('keyup', event => {
  if (event.key == 'Escape' && listModal.list.length) {
    event.preventDefault();
    listModal.close();
  }
});
