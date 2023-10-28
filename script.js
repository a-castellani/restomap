'use strict';
class Restaurant {
  id = (Date.now() + '').slice(-10);

  constructor(coords, name, type, dish, address, link, rate) {
    this.coords = coords;
    this.name = name;
    this.type = type;
    this.dish = dish;
    this.address = address;
    this.link = link;
    this.rate = rate;
  }
}

const form2 = document.querySelector('.form_2');
const submitBtn = document.querySelector('.submit');
const restaurantFirst = document.querySelector('.restaurant_first');

const containerRestaurants = document.querySelector('.restaurants');
const inputName = document.querySelector('.form__input--name');
const inputType = document.querySelector('.form__input--type');
const inputDish = document.querySelector('.form__input--dish');
const inputAddress = document.querySelector('.form__input--address');
const inputLink = document.querySelector('.form__input--link');
const inputRate = document.querySelector('.form__input--rate');

const closForm = document.querySelector('.close__form');

/// APP ARCHITECTURE /////////
class App {
  #map;
  #mapZoom = 13;
  #mapEvent;
  #workouts = [];
  #restaurants = [];

  constructor() {
    this._getPosition();

    // Get local storage
    this._getLocalStorage();

    form2.addEventListener('submit', this._newRestaurant.bind(this));
    submitBtn.addEventListener('click', this._newRestaurant.bind(this));
    containerRestaurants.addEventListener(
      'click',
      this._moveToPopup.bind(this)
    );
    closForm.addEventListener('click', this._hideForm);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoom);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    this.#restaurants.forEach(restaurant => {
      this._renderRestaurantMarker(restaurant);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form2.classList.remove('hidden');
    inputName.focus();
  }

  _hideForm() {
    //Empty the inputs
    inputName.value =
      inputDish.value =
      inputAddress.value =
      inputLink.value =
      inputRate.value =
        '';
    form2.style.display = 'none';
    form2.classList.add('hidden');
    setTimeout(() => {
      form2.style.display = 'block';
    }, 1000);
  }

  _newRestaurant(e) {
    e.preventDefault();

    const name = inputName.value;
    const type = inputType.value;
    const dish = inputDish.value;
    const address = inputAddress.value;
    const link = inputLink.value;
    const rate = +inputRate.value;

    const { lat, lng } = this.#mapEvent.latlng;
    let restaurant;

    if (Number.isFinite(rate) && rate > 0 && rate < 7) {
      restaurant = new Restaurant(
        [lat, lng],
        name,
        type,
        dish,
        address,
        link,
        rate
      );
    } else return alert('Rate has to be a number: 0 - 6.0');

    this.#restaurants.push(restaurant);

    console.log(this.#restaurants);
    this._renderRestaurantMarker(restaurant);
    this._renderRestaurant(restaurant);
    this._hideForm();
    this._setLocalStorage();
  }

  _renderRestaurantMarker(restaurant) {
    L.marker(restaurant.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(
        `${restaurant.name} - ${restaurant.type} - ${restaurant.rate}`
      )
      .openPopup();
  }

  _renderRestaurant(restaurant) {
    let html = `
    <li class="restaurant restaurant--${restaurant.name}"
    data-id=${restaurant.id}>
      <div class="logo_restaurant">
        <img class="icon_restaurant" src="icon.png" alt="Icon restomap">
      </div>
      <div class="restaurant_description">
        <div class="restaurant__details">
          <h2 class="restaurant__title">${restaurant.name}</h2>
          <h2>⭐️ ${restaurant.rate}</h2>
        </div>
        <h3>${restaurant.type}</h3>
        <hr>
        <br>
        <h3>Best dish: ${restaurant.dish}</h3>
        <div class="restaurant__details">
          <h3>${restaurant.address}</h3>
          <a href="${restaurant.link}">Link</a>
        </div>
      </div>
    </li>
    `;
    restaurantFirst.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const restaurantEl = e.target.closest('.restaurant');
    if (!restaurantEl) return;

    console.log(this.#restaurants);
    const restaurant = this.#restaurants.find(
      restaurant => restaurant.id === restaurantEl.dataset.id
    );

    this.#map.setView(restaurant.coords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    console.log(e);
  }
  _setLocalStorage() {
    localStorage.setItem('restaurants', JSON.stringify(this.#restaurants));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('restaurants'));
    if (!data) return; // Verify if there is data or not to don't get undefined
    this.#restaurants = data;
    this.#restaurants.forEach(restaurant => {
      this._renderRestaurant(restaurant);
    });
  }

  reset() {
    localStorage.removeItem('restaurants');
    location.reload();
  }
}

const app = new App();
