import { RestaurantMap } from '@/components/map/RestaurantMap';
import { Screen } from '@/components/ui/Screen';
import { useSaves } from '@/contexts/SavesContext';
import { useRestaurants } from '@/hooks/useRestaurants';

export default function MapScreen() {
  const {
    restaurants,
    loading,
    guide,
    query,
    areaFilter,
    cuisineFilter,
    tagFilter,
    refresh,
    setQuery,
    setAreaFilter,
    setCuisineFilter,
    setTagFilter,
    clearSearch,
  } = useRestaurants();
  const { savedIds, localPlaces, toggleSave, toggleMapPoi } = useSaves();

  return (
    <Screen edges={['left', 'right']}>
      <RestaurantMap
        restaurants={restaurants}
        loading={loading}
        guide={guide}
        query={query}
        areaFilter={areaFilter}
        cuisineFilter={cuisineFilter}
        tagFilter={tagFilter}
        onQueryChange={setQuery}
        onAreaFilterChange={setAreaFilter}
        onCuisineFilterChange={setCuisineFilter}
        onTagFilterChange={setTagFilter}
        onRefresh={refresh}
        onClearSearch={clearSearch}
        savedIds={savedIds}
        localPlaces={localPlaces}
        onToggleSave={toggleSave}
        onToggleMapPoi={toggleMapPoi}
      />
    </Screen>
  );
}
