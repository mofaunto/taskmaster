import * as Location from "expo-location";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PickedLocation = Coordinates & {
  name?: string;
};

export async function getCurrentPosition(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      "Location access was denied. You can enable it in Settings.",
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export async function getAddress(
  coordinates: Coordinates,
): Promise<string | null> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    const [place] = await Location.reverseGeocodeAsync(coordinates);
    if (!place) {
      return null;
    }
    if (place.formattedAddress) {
      return place.formattedAddress;
    }

    const street = [place.streetNumber, place.street].filter(Boolean).join(" ");
    return [street, place.city].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}
