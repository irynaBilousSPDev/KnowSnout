import { Redirect } from 'expo-router';

/** Alias → 07.02 Платежі */
export default function SubscriptionScreen() {
  return <Redirect href={'/(app)/payments' as never} />;
}
