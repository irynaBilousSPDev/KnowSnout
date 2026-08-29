import { Redirect } from 'expo-router';

/** Legacy route → Spotlight hub (single contest entry). */
export default function ContestsScreen() {
  return <Redirect href={'/(app)/spotlight-hub' as never} />;
}
