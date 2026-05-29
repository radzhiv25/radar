import type { Region } from 'react-native-maps';

/** Default map center: central Delhi (MVP) */
export const DELHI_LAT = 28.6139;
export const DELHI_LNG = 77.209;

export const DELHI_CENTER = {
  latitude: DELHI_LAT,
  longitude: DELHI_LNG,
};

export const DELHI_INITIAL_REGION: Region = {
  ...DELHI_CENTER,
  latitudeDelta: 0.14,
  longitudeDelta: 0.14,
};
