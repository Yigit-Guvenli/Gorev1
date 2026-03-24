import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Sakana': require('@/assets/fonts/sakana.regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="teams" />
      <Tabs.Screen name="games" />
      <Tabs.Screen name="courses" />
      <Tabs.Screen name="season" />
      <Tabs.Screen name="dictionary" />
      <Tabs.Screen name="team-detail" />
      <Tabs.Screen name="course-detail" />
      <Tabs.Screen name="video" />
      <Tabs.Screen name="memory-game" />
    </Tabs>
  );
}