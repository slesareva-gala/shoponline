import create, { appCategories } from './const.js';
const { modalLayoutCard } = create;

export const fetchCategories = async () => {
  const categories = await appCategories.query('list');
  if (categories === null) return;

  const categoryCard = modalLayoutCard.getElementById('category');
  const categoryFilter = document.getElementById('category_filter');

  appCategories.selectedIndex = 0;

  let htmlCategory = '';
  categories.forEach(category => {
    htmlCategory += `<option value="${category.id}">${category.name}</option>`;
  });

  if (categoryCard) {
    categoryCard.innerHTML = htmlCategory;
    categoryCard.selectedIndex = appCategories.selectedIndex;
  }

  if (categoryFilter) {
    categoryFilter.innerHTML =
      `<option value="0">все категории</option>` + htmlCategory;
    categoryFilter.selectedIndex = appCategories.selectedIndex;
  }
};
