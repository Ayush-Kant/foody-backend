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
        },
      }
    );

    const cards = response.data?.data?.cards;

    res.json({
      cardsExists: !!cards,
      cardsLength: cards?.length,
      firstCard: cards?.[0],
      keys: Object.keys(response.data || {})
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: error.response?.status
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