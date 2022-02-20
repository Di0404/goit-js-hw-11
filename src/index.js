import './sass/main.scss';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchImages } from './js/get-images';
var debounce = require('debounce');


const formRef = document.querySelector('#search-form');
const inputRef = document.querySelector('input[name="searchQuery"]');
const galleryRef = document.querySelector('.gallery');
const btnRef = document.querySelector('.load-more');

formRef.addEventListener('submit', searchPicture);

let value = '';
let page = 1;
let totalHits = 0;

async function searchPicture(e) {
  e.preventDefault();

  value = inputRef.value.trim();

  if (!value) {
    hideLoadMoreBtn();
    clearPage();
    return;
  }

  page = 1;
  hideLoadMoreBtn();
  clearPage();
  window.addEventListener('scroll', debounce(onScroll, 200));

  try {
    const response = await fetchImages(value, page);
    if (response.hits.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    createGallery(response.hits);

    Notify.success(`Hooray! We found ${response.totalHits} images.`);

    if (response.hits.length < 40) {
      return;
    }

    loadMoreBtn();
  } catch (error) {
    Notify.failure('Sorry, something went wrong. Please try again.');
  }
}

function createGallery(array) {
  const markup = array
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
      return `<div class="photo-card">
                <a class="photo-wrap" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300"/>
                </a>
                <div class="info">
                    <p class="info-item">
                    <b>Likes</b> ${likes}
                    </p>
                    <p class="info-item">
                    <b>Views</b> ${views}
                    </p>
                    <p class="info-item">
                    <b>Comments</b> ${comments}
                    </p>
                    <p class="info-item">
                    <b>Downloads</b> ${downloads}
                    </p>
                </div>
            </div>`;
    })
    .join('');
  galleryRef.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();
}

function clearPage() {
  galleryRef.innerHTML = '';
}

btnRef.addEventListener('click', loadMorePictures);

function loadMorePictures() {
  page += 1;
  btnRef.disabled = true;
  lightbox.refresh();
  fetchImages(value, page)
    .then(response => {
      createGallery(response.hits);

      if (response.hits.length < 40) {
        hideLoadMoreBtn();
        window.removeEventListener('scroll', onScroll);
        Notify.info("We're sorry, but you've reached the end of search results.");
        return;
      }
      loadMoreBtn();
    })
    .catch(error =>
      Notify.failure('Sorry, there are no images matching your search query. Please try again.'),
    );
}

function loadMoreBtn() {
  btnRef.classList.remove('is-hidden');
  btnRef.disabled = false;
}

function hideLoadMoreBtn() {
  btnRef.disabled = true;
  btnRef.classList.add('is-hidden');
}

const lightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function onScroll(e) {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const cardHeight = galleryRef.getBoundingClientRect();

  if (cardHeight.height - 700 < scrollTop) {
    loadMorePictures();
  }
}

