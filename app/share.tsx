import { ScreenShell } from '@/components/ScreenShell';

export default function ShareScreen() {
  return (
    <ScreenShell
      title="Share → save"
      subtitle="Instagram / share extension lands here — search catalog, then save (no caption parsing in MVP)."
      bullets={['search_restaurants(query)', 'Pick result → save', 'Not wired yet in this build']}
      links={[{ href: '/restaurant/demo', label: 'Open sample after search' }]}
    />
  );
}
