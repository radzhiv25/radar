import { FlatList, Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { RestaurantMapRow } from '@/types/database';

type MapSearchResultsProps = {
  results: RestaurantMapRow[];
  savedIds: Set<string>;
  visible: boolean;
  top?: number;
  onSelect: (restaurant: RestaurantMapRow) => void;
};

export function MapSearchResults({
  results,
  savedIds,
  visible,
  top = 112,
  onSelect,
}: MapSearchResultsProps) {
  if (!visible || results.length === 0) return null;

  return (
    <RNView style={[styles.panel, { top }]}>
      <FlatList
        data={results.slice(0, 8)}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelect(item)} style={styles.row}>
            <RNView style={styles.rowText}>
              <Text variant="label" className="text-sm">
                {item.name}
              </Text>
              <Text variant="body" className="text-xs text-stone-500">
                {item.neighbourhood} · {item.cuisine}
              </Text>
            </RNView>
            {savedIds.has(item.id) && (
              <Text variant="caption" className="normal-case tracking-normal text-stone-400">
                Saved
              </Text>
            )}
          </Pressable>
        )}
      />
    </RNView>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 11,
    maxHeight: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e5e4',
  },
  rowText: {
    flex: 1,
    marginRight: 8,
  },
});
