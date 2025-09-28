import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { weekTypeEnum } from '../../types/scheduleTypes';
import { useTheme } from 'react-native-paper';
import { isTodayEvenWeek } from '../../utils/scheduleOptions';
import { GradesScreen } from './Screens/GradesScreen';
import { CertificationScreen } from './Screens/CertificationScreen';

const Tab = createMaterialTopTabNavigator();

function GradesTab() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.primary, // Цвет фона табов
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 14,
          textTransform: 'none', // Убирает CAPS
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.onPrimary, // Цвет полоски под активным табом
          height: 3,
          borderRadius: 2,
        },
        tabBarActiveTintColor: theme.colors.onPrimary,
        tabBarInactiveTintColor: theme.colors.onPrimaryContainer,
      }}
    >
      <Tab.Screen
        name="Оценки"
        children={() => <GradesScreen />}
      />
      <Tab.Screen
        name="Текущая аттестация"
        children={() => <CertificationScreen />}
      />
    </Tab.Navigator>
  );
}

export default GradesTab;
