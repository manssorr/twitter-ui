import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Grok() {
  return (
    <>
      <Stack.Screen options={{ title: 'Grok' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/grok.tsx" title="Grok" />
      </Container>
    </>
  );
}
