import { Pressable, ScrollView, StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { DelhiArea } from '@/types/database';

const AREAS: { id: DelhiArea | null; label: string }[] = [
  { id: null, label: 'All Delhi' },
  { id: 'north', label: 'North' },
  { id: 'south', label: 'South' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
];

type MapAreaFiltersProps = {
  selected: DelhiArea | null;
  onSelect: (area: DelhiArea | null) => void;
  top?: number;
};

export function MapAreaFilters({ selected, onSelect, top = 64 }: MapAreaFiltersProps) {
  return (
    <RNView pointerEvents="box-none" style={[styles.wrap, { top }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {AREAS.map((area) => {
          const active = selected === area.id;
          return (
            <Pressable
              key={area.label}
              onPress={() => onSelect(area.id)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text
                variant="label"
                className={active ? 'text-white' : 'text-stone-600 dark:text-stone-300'}>
                {area.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    zIndex: 11,
  },
  row: {
    paddingHorizontal: 16,
    gap: 8,
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
