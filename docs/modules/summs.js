const setDiscount = discount => (discount ? (100 - discount) / 100 : 1);

const getTotal = (price = 0, count = 0, discount = 0) => {
  return Math.trunc(price * count * setDiscount(discount));
};

const sayTotalTableSum = totalSumma => {
  const totalPriceElements = document.querySelector('.cms__total');
  totalPriceElements.querySelector('.cms__total-text').textContent =
    'Итоговая стоимость:';
  totalPriceElements.querySelector('.cms__total-price').innerHTML =
    `${totalSumma} &#8381;`;
};

export { getTotal, sayTotalTableSum };
