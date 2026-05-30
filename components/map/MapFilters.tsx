import { ScrollView, Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/ui/Text';
import { MAP_CUISINES, MAP_TAG_FILTERS } from '@/lib/constants/tags';
import type { DelhiArea } from '@/types/database';

const AREAS: { id: DelhiArea | null; label: string }[] = [
  { id: null, label: 'All Delhi' },
  { id: 'north', label: 'North' },
  { id: 'south', label: 'South' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
];

export type MapTagFilter = (typeof MAP_TAG_FILTERS)[number] | null;

type MapFiltersProps = {
  areaFilter: DelhiArea | null;
  cuisineFilter: string | null;
  tagFilter: MapTagFilter;
  onAreaChange: (area: DelhiArea | null) => void;
  onCuisineChange: (cuisine: string | null) => void;
  onTagChange: (tag: MapTagFilter) => void;
  top?: number;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text variant="label" className={active ? 'text-white' : 'text-stone-600 dark:text-stone-300'}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MapFilters({
  areaFilter,
  cuisineFilter,
  tagFilter,
  onAreaChange,
  onCuisineChange,
  onTagChange,
  top = 64,
}: MapFiltersProps) {
  return (
    <RNView pointerEvents="box-none" style={[styles.wrap, { top }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {AREAS.map((area) => (
          <Chip
            key={area.label}
            label={area.label}
            active={areaFilter === area.id}
            onPress={() => onAreaChange(area.id)}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, styles.secondRow]}>
        <Chip
          label="All cuisines"
          active={!cuisineFilter}
          onPress={() => onCuisineChange(null)}
        />
        {MAP_CUISINES.map((cuisine) => (
          <Chip
            key={cuisine}
            label={cuisine}
            active={cuisineFilter === cuisine}
            onPress={() => onCuisineChange(cuisineFilter === cuisine ? null : cuisine)}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, styles.secondRow]}>
        <Chip label="Any vibe" active={!tagFilter} onPress={() => onTagChange(null)} />
        {MAP_TAG_FILTERS.map((item) => (
          <Chip
            key={item.tag}
            label={item.label}
            active={tagFilter?.tag === item.tag}
            onPress={() => onTagChange(tagFilter?.tag === item.tag ? null : item)}
          />
        ))}
      </ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 11,
  },
  row: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  secondRow: {
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#44403c',
    borderColor: '#44403c',
  },
});
