import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
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
    </Tabs>
  );
}