function extractRestaurants(swiggyData) {
  const restaurants = [];

  const cards = swiggyData?.data?.cards || [];

  cards.forEach((card) => {
    const restaurantList =
      card?.card?.card?.gridElements?.infoWithStyle?.restaurants;

    if (Array.isArray(restaurantList)) {
      restaurants.push(...restaurantList);
    }
  });

  return {
    restaurants,
    nextOffset:
      swiggyData?.data?.pageOffset?.nextOffset || null,
  };
}

module.exports = extractRestaurants;