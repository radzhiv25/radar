import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';
import MapView, { Marker, type LongPressEvent, type MapPressEvent, type PoiClickEvent } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapFilters, type MapTagFilter } from '@/components/map/MapFilters';
import { MapFallbackList } from '@/components/map/MapFallbackList';
import { MapPinPreview } from '@/components/map/MapPinPreview';
import { MapSearchResults } from '@/components/map/MapSearchResults';
import { GuideState } from '@/components/ui/GuideState';
import { Text } from '@/components/ui/Text';
import { DELHI_INITIAL_REGION } from '@/lib/constants/map';
import { mapRowFromMapSelection, resolvePlaceName } from '@/lib/map/poi';
import { isPoiSaveId } from '@/types/place';
import type { SavedLocalPlace } from '@/types/place';
import type { DelhiArea, RestaurantMapRow } from '@/types/database';
import type { GuideContent } from '@/types/guide';

type RestaurantMapProps = {
  restaurants: RestaurantMapRow[];
  loading: boolean;
  guide: GuideContent | null;
  query: string;
  areaFilter: DelhiArea | null;
  cuisineFilter: string | null;
  tagFilter: MapTagFilter;
  onQueryChange: (query: string) => void;
  onAreaFilterChange: (area: DelhiArea | null) => void;
  onCuisineFilterChange: (cuisine: string | null) => void;
  onTagFilterChange: (tag: MapTagFilter) => void;
  onRefresh: () => void;
  onClearSearch: () => void;
  savedIds: Set<string>;
  localPlaces: Record<string, SavedLocalPlace>;
  onToggleSave: (restaurantId: string) => Promise<boolean>;
  onToggleMapPoi: (input: {
    name: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => Promise<void>;
};

const MAP_GUIDE_KEYS = new Set([
  'setup_connection',
  'connection_issue',
  'empty_map',
  'no_search_results',
]);

export function RestaurantMap({
  restaurants,
  loading,
  guide,
  query,
  areaFilter,
  cuisineFilter,
  tagFilter,
  onQueryChange,
  onAreaFilterChange,
  onCuisineFilterChange,
  onTagFilterChange,
  onRefresh,
  onClearSearch,
  savedIds,
  localPlaces,
  onToggleSave,
  onToggleMapPoi,
}: RestaurantMapProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const markerTapRef = useRef(false);
  const [selected, setSelected] = useState<RestaurantMapRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [overlayGuideDismissed, setOverlayGuideDismissed] = useState(false);
  const [resolvingPlace, setResolvingPlace] = useState(false);

  const validPins = useMemo(
    () => restaurants.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng)),
    [restaurants]
  );

  const blockingGuide =
    guide && (guide.key === 'setup_connection' || guide.key === 'connection_issue');
  const showSearchResults = query.trim().length > 0 && !blockingGuide;
  const dismissibleGuide =
    guide?.key === 'empty_map' ||
    guide?.key === 'connection_issue' ||
    guide?.key === 'setup_connection';
  const showOverlayGuide =
    guide && MAP_GUIDE_KEYS.has(guide.key) && (!dismissibleGuide || !overlayGuideDismissed);
  const guideAtBottom = dismissibleGuide;

  const onGuidePrimary = () => {
    if (!guide) return;
    if (guide.key === 'connection_issue') void onRefresh();
    if (guide.key === 'no_search_results') onClearSearch();
  };

  const selectRestaurant = useCallback((restaurant: RestaurantMapRow) => {
    markerTapRef.current = true;
    setSelected(restaurant);
  }, []);

  const openMapSelection = useCallback(
    (input: { name: string; placeId?: string | null; lat: number; lng: number }) => {
      markerTapRef.current = true;
      setSelected(mapRowFromMapSelection(input));
    },
    []
  );

  const handleMapPress = useCallback((event: MapPressEvent) => {
    if (Platform.OS === 'android' && event.nativeEvent.action === 'marker-press') {
      return;
    }

    const clearSelection = () => {
      if (markerTapRef.current) {
        markerTapRef.current = false;
        return;
      }
      setSelected(null);
    };

    if (Platform.OS === 'android') {
      setTimeout(clearSelection, 120);
      return;
    }

    requestAnimationFrame(clearSelection);
  }, []);

  const handleMarkerPress = useCallback(
    (markerId: string) => {
      const hit = validPins.find((r) => r.id === markerId);
      if (hit) selectRestaurant(hit);
    },
    [validPins, selectRestaurant]
  );

  const focusRestaurant = (restaurant: RestaurantMapRow) => {
    selectRestaurant(restaurant);
    onQueryChange('');
    if (Number.isFinite(restaurant.lat) && Number.isFinite(restaurant.lng)) {
      mapRef.current?.animateToRegion(
        {
          latitude: restaurant.lat,
          longitude: restaurant.lng,
          latitudeDelta: 0.045,
          longitudeDelta: 0.045,
        },
        400
      );
    }
  };

  const handleToggleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (isPoiSaveId(selected.id)) {
        await onToggleMapPoi({
          name: selected.name,
          lat: selected.lat,
          lng: selected.lng,
          placeId: selected.slug,
        });
      } else {
        await onToggleSave(selected.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePoiClick = useCallback(
    (event: PoiClickEvent) => {
      const { name, placeId, coordinate } = event.nativeEvent;
      openMapSelection({
        name: name ?? 'Selected place',
        placeId,
        lat: coordinate.latitude,
        lng: coordinate.longitude,
      });
    },
    [openMapSelection]
  );

  const handleMapLongPress = useCallback(
    async (event: LongPressEvent) => {
      const { coordinate } = event.nativeEvent;
      const lat = coordinate.latitude;
      const lng = coordinate.longitude;

      setResolvingPlace(true);
      try {
        const name = await resolvePlaceName(lat, lng);
        openMapSelection({ name, placeId: null, lat, lng });
      } finally {
        setResolvingPlace(false);
      }
    },
    [openMapSelection]
  );

  const savedMapMarkers = useMemo(
    () =>
      Object.values(localPlaces).filter(
        (place) => savedIds.has(place.id) && Number.isFinite(place.lat) && Number.isFinite(place.lng)
      ),
    [localPlaces, savedIds]
  );

  useEffect(() => {
    setOverlayGuideDismissed(false);
  }, [guide?.key]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void Location.requestForegroundPermissionsAsync();
  }, []);

  const searchTop = insets.top + 8;
  const filtersTop = searchTop + 52;

  if (Platform.OS === 'web') {
    return (
      <RNView style={styles.container}>
        <RNView style={[styles.searchBar, { top: searchTop }]}>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search name, neighbourhood, or area…"
            placeholderTextColor="#a8a29e"
            style={styles.searchInput}
          />
        </RNView>
        <MapFilters
          areaFilter={areaFilter}
          cuisineFilter={cuisineFilter}
          tagFilter={tagFilter}
          onAreaChange={onAreaFilterChange}
          onCuisineChange={onCuisineFilterChange}
          onTagChange={onTagFilterChange}
          top={filtersTop}
        />
        <Text variant="caption" className="px-4 pb-2 pt-24 normal-case tracking-normal">
          Map is not supported on web — list view below.
        </Text>
        <MapFallbackList
          restaurants={restaurants}
          loading={loading}
          guide={guide}
          onRefresh={onRefresh}
          onClearSearch={onClearSearch}
          savedIds={savedIds}
          onToggleSave={onToggleSave}
        />
      </RNView>
    );
  }

  return (
    <RNView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DELHI_INITIAL_REGION}
        onPress={handleMapPress}
        onMarkerPress={(e) => {
          const markerId = e.nativeEvent.id;
          if (markerId) handleMarkerPress(markerId);
        }}
        onPoiClick={handlePoiClick}
        onLongPress={handleMapLongPress}
        poiClickEnabled
        showsPointsOfInterest={Platform.OS === 'ios'}
        showsUserLocation
        showsMyLocationButton={false}>
        {savedMapMarkers.map((place) => (
          <Marker
            key={`saved-${place.id}`}
            identifier={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
            description="Saved on this device"
            pinColor="#292524"
            onPress={() =>
              openMapSelection({
                name: place.name,
                placeId: place.placeId,
                lat: place.lat,
                lng: place.lng,
              })
            }
          />
        ))}
        {validPins.map((restaurant) => (
          <Marker
            key={restaurant.id}
            identifier={restaurant.id}
            coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }}
            title={restaurant.name}
            description={`${restaurant.neighbourhood} · ${restaurant.area}`}
            pinColor={
              savedIds.has(restaurant.id)
                ? '#44403c'
                : restaurant.is_editors_pick
                  ? '#78716c'
                  : '#a8a29e'
            }
            onPress={() => selectRestaurant(restaurant)}
          />
        ))}
      </MapView>

      <RNView style={[styles.searchBar, { top: searchTop }]} pointerEvents="box-none">
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search name, neighbourhood, or area…"
          placeholderTextColor="#a8a29e"
          style={styles.searchInput}
          returnKeyType="search"
        />
        {(loading || resolvingPlace) && (
          <ActivityIndicator size="small" style={styles.searchSpinner} />
        )}
      </RNView>

      {Platform.OS === 'android' && !selected && !showOverlayGuide && (
        <RNView pointerEvents="none" style={[styles.mapHint, { bottom: insets.bottom + 16 }]}>
          <Text variant="caption" className="normal-case tracking-normal text-stone-600">
            Tap a business on the map, or press and hold to save a spot
          </Text>
        </RNView>
      )}

      <MapFilters
        areaFilter={areaFilter}
        cuisineFilter={cuisineFilter}
        tagFilter={tagFilter}
        onAreaChange={onAreaFilterChange}
        onCuisineChange={onCuisineFilterChange}
        onTagChange={onTagFilterChange}
        top={filtersTop}
      />

      <MapSearchResults
        results={restaurants}
        savedIds={savedIds}
        visible={showSearchResults}
        top={searchTop + 108}
        onSelect={focusRestaurant}
      />

      {showOverlayGuide && (
        <RNView
          pointerEvents="box-none"
          style={[
            guideAtBottom ? styles.guideBottom : styles.guideBanner,
            guideAtBottom
              ? { bottom: insets.bottom + (selected ? 200 : 24) }
              : { top: searchTop + 108 },
          ]}>
          <RNView pointerEvents="auto">
            <GuideState
              guide={guide}
              compact
              onPrimaryPress={onGuidePrimary}
              onSecondaryPress={
                dismissibleGuide ? () => setOverlayGuideDismissed(true) : undefined
              }
            />
          </RNView>
        </RNView>
      )}

      {selected && (
        <MapPinPreview
          restaurant={selected}
          isSaved={savedIds.has(selected.id)}
          saving={saving}
          onDismiss={() => setSelected(null)}
          onToggleSave={handleToggleSave}
        />
      )}
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#292524',
  },
  searchSpinner: {
    marginLeft: 8,
  },
  guideBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  guideBottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  mapHint: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});
