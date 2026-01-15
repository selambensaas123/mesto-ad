// src/scripts/components/api.js
// API for Mesto (Practicum)
// Token and cohort are taken from Vite env variables:
//   VITE_MESTO_TOKEN=...
//   VITE_MESTO_COHORT=cohortId
// Create a local .env file (do NOT commit it) based on .env.example

const cohort = import.meta.env.VITE_MESTO_COHORT;
const token = import.meta.env.VITE_MESTO_TOKEN;

const config = {
  baseUrl: `https://mesto.nomoreparties.co/v1/${cohort}`,
  headers: {
    authorization: token,
    "Content-Type": "application/json",
  },
};

/* Проверяем, успешно ли выполнен запрос, и отклоняем промис в случае ошибки. */
const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

const request = (url, options = {}) => {
  return fetch(url, options).then(getResponseData);
};

export const getUserInfo = () => {
  return request(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  });
};

export const getCardList = () => {
  return request(`${config.baseUrl}/cards`, {
    headers: config.headers,
  });
};

export const setUserInfo = ({ name, about }) => {
  return request(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ name, about }),
  });
};

export const setUserAvatar = ({ avatar }) => {
  return request(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ avatar }),
  });
};

export const addCard = ({ name, link }) => {
  return request(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ name, link }),
  });
};

export const deleteCard = (cardID) => {
  return request(`${config.baseUrl}/cards/${cardID}`, {
    method: "DELETE",
    headers: config.headers,
  });
};

export const changeLikeCardStatus = (cardID, isLiked) => {
  return request(`${config.baseUrl}/cards/likes/${cardID}`, {
    method: isLiked ? "DELETE" : "PUT",
    headers: config.headers,
  });
};
