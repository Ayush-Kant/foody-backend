const axios = require("axios");
const generateCoordinates = require("./generateCoordinates");

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function fetchRestaurantsForCoordinate(
  lat,
  lng
) {
  const restaurantMap = new Map();

  console.log(
    `Fetching coordinate: ${lat}, ${lng}`
  );

  const response = await axios.get(
    `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`,
    {
      timeout: 30000,

      validateStatus: () => true,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149 Safari/537.36",

        Accept:
          "application/json,text/plain,*/*",

        "Accept-Language":
          "en-US,en;q=0.9",

        Referer:
          "https://www.swiggy.com/restaurants",

        Origin:
          "https://www.swiggy.com",
      },
    }
  );

  console.log(
    `Status: ${response.status}`
  );

  const cards =
    response.data?.data?.cards || [];

  cards.forEach((card) => {
    const restaurants =
      card?.card?.card?.gridElements
        ?.infoWithStyle?.restaurants;

    if (!Array.isArray(restaurants))
      return;

    restaurants.forEach((restaurant) => {
      const id =
        restaurant?.info?.id;

      if (!id) return;

      restaurantMap.set(
        id,
        restaurant
      );
    });
  });

  return Array.from(
    restaurantMap.values()
  );
}

async function fetchInitialRestaurants(
  centerLat,
  centerLng
) {
  console.log(
    "Fetching initial restaurants..."
  );

  return await fetchRestaurantsForCoordinate(
    centerLat,
    centerLng
  );
}

async function fetchRemainingRestaurants(
  centerLat,
  centerLng,
  radiusKm,
  totalPoints,
  restaurantMap
) {
  const coordinates =
    generateCoordinates(
      centerLat,
      centerLng,
      radiusKm,
      totalPoints
    );

  const remainingCoordinates =
    coordinates.slice(1);

  console.log(
    `Starting background fetch for ${remainingCoordinates.length} coordinates`
  );

  for (const [lat, lng] of remainingCoordinates) {
    try {
      await sleep(1500);

      const restaurants =
        await fetchRestaurantsForCoordinate(
          lat,
          lng
        );

      let added = 0;

      restaurants.forEach(
        (restaurant) => {
          const id =
            restaurant?.info?.id;

          if (!id) return;

          if (
            !restaurantMap.has(id)
          ) {
            added++;
          }

          restaurantMap.set(
            id,
            restaurant
          );
        }
      );

      console.log(
        `Added ${added} new restaurants`
      );

      console.log(
        `Total restaurants in cache: ${restaurantMap.size}`
      );

    } catch (error) {
      console.log(
        `Background Failed: ${lat}, ${lng}`
      );

      console.log(
        error.message
      );
    }
  }

  console.log(
    "Background fetch completed"
  );
}

module.exports = {
  fetchInitialRestaurants,
  fetchRemainingRestaurants,
};