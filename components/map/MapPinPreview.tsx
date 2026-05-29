import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RestaurantMapCard } from '@/components/restaurant/RestaurantMapCard';
import type { RestaurantMapRow } from '@/types/database';

type MapPinPreviewProps = {
  restaurant: RestaurantMapRow;
  isSaved: boolean;
  saving: boolean;
  onDismiss: () => void;
  onToggleSave: () => void;
};

export function MapPinPreview({
  restaurant,
  isSaved,
  saving,
  onDismiss,
  onToggleSave,
}: MapPinPreviewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + 12,
        zIndex: 20,
      }}>
      <RestaurantMapCard
        restaurant={restaurant}
        isSaved={isSaved}
        saving={saving}
        onToggleSave={onToggleSave}
        onDismiss={onDismiss}
      />
    </View>
  );
}
