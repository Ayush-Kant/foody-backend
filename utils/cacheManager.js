const areaCache = new Map();

const CACHE_TTL = 30 * 60 * 1000; // 30 mins

function getAreaKey(lat, lng) {
  return `${lat.toFixed(2)}_${lng.toFixed(2)}`;
}

function getArea(lat, lng) {
  const key = getAreaKey(lat, lng);

  const area = areaCache.get(key);

  if (!area) {
    return null;
  }

  const expired =
    Date.now() - area.lastUpdated >
    CACHE_TTL;

  if (expired) {
    areaCache.delete(key);
    return null;
  }

  return area;
}

function createArea(lat, lng) {
  const key = getAreaKey(lat, lng);

  const area = {
    restaurantMap: new Map(),
    loading: false,
    lastUpdated: Date.now(),
  };

  areaCache.set(key, area);

  return area;
}

function updateTimestamp(lat, lng) {
  const area = getArea(lat, lng);

  if (!area) return;

  area.lastUpdated = Date.now();
}

function setLoading(
  lat,
  lng,
  loading
) {
  const area = getArea(lat, lng);

  if (!area) return;

  area.loading = loading;
}

function getStats() {
  const stats = [];

  areaCache.forEach(
    (value, key) => {
      stats.push({
        area: key,
        restaurants:
          value.restaurantMap.size,
        loading: value.loading,
        lastUpdated:
          value.lastUpdated,
      });
    }
  );

  return stats;
}

module.exports = {
  getAreaKey,
  getArea,
  createArea,
  updateTimestamp,
  setLoading,
  getStats,
};