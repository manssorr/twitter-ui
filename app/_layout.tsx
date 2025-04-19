import '../global.css';
import { useState, useEffect } from 'react'; 

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AnimatedSplash from "react-native-animated-splash-screen"; 

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  const [isLoaded, setIsLoaded] = useState(false); 

  useEffect(() => {
    // Simulate loading task
    setTimeout(() => {
      setIsLoaded(true);
    }, 1000); 
  }, []);

  return (
    <AnimatedSplash
      translucent={true} 
      isLoaded={isLoaded}
      logoImage={{uri: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png"}} 
      backgroundColor={"#000000"} 
      logoHeight={150}
      logoWidth={150}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
         <BottomSheetModalProvider>
        <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
      </Stack>
      </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AnimatedSplash>
  );
}
