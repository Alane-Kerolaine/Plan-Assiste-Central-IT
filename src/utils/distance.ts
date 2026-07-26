export type Coordinates = {
  latitude?: number
  longitude?: number
}

function toRadians(value: number) {
  return value * Math.PI / 180
}

export function calculateDistanceKm(origin: Coordinates, destination: Coordinates) {
  if (
    origin.latitude === undefined ||
    origin.longitude === undefined ||
    destination.latitude === undefined ||
    destination.longitude === undefined
  ) {
    return null
  }

  const earthRadiusKm = 6371
  const latitudeDistance = toRadians(destination.latitude - origin.latitude)
  const longitudeDistance = toRadians(destination.longitude - origin.longitude)
  const originLatitude = toRadians(origin.latitude)
  const destinationLatitude = toRadians(destination.latitude)

  const haversine =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDistance / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function formatDistanceKm(distance: number) {
  return `${distance.toFixed(1).replace('.', ',')} km`
}
