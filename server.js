const express = require("express");
const cors = require("cors");
const findRestaurantById =
  require("./utils/findRestaurantById");

const selectMenu =
  require("./utils/selectMenu");
const {
  SEARCH_RADIUS_KM,
  TOTAL_POINTS,
} = require("./config/locations");

const {
  fetchInitialRestaurants,
  fetchRemainingRestaurants,
} = require("./utils/fetchRestaurantsFromArea");

const restaurantCache = require("./cache/restaurantCache");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

function getLocationKey(lat, lng) {
  return `${lat.toFixed(2)}_${lng.toFixed(2)}`;
}

/*
==================================================
Restaurants Route
==================================================
*/

app.get("/api/restaurants", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "lat and lng query params required",
      });
    }

    const locationKey =
      getLocationKey(lat, lng);

    const cachedArea =
      restaurantCache.get(locationKey);

    /*
    ==============================================
    Cache Hit
    ==============================================
    */

    if (cachedArea) {
      console.log(
        `Serving from cache: ${locationKey}`
      );

      return res.json({
        locationKey,
        cached: true,
        loading:
          cachedArea.loading,
        count:
          cachedArea.restaurantMap.size,
        restaurants: Array.from(
          cachedArea.restaurantMap.values()
        ),
      });
    }

    /*
    ==============================================
    First Request
    ==============================================
    */

    console.log(
      `Creating cache for ${locationKey}`
    );

    const initialRestaurants =
      await fetchInitialRestaurants(
        lat,
        lng
      );

    const restaurantMap =
      new Map();

    initialRestaurants.forEach(
      (restaurant) => {
        const id =
          restaurant?.info?.id;

        if (!id) return;

        restaurantMap.set(
          id,
          restaurant
        );
      }
    );

    restaurantCache.set(
      locationKey,
      {
        loading: true,
        restaurantMap,
      }
    );

    res.json({
      locationKey,
      cached: false,
      loading: true,
      count:
        restaurantMap.size,
      restaurants:
        initialRestaurants,
    });

    /*
    ==============================================
    Background Fetch
    ==============================================
    */

    fetchRemainingRestaurants(
      lat,
      lng,
      SEARCH_RADIUS_KM,
      TOTAL_POINTS,
      restaurantMap
    )
      .then(() => {
        const cache =
          restaurantCache.get(
            locationKey
          );

        if (cache) {
          cache.loading = false;
        }

        console.log(
          `Background completed: ${locationKey}`
        );

        console.log(
          `Total restaurants: ${restaurantMap.size}`
        );
      })
      .catch((error) => {
        console.error(
          error.message
        );

        const cache =
          restaurantCache.get(
            locationKey
          );

        if (cache) {
          cache.loading = false;
        }
      });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
});

/*
==================================================
Search Endpoint
==================================================
*/

app.get("/api/search", (req, res) => {
  try {
    const {
      lat,
      lng,
      q,
    } = req.query;

    const locationKey =
      getLocationKey(
        Number(lat),
        Number(lng)
      );

    const cache =
      restaurantCache.get(
        locationKey
      );

    if (!cache) {
      return res.json([]);
    }

    const restaurants =
      Array.from(
        cache.restaurantMap.values()
      );

    const filtered =
      restaurants.filter(
        (restaurant) =>
          restaurant?.info?.name
            ?.toLowerCase()
            .includes(
              q?.toLowerCase() || ""
            )
      );

    res.json(filtered);

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
});

/*
==================================================
Status Endpoint
==================================================
*/

app.get(
  "/api/restaurants/status",
  (req, res) => {
    try {
      const lat =
        Number(req.query.lat);

      const lng =
        Number(req.query.lng);

      const locationKey =
        getLocationKey(
          lat,
          lng
        );

      const cache =
        restaurantCache.get(
          locationKey
        );

      if (!cache) {
        return res.json({
          exists: false,
        });
      }

      res.json({
        exists: true,
        loading:
          cache.loading,
        count:
          cache.restaurantMap.size,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/*
==================================================
Cache Debug
==================================================
*/

app.get("/api/cache", (req, res) => {
  const result = [];

  restaurantCache.forEach(
    (value, key) => {
      result.push({
        location: key,
        restaurants:
          value.restaurantMap.size,
        loading:
          value.loading,
      });
    }
  );

  res.json(result);
});

/*
==================================================
Menu Endpoint
==================================================
*/

app.get("/api/menu/:id", (req, res) => {
  try {

    const { id } = req.params;

    const restaurant =
      findRestaurantById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant not found in cache",
      });
    }

    const menu =
      selectMenu(restaurant);

    res.json(menu);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});