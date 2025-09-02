// navigation/DrawerNavigator.tsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import CustomDrawerContent from './CustomDrawerContent';
import WeeklyScheduleTab from '../screens/WeeklySchedule/WeeklyScheduleTab';
import StudentProfileScreen from "../screens/StudentProfileScreen";
import StudyTasksScreen from '../screens/StudyTaskScreen';
import GradesScreen from '../screens/GradesScreen';
import { useRefreshSemesterSchedule } from '../hooks/useRefreshSemesterSchedule';
import { getData, STUDENT_ID_STORAGE_KEY } from '../utils/storage';
import { Alert } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { mutate: refreshSchedule, isPending } = useRefreshSemesterSchedule();

  const handleRefresh = async () => {
    try {
      const studentId = await getData(STUDENT_ID_STORAGE_KEY);
      if (!studentId) {
        Alert.alert('Ошибка', 'ID студента не найден');
        return;
      }

      refreshSchedule({ studentId }, {
        onSuccess: () => {
          Alert.alert('Успех', 'Расписание обновлено');
        },
        onError: () => {
          Alert.alert('Ошибка', 'Не удалось обновить расписание');
        }
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла непредвиденная ошибка');
    }
  };

  return (
    <Drawer.Navigator 
      initialRouteName="Главная" 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen 
        name="Главная" 
        component={HomeScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          )
        }}
      />
      <Drawer.Screen 
        name="Профиль" 
        component={StudentProfileScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          )
        }}
      />
      <Drawer.Screen 
        name="Расписание" 
        component={WeeklyScheduleTab} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📅</Text>
          ),
          headerRight: () => <IconButton
            icon="refresh"
            size={24}
            onPress={handleRefresh}
            disabled={isPending}
          />
        }}
        
      />
      <Drawer.Screen 
        name="Задачи" 
        component={StudyTasksScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>✅</Text>
          )
        }}
      />
      <Drawer.Screen 
        name="Оценки" 
        component={GradesScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          )
        }}
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;