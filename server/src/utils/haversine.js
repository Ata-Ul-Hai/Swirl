/**
 * Calculate the great-circle distance between two points on Earth using the Haversine formula.
 * @param {[number, number]} coord1 - [longitude, latitude] of point 1
 * @param {[number, number]} coord2 - [longitude, latitude] of point 2
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
export function calculateHaversineDistance(coord1, coord2) {
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) {
    return 3.5; // reasonable fallback default distance in km
  }

  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
}

/**
 * Compute delivery fee based on distance
 * - Base fee of ₹30 for up to 3 km
 * - ₹12 per km for additional distance beyond 3 km
 */
export function calculateDeliveryFee(distanceKm) {
  const baseKm = 3;
  const baseFee = 30;
  const perKmRate = 12;

  if (distanceKm <= baseKm) {
    return baseFee;
  }

  const extraKm = distanceKm - baseKm;
  const fee = baseFee + extraKm * perKmRate;
  return Math.round(fee);
}
