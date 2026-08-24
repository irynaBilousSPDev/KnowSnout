import { Redirect } from 'expo-router';

/** Legacy route — onboarding lives in auth stack (01.01–01.03). */
export default function OnboardingRedirect() {
  return <Redirect href={'/(auth)/onboarding' as never} />;
}
