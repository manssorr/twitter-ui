import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Video() {
  return (
    <>
      <Stack.Screen options={{ title: 'Video' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/video.tsx" title="Video" />
      </Container>
    </>
  );
}
