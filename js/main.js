const siteBody = document.querySelector(".site-body");
const mainWeatherList = document.querySelector(".main-weather-list");
const weatherFormBox = document.querySelector(".weather-form-box");
const weatherForm = document.querySelector(".weather-form");
const weatherInput = document.querySelector(".weather-input");
const weahterResultBox = document.querySelector(".weather-main-restult-box");
const weatherNotFoundCard = document.querySelector(".weather-not-found-card");
const weatherNotFoundTitle = document.querySelector(".weather-not-found-title");
const weatherSearchedList = document.querySelector(".searched-list");
const weatherHoursList = document.querySelector(".hours-weather-list");

const searchedWeatherTemplate = document.querySelector(".search-weather-template").content;
const weatherTemplate = document.querySelector(".weather-template").content;
const weatherMainTemplate = document.querySelector(".main-weather-template").content;
const weatherHoursTemplate = document.querySelector(".hours-weather-template").content;

// ! Default 5 cities
let defaultCityWeather = [
  "New York",
  "Moscow",
  "Tashkent",
  "Istanbul",
  "Berlin",
];

// ? Also tested for MainWeather // Second version
// defaultCityWeather.forEach(itemTest => {
//   fetch(`https://api.openweathermap.org/data/2.5/weather?q=${itemTest}&appid=c33dbb5643d0ba100b8f51f9f0277ac8&units=metric`)
//   .then(res => res.json())
//   .then(data => {
//     const weatherMainFragment = document.createDocumentFragment();

//     const { dt, timezone } = data;

//     const mainWeatherTime = convertTimeZone(dt, timezone);
//     const cloneweatherMainTemplate = weatherMainTemplate.cloneNode(true);
//     cloneweatherMainTemplate.querySelector(".main-weather-title").textContent = data.name;
//     cloneweatherMainTemplate.querySelector(".main-weather-temp" ).textContent = `${data.main.temp}`;
//     cloneweatherMainTemplate.querySelector(".main-weather-temp-feels" ).textContent = `Feels like: ${data.main.feels_like} °C`;
//     cloneweatherMainTemplate.querySelector(".main-weather-time").textContent = mainWeatherTime;

//     data.weather.forEach((weatherItem) => {
//       cloneweatherMainTemplate.querySelector(".main-weather-desc-name").textContent = weatherItem.main;
//     });
//     weatherMainFragment.appendChild(cloneweatherMainTemplate);
//     mainWeatherList.appendChild(weatherMainFragment);
//   })
//   .catch(err => console.log(err))
// })

// ! Fetching from Promise for MainWeather
const allData = Promise.all(
  defaultCityWeather.map((item) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${item}&appid=c33dbb5643d0ba100b8f51f9f0277ac8&units=metric`
        );
        const data = await res.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  })
).then((res) => {
  renderMainWeatherCards(res);
});

// ! Deafult 5 cities rendering
function renderMainWeatherCards(data) {
  const weatherMainFragment = document.createDocumentFragment();
  data.forEach((item) => {
    const { dt, timezone } = item;

    const mainWeatherTime = convertTimeZone(dt, timezone);
    const cloneweatherMainTemplate = weatherMainTemplate.cloneNode(true);
    cloneweatherMainTemplate.querySelector(".main-weather-title").textContent = item.name;
    cloneweatherMainTemplate.querySelector(".main-weather-temp" ).textContent = `${item.main.temp}`;
    cloneweatherMainTemplate.querySelector(".main-weather-temp-feels" ).textContent = `Feels like: ${item.main.feels_like} °C`;
    cloneweatherMainTemplate.querySelector(".main-weather-time").textContent = mainWeatherTime;

    item.weather.forEach((weatherItem) => {
      cloneweatherMainTemplate.querySelector(".main-weather-desc-name").textContent = weatherItem.main;
    });
    weatherMainFragment.appendChild(cloneweatherMainTemplate);
  });
  mainWeatherList.appendChild(weatherMainFragment);
}

// ! Searched List
let searchedWeatherArr = [];
function searchedWeatherList(weatherInputValue) {
  weatherSearchedList.innerHTML = "";
  weahterResultBox.innerHTML = "";

  // ! Makes Input's value first letter big
  function capFirst(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  if (
    weatherInputValue !== "" &&
    !searchedWeatherArr.includes(capFirst(weatherInputValue))
  ) {
    searchedWeatherArr.push(capFirst(weatherInputValue));
  }

  const searchFragment = document.createDocumentFragment();

  searchedWeatherArr.forEach((item) => {
    const cloneSearchedTemplate = searchedWeatherTemplate.cloneNode(true);
    cloneSearchedTemplate.querySelector(".searched-item-btn").textContent = item;

    searchFragment.appendChild(cloneSearchedTemplate);
  });
  weatherSearchedList.appendChild(searchFragment);
}

// ! Form event
weatherForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  // ! Fetch from Searched List
  weatherSearchedList.addEventListener("click", (evt) => {
    if (evt.target.matches(".searched-item-btn")) {
      weatherRender(evt.target.textContent);
    }
  });

  // ! Main Weather Card
  async function weatherRender(weatherCityName) {
    weahterResultBox.innerHTML = " ";
    mainWeatherList.classList.add("main-weather-list--off");
    weatherFormBox.classList.add("weather-form-box--searched");

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${weatherCityName}&appid=c33dbb5643d0ba100b8f51f9f0277ac8&units=metric`
      );
      const data = await res.json();

      // ! Check for data.code is equal to 404, if it's Make Error
      if (data.cod == "404") {
        throw new Error("Not found");
      }

      searchedWeatherList(weatherInput.value.trim());
      weatherNotFoundCard.classList.remove("weather-not-found-card--on");

      const {
        dt,
        sys: { sunrise, sunset },
        timezone,
      } = data;

      const sunriseTime = convertTimeZone(sunrise, timezone);
      const sunsetTime = convertTimeZone(sunset, timezone);
      const Time = convertTimeZone(dt, timezone);

      const weatherFragment = document.createDocumentFragment();
      const cloneWeatherTemplate = weatherTemplate.cloneNode(true);

      cloneWeatherTemplate.querySelector(".weather-city-name").textContent = data.name;
      cloneWeatherTemplate.querySelector(".weather-date").textContent = Time;
      cloneWeatherTemplate.querySelector(".weather-temp").textContent = data.main.temp;
      cloneWeatherTemplate.querySelector(".weather-temp-feels").textContent = `Feels like: ${data.main.feels_like} °C`;

      data.weather.forEach((item) => { 
        if (item.id >= 200 && item.id <= 232) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/11d@2x.png`;
          siteBody.style.backgroundImage ="url(../images/thunderstorm-day.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id >= 300 && item.id <= 321) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/09d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/drizzle-city.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id >= 500 && item.id <= 504) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/10d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/rain-img.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id == 511) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/13d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/rain-img.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id >= 520 && item.id <= 531) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/09d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/rain-img.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id >= 600 && item.id <= 622) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/13d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/snow-house.jpg)";
          siteBody.classList.add("site-body--black");
        } else if (item.id >= 700 && item.id <= 781) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/50d@2x.png`;
          siteBody.style.backgroundImage ="url(../images/fog-forcast-img.jpeg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id == 800) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/01d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/sunny-img.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id == 801) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/02d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/clouds-ocean.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id == 802) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/03d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/clouds-ocean.jpg)";
          siteBody.classList.remove("site-body--black");
        } else if (item.id >= 803 && item.id <= 804) {
          cloneWeatherTemplate.querySelector(".weather-icon").src = `http://openweathermap.org/img/wn/04d@2x.png`;
          siteBody.style.backgroundImage = "url(../images/clouds-ocean.jpg)";
          siteBody.classList.remove("site-body--black");
        }
        cloneWeatherTemplate.querySelector(".weather-desc-name").textContent = item.main;
      });

      cloneWeatherTemplate.querySelector(".weather-sunrise").textContent = `Sunrise: ${sunriseTime}`;
      cloneWeatherTemplate.querySelector(".weather-sunset").textContent = `Sunset: ${sunsetTime}`;

      cloneWeatherTemplate.querySelector(".weather-speed").textContent = `Wind speed: ${data.wind.speed} m/s`;
      cloneWeatherTemplate.querySelector(".weather-pressure").textContent = `Pressure: ${data.main.pressure}mm`;
      cloneWeatherTemplate.querySelector(".weather-humidity").textContent = `Air humidity: ${data.main.humidity}%`;
      cloneWeatherTemplate.querySelector(".weather-link").textContent = `${data.name} on maps`;

      cloneWeatherTemplate.querySelector(".weather-link").href = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=${data.weather.main}&lat=${data.coord.lat}&lon=${data.coord.lon}&zoom=5`;

      async function weatherHourlyRender(weatherCityName) {
        try {
          const hoursRes = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&weather?q=${weatherCityName}&appid=c33dbb5643d0ba100b8f51f9f0277ac8&units=metric`
          );

          let hoursData = await hoursRes.json();

          weatherHoursList.innerHTML = "";
          const weatherHoursFragment = document.createDocumentFragment();
          let sixTimes = hoursData.list.slice(0, 6);
          sixTimes.forEach((item) => {
            let ItemDate = item.dt;
            let convertItemDate = new Date(ItemDate * 1000);

            let cloneWeatherHoursTemplate = weatherHoursTemplate.cloneNode(true);
            cloneWeatherHoursTemplate.querySelector(".hours-weather-time").textContent = ` ${convertItemDate.toLocaleTimeString("default")}`;
            // cloneWeatherHoursTemplate.querySelector(".hours-weather-time-text").textContent = item.dt_txt;
            cloneWeatherHoursTemplate.querySelector(".hours-weather-temp").textContent = `${item.main.temp}`;
            cloneWeatherHoursTemplate.querySelector(".hours-weather-feels-like").textContent = `Feels like: ${item.main.feels_like} °C`;

            item.weather.forEach((weatherHoursItem) => {
              cloneWeatherHoursTemplate.querySelector(".hours-weather-desc-name").textContent = weatherHoursItem.main;

              if (weatherHoursItem.id >= 200 && weatherHoursItem.id <= 232) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/11d@2x.png`;
              } else if (
                weatherHoursItem.id >= 300 &&
                weatherHoursItem.id <= 321
              ) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/09d@2x.png`;
              } else if (
                weatherHoursItem.id >= 500 &&
                weatherHoursItem.id <= 504
              ) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/10d@2x.png`;
              } else if (weatherHoursItem.id == 511) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/13d@2x.png`;
              } else if (
                weatherHoursItem.id >= 520 &&
                weatherHoursItem.id <= 531
              ) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/09d@2x.png`;
              } else if (
                weatherHoursItem.id >= 600 &&
                weatherHoursItem.id <= 622
              ) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/13d@2x.png`;
              } else if (
                weatherHoursItem.id >= 700 &&
                weatherHoursItem.id <= 781
              ) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/50d@2x.png`;
              } else if (weatherHoursItem.id == 800) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/01d@2x.png`;
              } else if (weatherHoursItem.id == 801) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/02d@2x.png`;
              } else if (weatherHoursItem.id == 802) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/03d@2x.png`;
              } else if (
                weatherHoursItem.id >= 803 &&
                weatherHoursItem.id <= 804
              ) {
                cloneWeatherHoursTemplate.querySelector(".hours-weather-icon").src = `http://openweathermap.org/img/wn/04d@2x.png`;
              }
            });

            cloneWeatherHoursTemplate.querySelector(".hours-weather-wind-speed").textContent = `Wind speed: ${item.wind.speed} m/s`;
            cloneWeatherHoursTemplate.querySelector(".hours-weather-pressure").textContent = `Pressure: ${item.main.pressure}mm`;
            cloneWeatherHoursTemplate.querySelector(".hours-weather-humidity").textContent = `Air humidity: ${item.main.humidity}%`;

            weatherHoursFragment.appendChild(cloneWeatherHoursTemplate);
          });
          weatherHoursList.appendChild(weatherHoursFragment);
        } catch (error) {
          console.log(error.message);
        }
      }
      weatherHourlyRender(weatherInput.value.trim());

      weatherInput.value = "";
      weatherFragment.appendChild(cloneWeatherTemplate);
      weahterResultBox.appendChild(weatherFragment);
    } catch (error) {
      weatherNotFoundCard.classList.add("weather-not-found-card--on");
      weatherNotFoundTitle.textContent = `You wanted to search (${weatherCityName}) is not found`;
    }
  }
  weatherRender(weatherInput.value.trim());
});

// ! Converts TimeZone
function convertTimeZone(time, timezone) {
  const srTime = new Date((time + timezone) * 1000);

  const twoDigits = (val) => {
    return ("0" + val).slice(-2);
  };

  const hours = twoDigits(srTime.getUTCHours());
  const minutes = twoDigits(srTime.getUTCMinutes());
  // const seconds = twoDigits(srTime.getUTCSeconds()); // If we need second
  return `${hours}:${minutes}`;
}
