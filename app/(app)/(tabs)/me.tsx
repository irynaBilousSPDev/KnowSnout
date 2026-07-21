import { Redirect } from 'expo-router';

/** Legacy tab route — profile lives opposite the logo as «Мої дані». */
export default function MeTabRedirect() {
  return <Redirect href="/(app)/my-data" />;
}
