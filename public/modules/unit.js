import create, { appUnits } from './const.js';
const { modalLayoutCard } = create;

export const fetchUnits = async () => {
  const units = await appUnits.query('list');
  if (units === null) return;

  const unitCard = modalLayoutCard.getElementById('units');

  appUnits.selectedIndex = Math.max(
    0,
    units.findIndex(u => u.id === 1),
  );

  let htmlUnit = '';
  units.forEach(unit => {
    htmlUnit += `<option value="${unit.id}">${unit.name}</option>`;
  });

  if (unitCard) {
    unitCard.innerHTML = htmlUnit;
    unitCard.selectedIndex = appUnits.selectedIndex;
  }
};
