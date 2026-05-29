import { useRouter } from 'expo-router';
import { Image, Pressable, View as RNView } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import { useSaves } from '@/contexts/SavesContext';
import { isPoiSaveId } from '@/types/place';
import type { FeedItem } from '@/types/feed';

type RestaurantFeedCardProps = {
  item: FeedItem;
  showSave?: boolean;
};

export function RestaurantFeedCard({ item, showSave = true }: RestaurantFeedCardProps) {
  const router = useRouter();
  const { isSaved, toggleSave, toggleMapPoi } = useSaves();
  const fromMapPoi = isPoiSaveId(item.id);
  const imageUri = item.image_urls?.[0];
  const priceLabel = '₹'.repeat(Math.min(item.price_band, 4));
  const saved = isSaved(item.id);

  const handleToggleSave = () => {
    if (fromMapPoi) {
      void toggleMapPoi({
        name: item.name,
        lat: item.lat,
        lng: item.lng,
        placeId: item.slug,
      });
      return;
    }
    void toggleSave(item.id);
  };

  return (
    <RNView className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <Pressable
        disabled={fromMapPoi}
        onPress={() => router.push(`/restaurant/${item.id}`)}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ height: 176, width: '100%', backgroundColor: '#f5f5f4' }}
            resizeMode="cover"
          />
        ) : (
          <View className="h-44 w-full items-center justify-center bg-stone-100 dark:bg-stone-800">
            <Text variant="caption" className="normal-case tracking-normal">
              {item.cuisine}
            </Text>
          </View>
        )}

        <View className="gap-1.5 p-4">
          <View className="flex-row items-start justify-between gap-2">
            <Text variant="label" className="flex-1 text-base">
              {item.name}
            </Text>
            {item.is_editors_pick && (
              <Text variant="caption" className="normal-case tracking-normal">
                Pick
              </Text>
            )}
          </View>

          <Text variant="body" className="text-sm text-stone-500 dark:text-stone-400">
            {item.cuisine} · {item.neighbourhood} · {priceLabel}
            {item.avg_rating > 0 ? ` · ★ ${Number(item.avg_rating).toFixed(1)}` : ''}
          </Text>

          <Text variant="body" className="text-sm text-stone-400 dark:text-stone-500">
            {item.match_reason}
          </Text>
        </View>
      </Pressable>

      {showSave && (
        <View className="border-t border-stone-100 px-4 pb-4 pt-2 dark:border-stone-800">
          <Button
            label={saved ? 'Saved' : 'Save'}
            className="mt-0 w-full self-stretch"
            onPress={handleToggleSave}
          />
        </View>
      )}
    </RNView>
  );
}
