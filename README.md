# Foody Backend

Custom backend built to power the restaurant discovery system.

Purpose:

* Eliminate CORS issues
* Discover more restaurants than a single Swiggy request provides
* Cache restaurant data
* Support location-based restaurant discovery
* Provide dynamic menu generation
* Reduce dependency on unreliable frontend API calls

---

# Why This Backend Exists

Initially the frontend tried consuming Swiggy APIs directly.

Problems faced:

* CORS Errors
* Limited restaurant results
* Pagination complexity
* Inconsistent API behaviour
* Anti-bot restrictions
* Empty responses
* 202 responses
* HTML responses instead of JSON

This led to creation of a dedicated backend layer.

Architecture:

Frontend

↓

Backend

↓

Swiggy APIs

---

# Tech Stack

* Node.js
* Express.js
* Axios
* CORS

---

# Project Structure

backend
│
├── cache
│   └── restaurantCache.js
│
├── config
│   └── locations.js
│
├── menus
│   ├── biryani.json
│   ├── burger.json
│   ├── chinese.json
│   ├── default.json
│   ├── fast-food.json
│   ├── italian.json
│   ├── mughlai.json
│   ├── north-indian.json
│   ├── pizza.json
│   └── south-indian.json
│
├── utils
│   ├── cacheManager.js
│   ├── fetchRestaurantsFromArea.js
│   ├── generateCoordinates.js
│   └── restaurantExtractor.js
│
└── server.js
```

---

# Phase 1 - Basic Swiggy Integration

Started by testing:


https://www.swiggy.com/dapi/restaurants/list/v5
```

Goal:

Fetch restaurants around a coordinate.

Example:


lat=23.3492
lng=85.3347
```

Response successfully returned restaurants.

Problem:

Only 20-30 restaurants visible.

Many city restaurants missing.

---

# Phase 2 - Understanding Swiggy Coverage

Discovered:

Swiggy only returns restaurants around a specific coordinate.

One coordinate does not represent an entire city.

Example:

User Location
      X
```

Returns:

Nearby Restaurants Only
```

Not city-wide results.

---

# Phase 3 - Coordinate Expansion

Built coordinate generation system.

File:

```
utils/generateCoordinates.js
```

Purpose:

Generate multiple coordinates around user location.

Example:


      *
   *     *

      X

   *     *
      *
```

Where:


X = User Location
* = Additional Search Points
```

Benefits:

More restaurants discovered.

---

# Phase 4 - Restaurant Discovery Engine

File:


utils/fetchRestaurantsFromArea.js
```

Responsibilities:

* Generate coordinates
* Fetch restaurants for each coordinate
* Merge results
* Remove duplicates

Workflow:

Generate Coordinates

↓

Fetch Restaurants

↓

Merge Results

↓

Return Unique Restaurants

---

# Phase 5 - Duplicate Removal

Problem:

Same restaurant appeared from multiple coordinates.

Solution:

Store restaurants using:

```js
Map<restaurantId, restaurant>
```

Benefits:

* Fast lookup
* Automatic deduplication
* Clean restaurant list

---

# Phase 6 - Initial Fast Response

Problem:

Fetching all coordinates takes time.

Users should not wait.

Solution:

Return initial coordinate immediately.

Workflow:

Request

↓

Fetch Main Coordinate

↓

Return Response

↓

Continue Background Fetching

Result:

Fast first paint.

---

# Phase 7 - Background Restaurant Discovery

Implemented background expansion.

File:

utils/fetchRestaurantsFromArea.js
```

After first response:

Backend continues discovering restaurants.

Example:

25 Restaurants
```

↓
41 Restaurants
↓

73 Restaurants
```

↓

107 Restaurants
```

Without blocking frontend.

---

# Phase 8 - Restaurant Cache

File:

cache/restaurantCache.js


Implemented:

js
const restaurantCache = new Map();
```

Purpose:

Store restaurants by location.

Benefits:

* Faster responses
* Reduced API requests
* Reduced Swiggy load

---

# Phase 9 - Location Based Cache

Cache Key Format:

23.35_85.33

Generated using:

js
lat.toFixed(2)
lng.toFixed(2)


Purpose:

Nearby users share same cache.

Example:

23.3492
23.3501
23.3515


All map to: 23.35_85.33


Benefits:
Improved cache hit rate.


# Phase 10 - Restaurant Status Endpoint

Endpoint:

GET /api/restaurants/status


Purpose:

Expose background fetch progress.

Response:
json
{
  "exists": true,
  "loading": true,
  "count": 58
}
```

Frontend uses this to know:

* Is background fetching running?
* How many restaurants currently exist?

---

# Phase 11 - Progressive Frontend Updates

Frontend polls:
/api/restaurants/status


every second.

Whenever count increases:

Frontend refreshes restaurant list.

Result:

```
25
↓
38
↓
61
↓
107
```

restaurants appear progressively.

---

# Phase 12 - Restaurant Search Endpoint

Endpoint:
GET /api/search


Features:

* Search by restaurant name
* Location aware
* Uses cached restaurants

No external API call required.

---

# Phase 13 - Cache Debug Endpoint

Endpoint:

```txt
GET /api/cache
```

Purpose:

Monitor cache state.

Example Response:

```json
[
  {
    "location": "23.35_85.33",
    "restaurants": 107,
    "loading": false
  }
]
```

Useful during development and debugging.

---

# Phase 14 - Menu System

Real Swiggy menu APIs proved unreliable.

Challenges:

* Empty menu responses
* Different structures
* Missing categories
* Response inconsistencies

Solution:

Created custom menu system.

---

# Menu Templates

Available Menus:

* Pizza
* Burger
* Chinese
* Biryani
* North Indian
* South Indian
* Mughlai
* Italian
* Fast Food
* Default

Stored inside:
menus/


# Dynamic Menu Selection

Menu determined using:

Restaurant Name

*

Restaurant Cuisines

Examples:

KFC

↓

Burger Menu

Domino's

↓

Pizza Menu

Pizza Hut

↓

Pizza Menu

McDonald's

↓

Burger Menu

Subway

↓

Fast Food Menu

Burger King

↓

Burger Menu

---

# Current Backend Features

✓ Swiggy Integration

✓ Multi Coordinate Discovery

✓ Restaurant Deduplication

✓ Background Fetching

✓ Location Based Caching

✓ Progressive Restaurant Loading

✓ Frontend Polling Support

✓ Search Endpoint

✓ Cache Debugging

✓ Dynamic Menu System

✓ Chain Detection

✓ Cuisine Based Menu Mapping

✓ Scalable Architecture

---

# Future Improvements

* Redis Cache
* Database Storage
* Real Menu Scraping
* Pagination Support
* Cuisine Search Endpoint
* Restaurant Recommendations
* Nearby Restaurant Ranking
* Analytics Dashboard
* Docker Deployment
* Production Hosting

---

# Final Outcome

Started as: Simple Express Proxy
Evolved into:
Location Aware Restaurant Discovery Backend capable of discovering, caching, expanding and serving restaurants dynamically based on user location while hiding Swiggy API complexities from the frontend.
