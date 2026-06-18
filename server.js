const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

const PORT = 5000;

app.get("/api/restaurants", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=12.9351929&lng=77.62448069999999&restaurantId=${id}`,
      {
        timeout: 20000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149 Safari/537.36",
          Accept: "application/json",
          Referer: "https://www.swiggy.com/",
        },
      }
    );

    const cards = response.data?.data?.cards || [];

    const restaurantInfo =
      cards.find(
        (c) =>
          c.card?.card?.["@type"] ===
          "type.googleapis.com/swiggy.presentation.food.v2.Restaurant"
      )?.card?.card?.info || {};

    const regularCards =
      cards.find((c) => c.groupedCard)?.groupedCard?.cardGroupMap?.REGULAR
        ?.cards || [];

    const categories = regularCards
      .filter(
        (c) =>
          c.card?.card?.["@type"] ===
          "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory"
      )
      .map((category) => ({
        title: category.card.card.title,

        itemCards:
          category.card.card.itemCards?.map((item) => ({
            id: item.card?.info?.id,
            name: item.card?.info?.name,
            description: item.card?.info?.description,
            imageId: item.card?.info?.imageId,

            price:
              item.card?.info?.price / 100 ||
              item.card?.info?.defaultPrice / 100,

            ratings:
              item.card?.info?.ratings?.aggregatedRating?.rating || null,
          })) || [],
      }));

    res.json({
      info: {
        id: restaurantInfo.id,
        name: restaurantInfo.name,
        cuisines: restaurantInfo.cuisines,
        avgRating: restaurantInfo.avgRating,
        costForTwo: restaurantInfo.costForTwoMessage,
        imageId: restaurantInfo.cloudinaryImageId,
        deliveryTime: restaurantInfo.sla?.deliveryTime,
      },

      categories,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// app.get("/api/menu/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("MENU REQUEST:", id);

//     const url =
//       `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=12.9351929&lng=77.62448069999999&restaurantId=${id}`;

//     console.log("FETCHING:", url);

//     const response = await axios.get(url, {
//       timeout: 10000,
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149 Safari/537.36",
//         "Accept": "application/json",
//       },
//     });

//     console.log("SUCCESS");

//     res.json(response.data);
//   } catch (error) {
//     console.error("MENU ERROR");
//     console.error(error.response?.status);
//     console.error(error.message);

//     res.status(500).json({
//       success: false,
//       status: error.response?.status,
//       message: error.message,
//     });
//   }
// });
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});