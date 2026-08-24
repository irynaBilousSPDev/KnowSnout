import { Redirect } from 'expo-router';

/** Profile lives on 04.25 my-profile; account settings stay at my-data. */
export default function MeTabRedirect() {
  return <Redirect href="/(app)/my-profile" />;
}
