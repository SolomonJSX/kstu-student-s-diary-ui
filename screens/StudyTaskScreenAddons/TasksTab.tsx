import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { weekTypeEnum } from '../../types/scheduleTypes';
import { useTheme } from 'react-native-paper';
import { isTodayEvenWeek } from '../../utils/scheduleOptions';
import StudyTasksScreen from './StudyTaskScreen';
import GeneralTasksScreen from './GeneralTasksScreen';

const Tab = createMaterialTopTabNavigator();

function TasksTab() {
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
        name="Мои задачи"
        children={() => <StudyTasksScreen />}
      />
      <Tab.Screen
        name="Общие задачи"
        children={() => <GeneralTasksScreen />}
      />
    </Tab.Navigator>
  );
}

export default TasksTab;
