import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';

type ReviewFormProps = {
  initialRating?: number;
  initialBody?: string;
  onSubmit: (rating: number, body: string) => Promise<{ ok: boolean; error?: string }>;
};

export function ReviewForm({ initialRating = 0, initialBody = '', onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState(initialBody);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      setError('Pick a star rating');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await onSubmit(rating, body);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not save review');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Text variant="body" className="text-stone-600">
        Thanks — your review is live.
      </Text>
    );
  }

  return (
    <View className="gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <Text variant="label">Your review</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)} className="px-1">
            <Text variant="title" className={rating >= star ? 'text-amber-500' : 'text-stone-300'}>
              ★
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Short note (optional)"
        multiline
        className="min-h-[80px] rounded-lg border border-stone-200 px-3 py-2 text-base dark:border-stone-700 dark:bg-stone-950"
      />
      <Button label={busy ? 'Saving…' : 'Post review'} onPress={submit} disabled={busy} />
      {error ? (
        <Text variant="body" className="text-sm text-red-600">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
