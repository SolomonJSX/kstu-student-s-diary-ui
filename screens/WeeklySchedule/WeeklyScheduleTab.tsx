import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { WeeklyScheduleScreen } from './WeeklyScheduleScreen';
import { weekTypeEnum } from '../../types/scheduleTypes';
import { useTheme } from 'react-native-paper';
import { isTodayEvenWeek } from '../../utils/scheduleOptions';

const Tab = createMaterialTopTabNavigator();

function WeeklyScheduleTab() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={isTodayEvenWeek() ? "Знаменатель" : "Числитель"}
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
        name="Числитель"
        children={() => <WeeklyScheduleScreen weekType={weekTypeEnum.numerator} />}
      />
      <Tab.Screen
        name="Знаменатель"
        children={() => <WeeklyScheduleScreen weekType={weekTypeEnum.denominator} />}
      />
    </Tab.Navigator>
  );
}

export default WeeklyScheduleTab;
