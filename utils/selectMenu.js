const defaultMenu =
  require("../menus/default.json");

const pizzaMenu =
  require("../menus/pizza.json");

const burgerMenu =
  require("../menus/burger.json");

const chineseMenu =
  require("../menus/chinese.json");

const biryaniMenu =
  require("../menus/biryani.json");

const northIndianMenu =
  require("../menus/north-indian.json");

const southIndianMenu =
  require("../menus/south-indian.json");

const mughlaiMenu =
  require("../menus/mughlai.json");

const italianMenu =
  require("../menus/italian.json");

const fastFoodMenu =
  require("../menus/fast-food.json");

function selectMenu(
  restaurant
) {
  const name =
    restaurant?.info?.name
      ?.toLowerCase() || "";

  const cuisines =
    (
      restaurant?.info?.cuisines ||
      []
    )
      .join(" ")
      .toLowerCase();

  /*
  ==================================
  Famous Chains First
  ==================================
  */

  if (
    name.includes("domino")
  ) {
    return pizzaMenu;
  }

  if (
    name.includes("pizza hut")
  ) {
    return pizzaMenu;
  }

  if (
    name.includes("lapinoz")
  ) {
    return pizzaMenu;
  }

  if (
    name.includes("mojo pizza")
  ) {
    return pizzaMenu;
  }

  if (
    name.includes("kfc")
  ) {
    return burgerMenu;
  }

  if (
    name.includes("burger king")
  ) {
    return burgerMenu;
  }

  if (
    name.includes("mcdonald")
  ) {
    return burgerMenu;
  }

  if (
    name.includes("subway")
  ) {
    return fastFoodMenu;
  }

  /*
  ==================================
  Cuisine Matching
  ==================================
  */

  if (
    cuisines.includes("pizza")
  ) {
    return pizzaMenu;
  }

  if (
    cuisines.includes("burger")
  ) {
    return burgerMenu;
  }

  if (
    cuisines.includes("biryani")
  ) {
    return biryaniMenu;
  }

  if (
    cuisines.includes("chinese")
  ) {
    return chineseMenu;
  }

  if (
    cuisines.includes(
      "north indian"
    )
  ) {
    return northIndianMenu;
  }

  if (
    cuisines.includes(
      "south indian"
    )
  ) {
    return southIndianMenu;
  }

  if (
    cuisines.includes(
      "mughlai"
    )
  ) {
    return mughlaiMenu;
  }

  if (
    cuisines.includes(
      "italian"
    )
  ) {
    return italianMenu;
  }

  if (
    cuisines.includes(
      "fast food"
    )
  ) {
    return fastFoodMenu;
  }

  return defaultMenu;
}

module.exports =
  selectMenu;