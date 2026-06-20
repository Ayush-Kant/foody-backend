const restaurantCache =
  require("../cache/restaurantCache");

function findRestaurantById(id) {

  for (const [
    locationKey,
    cache
  ] of restaurantCache.entries()) {

    const restaurant =
      cache.restaurantMap.get(
        String(id)
      );

    if (restaurant) {
      return restaurant;
    }
  }

  return null;
}

module.exports =
  findRestaurantById;