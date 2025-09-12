// navigation/DrawerNavigator.tsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useState } from 'react';
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
import UmkdSubjectLists from '../screens/UMKD/UmkdSubjectLists';
import UmkdScreen from '../screens/UMKD/UmkdScreen';
import ToolsScreen from '../screens/ToolsScreen';
import StudentsGithubListScreen from '../screens/Students/StudentsGithubListScreen';
import GitHubInstructionModal from './GitHubInstructionModal';
import { useModalStore } from '../hooks/useModalStore';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { mutate: refreshSchedule, isPending } = useRefreshSemesterSchedule();
  const { openModal } = useModalStore();

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
        name="УМКД"
        component={UmkdScreen} // Используем UmkdScreen
        options={{
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📁</Text> // Иконка папки
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
      <Drawer.Screen
        name="Инструменты"
        component={ToolsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🛠️</Text> // иконка инструментов
          )
        }}
      />
      <Drawer.Screen
        name="StudentsGithubListScreen"
        component={StudentsGithubListScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Список студентов",
          headerRight: () => (
            <IconButton
              icon="help-circle"
              size={24}
              onPress={openModal}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;