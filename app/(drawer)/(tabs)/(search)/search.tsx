import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Search() {
  return (
    <>
      <Stack.Screen options={{ title: 'Search' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/search.tsx" title="Search" />
      </Container>
    </>
  );
}
