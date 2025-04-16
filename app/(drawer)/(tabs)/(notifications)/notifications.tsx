import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Notifications() {
  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/notifications.tsx" title="Notifications" />
      </Container>
    </>
  );
}
