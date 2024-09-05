import { Tabs } from 'expo-router';
import React from 'react';

import { Image, View } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WordProvider } from '@/context/useWordContext';

import TabBar from '@/components/TabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <WordProvider>
      <Tabs
      tabBar={props => <TabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarBackground() {
            return Colors.light.background
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, focused }) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Image
                  source={require('@/assets/images/home_icon.png')}
                  style={{width: 24, height: 24 }}
                  resizeMode='contain'
                  />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="detect"
          options={{
            title: 'Detectar',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
    </WordProvider>
  );
}
