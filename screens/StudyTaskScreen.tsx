import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Appbar, Card, Text, Button, FAB, Portal, Modal, TextInput, Divider, IconButton } from 'react-native-paper';
import { StudyTaskDto } from '../types/studyTaskType';
import { useStudyTasks } from '../hooks/useStudyTask';
import { AddTaskModal } from './StudyTaskScreenAddons/AddTaskModal';
import { getData, STUDENT_ID_STORAGE_KEY } from '../utils/storage';
import { useToggleTaskCompletion } from '../hooks/useToggleTaskCompletion';
import { useDeleteStudyTask } from '../hooks/useDeleteStudTask';

const StudyTasksScreen = () => {
  const [studentId, setStudentId] = useState("")

  const { mutate: toggleCompletion } = useToggleTaskCompletion();
  const { mutate: deleteTask } = useDeleteStudyTask();

  useEffect(() => {
    const loadData = async () => {
      const studentId = await getData(STUDENT_ID_STORAGE_KEY)
      setStudentId(studentId!)
    }

    loadData()
  }, [])

  const pageSize = 10;
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, refetch } = useStudyTasks(pageSize, Number(studentId));

  const [addModalVisible, setAddModalVisible] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    subject: '',
    description: '',
    deadline: '',
  });

  // Извлекаем все задачи из всех страниц
  const allTasks = data?.pages.flatMap(page => page.data) || [];

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const renderTaskItem = ({ item }: { item: StudyTaskDto }) => (
    <Card style={styles.taskCard} mode="contained">
      <Card.Content>
        <View style={styles.taskHeader}>
          <Text variant="titleMedium" style={styles.taskSubject}>
            {item.subject}
          </Text>

          <View style={styles.taskActions}>
            <IconButton
              icon={item.isCompleted ? "undo" : "check"}
              size={20}
              iconColor="white"
              style={[
                styles.actionButton,
                item.isCompleted ? styles.actionCompleted : styles.actionPending
              ]}
              onPress={() => toggleCompletion(item.id)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor="white"
              style={[styles.actionButton, styles.actionDelete]}
              onPress={() => deleteTask(item.id)}
            />
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.taskDescription}>
          {item.description}
        </Text>

        {item.deadline && (
          <View style={styles.deadlineContainer}>
            <Text variant="bodySmall" style={styles.deadlineText}>
              📅 Дедлайн: {new Date(item.deadline).toLocaleDateString()}
            </Text>
          </View>
        )}

        <Text variant="bodySmall" style={styles.createdAtText}>
          Создано: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );


  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineMedium" style={styles.errorText}>
          Ошибка загрузки задач
        </Text>
        <Text variant="bodyMedium">{error?.message}</Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Попробовать снова
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Мои задачи" />
      </Appbar.Header>

      <FlatList
        data={allTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                Задач пока нет
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && allTasks.length > 0 ? (
            <View style={styles.loadingContainer}>
              <Text variant="bodyMedium">Загрузка...</Text>
            </View>
          ) : null
        }
      />

      {/* Кнопка добавления задачи */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setAddModalVisible(true)}
      />

      {/* Модальное окно добавления задачи (без функционала) */}
      <Portal>
        <AddTaskModal visible={addModalVisible} studentId={Number(studentId)} onDismiss={() => setAddModalVisible(false)} />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: 'white',
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskSubject: {
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completed: {
    backgroundColor: '#4caf50',
  },
  pending: {
    backgroundColor: '#ff9800',
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
  },
  taskDescription: {
    marginBottom: 8,
    color: '#666',
  },
  deadlineContainer: {
    marginBottom: 4,
  },
  deadlineText: {
    color: '#d32f2f',
    fontWeight: '500',
  },
  createdAtText: {
    color: '#999',
    fontSize: 12,
  },
  separator: {
    height: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  divider: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  actionButton: {
    margin: 0,
    borderRadius: 8,
  },
  actionCompleted: {
    backgroundColor: '#4caf50',
  },
  actionPending: {
    backgroundColor: '#ff9800',
  },
  actionDelete: {
    backgroundColor: '#d32f2f',
  },

});

export default StudyTasksScreen;