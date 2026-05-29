import { ScreenShell } from '@/components/ScreenShell';

export default function LoginScreen() {
  return (
    <ScreenShell
      title="Sign in"
      subtitle="Phone OTP or Apple / Google — required before saving."
      bullets={['Supabase Auth', 'Redirects to onboarding if no user_preferences']}
      links={[{ href: '/(onboarding)/preferences', label: 'Continue to onboarding' }]}
    />
  );
}
