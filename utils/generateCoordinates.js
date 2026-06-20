function generateCoordinates(
  centerLat,
  centerLng,
  radiusKm,
  totalPoints
) {
  const coordinates = [];

  const addCoordinate = (
    lat,
    lng,
    distance
  ) => {
    coordinates.push({
      lat,
      lng,
      distance,
    });
  };

  // Center point first
  addCoordinate(
    centerLat,
    centerLng,
    0
  );

  const rings = [
    radiusKm * 0.25,
    radiusKm * 0.5,
    radiusKm * 0.75,
    radiusKm,
  ];

  rings.forEach((distanceKm) => {
    const latOffset =
      distanceKm / 111;

    const lngOffset =
      distanceKm /
      (111 *
        Math.cos(
          centerLat *
            (Math.PI / 180)
        ));

    // North
    addCoordinate(
      centerLat + latOffset,
      centerLng,
      distanceKm
    );

    // South
    addCoordinate(
      centerLat - latOffset,
      centerLng,
      distanceKm
    );

    // East
    addCoordinate(
      centerLat,
      centerLng + lngOffset,
      distanceKm
    );

    // West
    addCoordinate(
      centerLat,
      centerLng - lngOffset,
      distanceKm
    );

    // North-East
    addCoordinate(
      centerLat + latOffset,
      centerLng + lngOffset,
      distanceKm
    );

    // North-West
    addCoordinate(
      centerLat + latOffset,
      centerLng - lngOffset,
      distanceKm
    );

    // South-East
    addCoordinate(
      centerLat - latOffset,
      centerLng + lngOffset,
      distanceKm
    );

    // South-West
    addCoordinate(
      centerLat - latOffset,
      centerLng - lngOffset,
      distanceKm
    );
  });

  // nearest locations first
  coordinates.sort(
    (a, b) =>
      a.distance - b.distance
  );

  return coordinates
    .slice(0, totalPoints)
    .map((point) => [
      point.lat,
      point.lng,
    ]);
}

module.exports =
  generateCoordinates;