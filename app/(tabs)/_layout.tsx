import { useFonts } from 'expo-font';
import { Tabs, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Sakana': require('@/assets/fonts/sakana.regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      // Oyun ekranları → Games
      if (
        pathname.includes("memory-game") ||
        pathname.includes("robotik-quiz") ||
        pathname.includes("tabu-game") ||
        pathname.includes("team-guess")||
        pathname.includes("truth-or-dare")||
         pathname.includes("spin-wheel")
      ) {
        router.replace("/(tabs)/games" as any);
        return true;
      }
      // Takım detay → Takımlar
      if (pathname.includes("team-detail")) {
        router.replace("/(tabs)/teams" as any);
        return true;
      }
      // Video → Courses-Detail
      if (pathname.includes("video")) {
        router.replace("/(tabs)/course-detail" as any);
        return true;
      }
       if (pathname.includes("course-detail")) {
        router.replace("/(tabs)/courses" as any);
        return true;
      }
      // Ana sayfa → çıkış uyarısı
      if (pathname === "/" || pathname === "/(tabs)" || pathname === "/(tabs)/index") {
        BackHandler.exitApp();
        return true;
      }
      // Diğer tüm ekranlar → Ana sayfa
      router.replace("/(tabs)" as any);
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => sub.remove();
  }, [pathname]);

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