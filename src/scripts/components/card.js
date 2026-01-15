const getTemplate = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

const isLikedByMe = (likes, myId) => likes.some((u) => u._id === myId);

export const createCardElement = (
  cardData,
  myUserId,
  { onPreviewPicture, onLikeToggle, onDelete }
) => {
  const cardElement = getTemplate();

  const cardImage = cardElement.querySelector(".card__image");
  const titleEl = cardElement.querySelector(".card__title");

  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountEl = cardElement.querySelector(".card__like-count");

  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );

  // content
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  titleEl.textContent = cardData.name;

  // likes state
  const liked = isLikedByMe(cardData.likes, myUserId);
  likeButton.classList.toggle("card__like-button_is-active", liked);
  likeCountEl.textContent = cardData.likes.length;

  // delete only for owner
  if (cardData.owner?._id !== myUserId) {
    deleteButton.remove();
  }

  // preview
  cardImage.addEventListener("click", () => {
    onPreviewPicture({ name: cardData.name, link: cardData.link });
  });

  // like toggle -> index.js handler (API)
  likeButton.addEventListener("click", () => {
    const isLikedNow = likeButton.classList.contains(
      "card__like-button_is-active"
    );
    onLikeToggle(cardData._id, isLikedNow, likeButton, likeCountEl);
  });

  // delete -> index.js handler (API)
  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      onDelete(cardData._id, cardElement);
    });
  }

  return cardElement;
};
