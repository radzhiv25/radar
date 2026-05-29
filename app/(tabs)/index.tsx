import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';

import { RestaurantFeedCard } from '@/components/feed/RestaurantFeedCard';
import { Screen } from '@/components/ui/Screen';
import { GuideState } from '@/components/ui/GuideState';
import { Text } from '@/components/ui/Text';
import { useFeed } from '@/hooks/useFeed';
import type { FeedItem } from '@/types/feed';

type FeedRow =
  | { type: 'header'; key: string }
  | { type: 'guide'; key: string }
  | { type: 'section'; key: string; title: string }
  | { type: 'item'; key: string; item: FeedItem };

export default function HomeScreen() {
  const { savedItems, feedItems, loading, guide, refresh } = useFeed();

  const showGuideBanner =
    guide && (guide.key === 'welcome' || guide.key === 'choose_taste') && !loading;
  const showGuideFull = guide && !loading && savedItems.length === 0 && feedItems.length === 0;

  const rows: FeedRow[] = [{ type: 'header', key: 'header' }];

  if (showGuideBanner) {
    rows.push({ type: 'guide', key: 'guide-banner' });
  }

  if (savedItems.length > 0) {
    rows.push({ type: 'section', key: 'saved-section', title: 'Saved' });
    savedItems.forEach((item) => rows.push({ type: 'item', key: `saved-${item.id}`, item }));
  }

  if (feedItems.length > 0) {
    rows.push({ type: 'section', key: 'for-you-section', title: 'For you' });
    feedItems.forEach((item) => rows.push({ type: 'item', key: `feed-${item.id}`, item }));
  }

  return (
    <Screen>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        refreshControl={
          <RefreshControl refreshing={loading && rows.length > 1} onRefresh={refresh} />
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator />
              <Text variant="body" className="mt-3">
                Setting up your feed…
              </Text>
            </View>
          ) : showGuideFull && guide ? (
            <GuideState
              guide={guide}
              onPrimaryPress={guide.key === 'connection_issue' ? refresh : undefined}
            />
          ) : null
        }
        renderItem={({ item: row }) => {
          if (row.type === 'header') {
            return (
              <View className="mb-2 gap-1">
                <Text variant="caption">Delhi</Text>
                <Text variant="title" className="text-xl">
                  Your feed
                </Text>
                <Text variant="body" className="text-sm">
                  Saved places first, then personalised picks.
                </Text>
              </View>
            );
          }
          if (row.type === 'guide' && guide) {
            return (
              <GuideState
                guide={guide}
                compact
                onPrimaryPress={guide.key === 'connection_issue' ? refresh : undefined}
              />
            );
          }
          if (row.type === 'section') {
            return (
              <Text variant="label" className="mt-2 text-stone-500">
                {row.title}
              </Text>
            );
          }
          if (row.type === 'item') {
            return <RestaurantFeedCard item={row.item} />;
          }
          return null;
        }}
      />
    </Screen>
  );
}
