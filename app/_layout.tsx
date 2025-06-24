// app/_layout.tsx
import { Stack } from 'expo-router';
import { appendBaseUrl } from 'expo-router/build/fork/getPathFromState';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
