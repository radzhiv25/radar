import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import { isPoiSaveId } from '@/types/place';
import type { RestaurantMapRow } from '@/types/database';

type RestaurantMapCardProps = {
  restaurant: RestaurantMapRow;
  isSaved: boolean;
  saving?: boolean;
  onToggleSave: () => void;
  onDismiss?: () => void;
};

export function RestaurantMapCard({
  restaurant,
  isSaved,
  saving,
  onToggleSave,
  onDismiss,
}: RestaurantMapCardProps) {
  const router = useRouter();
  const fromMapPoi = isPoiSaveId(restaurant.id);

  return (
    <View
      pointerEvents="auto"
      className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      {onDismiss && (
        <Pressable onPress={onDismiss} className="absolute right-3 top-3 z-10 px-2 py-1">
          <Text variant="caption" className="normal-case tracking-normal">
            ✕
          </Text>
        </Pressable>
      )}

      <Pressable
        disabled={fromMapPoi}
        onPress={() => router.push(`/restaurant/${restaurant.id}`)}>
        <Text variant="label" className="pr-8 text-base">
          {restaurant.name}
        </Text>
        <Text variant="body" className="mt-1 text-sm text-stone-500">
          {fromMapPoi
            ? 'From the map · saved on this device only'
            : `${restaurant.cuisine} · ${restaurant.neighbourhood} · ${restaurant.area}`}
        </Text>
        {!fromMapPoi && restaurant.avg_rating > 0 && (
          <Text variant="body" className="mt-0.5 text-sm text-stone-400">
            {'₹'.repeat(restaurant.price_band)} · ★ {Number(restaurant.avg_rating).toFixed(1)}
          </Text>
        )}
      </Pressable>

      <View className="mt-3 flex-row gap-2">
        <Button
          label={isSaved ? 'Saved to device' : 'Save to device'}
          className="mt-0 flex-1"
          onPress={onToggleSave}
          disabled={saving}
        />
        {!fromMapPoi && (
          <Button
            label="Full card"
            variant="ghost"
            className="mt-0 flex-1"
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
          />
        )}
      </View>
    </View>
  );
}
