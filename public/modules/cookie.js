export const setCookie = (autch, dayAge = 1) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expires = new Date(today.getTime() + 86400000);
  document.cookie = `admin=${autch}; path='/'; expires=${expires.toUTCString()}`;
};

export const getCookie = () => {
  const matches = document.cookie.match(/(?:^|; )admin=([^;]*)/);
  return !matches || matches[1] === 'deleted' ? undefined : matches[1];
};

export const delCookie = () => {
  setCookie('deleted', 0);
};
