import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, ActivityIndicator, useTheme } from 'react-native-paper';
import { useProfile } from '../hooks/useProfile';
import { useTodaySchedule } from '../hooks/useTodaySchedule';
import { useTodayAndTomorrowTasks } from '../hooks/useTodayAndTomorrowTasks';
import { getData, STUDENT_ID_STORAGE_KEY } from '../utils/storage';
import dayjs from 'dayjs';
import ScheduleCard from '../components/ScheduleCard';
import { useFocusEffect } from '@react-navigation/native';

const fullDayNames: Record<string, string> = {
  ПН: "Понедельник",
  ВТ: "Вторник",
  СР: "Среда",
  ЧТ: "Четверг",
  ПТ: "Пятница",
  СБ: "Суббота",
  ВС: "Воскресенье",
};

const HomeScreen = () => {
  const [studentId, setStudentId] = useState("");
  const theme = useTheme();
  
  const { data: profile, isLoading: profileLoading } = useProfile(studentId);
  const { data: scheduleEntry, isLoading: scheduleLoading } = useTodaySchedule(studentId);
  const { data: tasks, isLoading: tasksLoading } = useTodayAndTomorrowTasks(studentId);

  useEffect(() => {
    const loadData = async () => {
      const storedStudentId = await getData(STUDENT_ID_STORAGE_KEY);
      setStudentId(storedStudentId!);
    }
    loadData();
  }, []);
  
  const isLoading = profileLoading || scheduleLoading || tasksLoading;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const todayTasks = tasks?.filter(task => 
    task.deadline && dayjs(task.deadline).isSame(dayjs(), 'day')
  ) || [];

  const tomorrowTasks = tasks?.filter(task =>
    task.deadline && dayjs(task.deadline).isSame(dayjs().add(1, 'day'), 'day')
  ) || [];

  const greeting = getGreeting();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Приветствие */}
      <Card style={styles.greetingCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.greetingText}>
            {greeting}, {profile?.fullName || 'Студент'}!
          </Text>
          {profile?.group && (
            <Text variant="bodyMedium" style={styles.groupText}>
              Группа: {profile.group}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Сегодняшнее расписание */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📅 Расписание на сегодня
          </Text>
          <Divider style={styles.divider} />
          
          {!scheduleEntry || scheduleEntry.length === 0 ? (
            <Text style={styles.noDataText}>Сегодня пар нет 🎉</Text>
          ) : (
            <ScheduleCard 
              day={scheduleEntry[0].day} 
              fullDayNames={fullDayNames} 
              lessons={scheduleEntry} 
            />
          )}
        </Card.Content>
      </Card>

      {/* Задачи на сегодня */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📋 Задачи на сегодня
          </Text>
          <Divider style={styles.divider} />
          
          {todayTasks.length === 0 ? (
            <Text style={styles.noDataText}>На сегодня задач нет 👍</Text>
          ) : (
            todayTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </Card.Content>
      </Card>

      {/* Задачи на завтра */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📆 Задачи на завтра
          </Text>
          <Divider style={styles.divider} />
          
          {tomorrowTasks.length === 0 ? (
            <Text style={styles.noDataText}>На завтра задач пока нет</Text>
          ) : (
            tomorrowTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const TaskItem = ({ task }: { task: any }) => (
  <View style={styles.taskItem}>
    <View style={styles.taskHeader}>
      <Text variant="titleMedium" style={styles.taskSubject}>
        {task.subject}
      </Text>
      <View style={[styles.statusBadge, task.isCompleted ? styles.completed : styles.pending]}>
        <Text variant="labelSmall" style={styles.statusText}>
          {task.isCompleted ? '✓' : '⏳'}
        </Text>
      </View>
    </View>
    <Text variant="bodyMedium" style={styles.taskDescription}>
      {task.description}
    </Text>
    {task.deadline && (
      <Text variant="bodySmall" style={styles.deadlineText}>
        📅 {dayjs(task.deadline).format('DD.MM.YYYY HH:mm')}
      </Text>
    )}
  </View>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Доброе утро';
  if (hour >= 12 && hour < 18) return 'Добрый день';
  if (hour >= 18 && hour < 23) return 'Добрый вечер';
  return 'Доброй ночи';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingCard: {
    backgroundColor: '#6200ee',
  },
  greetingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskSubject: {
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  completed: {
    backgroundColor: '#4caf50',
  },
  pending: {
    backgroundColor: '#ff9800',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#555',
    marginBottom: 4,
  },
  deadlineText: {
    color: '#d32f2f',
    fontWeight: '500',
  },
});

export default HomeScreen;