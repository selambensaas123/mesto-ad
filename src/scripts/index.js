import { enableValidation, clearValidation } from "./components/validation.js";
import { createCardElement } from "./components/card.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard as deleteCardRequest,
  changeLikeCardStatus,
} from "./components/api.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM
const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

let myUserId = null;

// Loading helper
const renderLoading = (button, isLoading, defaultText, loadingText) => {
  button.textContent = isLoading ? loadingText : defaultText;
};

// Preview
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Like
const handleLikeToggle = (cardId, isLikedNow, likeButton, likeCountEl) => {
  changeLikeCardStatus(cardId, isLikedNow)
    .then((updatedCard) => {
      const liked = updatedCard.likes.some((u) => u._id === myUserId);
      likeButton.classList.toggle("card__like-button_is-active", liked);
      likeCountEl.textContent = updatedCard.likes.length;
    })
    .catch((err) => console.log(err));
};

// Delete
const handleDeleteCard = (cardId, cardElement) => {
  deleteCardRequest(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => console.log(err));
};

// Submit: Profile
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const btn = profileForm.querySelector(".popup__button");
  const defaultText = btn.textContent;
  renderLoading(btn, true, defaultText, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(btn, false, defaultText, "Сохранение...");
    });
};

// Submit: Avatar
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const btn = avatarForm.querySelector(".popup__button");
  const defaultText = btn.textContent;
  renderLoading(btn, true, defaultText, "Сохранение...");

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(btn, false, defaultText, "Сохранение...");
      avatarForm.reset();
    });
};

// Submit: Card
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const btn = cardForm.querySelector(".popup__button");
  const defaultText = btn.textContent;
  renderLoading(btn, true, defaultText, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, myUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeToggle: handleLikeToggle,
          onDelete: handleDeleteCard,
        })
      );

      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(btn, false, defaultText, "Создание...");
    });
};

// Listeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

// Open profile popup
openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

// Open avatar popup
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

// Open add-card popup
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Initial load from API
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    myUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    placesWrap.innerHTML = "";
    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, myUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeToggle: handleLikeToggle,
          onDelete: handleDeleteCard,
        })
      );
    });
  })
  .catch((err) => console.log(err));

// Close popups (X, overlay, ESC)
document.querySelectorAll(".popup").forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});
