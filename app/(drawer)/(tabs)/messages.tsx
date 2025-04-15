import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Messages() {
  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/messages.tsx" title="Messages" />
      </Container>
    </>
  );
}
