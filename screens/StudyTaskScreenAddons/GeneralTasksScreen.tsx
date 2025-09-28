// screens/TasksScreen.tsx
/**
 * Экран управления задачами с полным CRUD функционалом
 * Создано: [Ваше имя/команда]
 * Дата создания: [Текущая дата]
 * Версия: 1.0
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProfile } from "../../hooks/useProfile";
import { 
  GeneralTask, 
  useTasksByGroup, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask 
} from "../../hooks/useGeneralTasks";
import { STUDENT_ID_STORAGE_KEY } from "../../utils/storage";
import { Ionicons } from "@expo/vector-icons";

// Типы для режимов работы
type ViewMode = 'list' | 'create' | 'edit' | 'view';
type SortOption = 'newest' | 'oldest' | 'title';

const TasksScreen = () => {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<GeneralTask | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Состояния для формы
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  // Загружаем studentId из AsyncStorage
  useEffect(() => {
    const loadStudentId = async () => {
      const id = await AsyncStorage.getItem(STUDENT_ID_STORAGE_KEY);
      if (id) setStudentId(id);
    };
    loadStudentId();
  }, []);

  const { data: profile, isLoading: profileLoading } = useProfile(studentId || "");
  const groupCode = profile?.specialty?.split(" ")[0] || "";

  const { 
    data: tasks, 
    isLoading: tasksLoading, 
    isError, 
    error,
    refetch 
  } = useTasksByGroup(groupCode);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Обработчик обновления данных
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({ title: "", description: "", deadline: "" });
    setSelectedTask(null);
  };

  // Открытие модального окна создания
  const handleOpenCreate = () => {
    resetForm();
    setViewMode('create');
  };

  // Открытие модального окна редактирования
  const handleOpenEdit = (task: GeneralTask) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      deadline: task.deadline || "",
    });
    setViewMode('edit');
  };

  // Открытие модального окна просмотра
  const handleOpenView = (task: GeneralTask) => {
    setSelectedTask(task);
    setViewMode('view');
  };

  // Создание задачи
  const handleCreateTask = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Ошибка", "Заполните название и описание задачи");
      return;
    }
    if (!groupCode) {
      Alert.alert("Ошибка", "Группа студента не найдена");
      return;
    }

    createTask.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline || undefined,
      group: groupCode,
      studentId: parseInt(studentId!) || parseInt(profile?.studentId!),
    }, {
      onSuccess: () => {
        resetForm();
        setViewMode('list');
        Alert.alert("Успех", "Задача успешно создана");
      },
      onError: (error) => {
        Alert.alert("Ошибка", "Не удалось создать задачу");
      }
    });
  };

  // Обновление задачи
  const handleUpdateTask = () => {
    if (!selectedTask) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Ошибка", "Заполните название и описание задачи");
      return;
    }

    updateTask.mutate({
      ...selectedTask,
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline || undefined,
    }, {
      onSuccess: () => {
        resetForm();
        setViewMode('list');
        Alert.alert("Успех", "Задача успешно обновлена");
      },
      onError: (error) => {
        Alert.alert("Ошибка", "Не удалось обновить задачу");
      }
    });
  };

  // Удаление задачи
  const handleDeleteTask = (task: GeneralTask) => {
    Alert.alert(
      "Удаление задачи",
      `Вы уверены, что хотите удалить задачу "${task.title}"?`,
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Удалить", 
          style: "destructive",
          onPress: () => {
            deleteTask.mutate(task.id, {
              onSuccess: () => {
                Alert.alert("Успех", "Задача удалена");
              },
              onError: (error) => {
                Alert.alert("Ошибка", "Не удалось удалить задачу");
              }
            });
          }
        }
      ]
    );
  };

  // Фильтрация и сортировка задач
  const processedTasks = React.useMemo(() => {
    if (!tasks) return [];

    let filteredTasks = tasks;

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Сортировка
    return filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.deadline || b.id).getTime() - new Date(a.deadline || a.id).getTime();
        case 'oldest':
          return new Date(a.deadline || a.id).getTime() - new Date(b.deadline || b.id).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [tasks, searchQuery, sortBy]);

  // Загрузка
  if (profileLoading || tasksLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Загрузка задач...</Text>
      </View>
    );
  }

  // Ошибка
  if (isError) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Ошибка загрузки</Text>
        <Text style={styles.errorSubtext}>{(error as Error).message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Рендер элемента списка
  const renderTaskItem = ({ item }: { item: GeneralTask }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity 
        style={styles.taskContent}
        onPress={() => handleOpenView(item)}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.taskActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleOpenEdit(item)}
            >
              <Ionicons name="create-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteTask(item)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        {item.deadline && (
          <View style={styles.deadlineContainer}>
            <Ionicons name="calendar-outline" size={16} color="#EF4444" />
            <Text style={styles.deadlineText}>
              {new Date(item.deadline).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Заголовок и управление */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Задачи группы</Text>
          <Text style={styles.headerSubtitle}>{groupCode}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Панель поиска и сортировки */}
      <View style={styles.controlPanel}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Поиск задач..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Сортировка:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sortButtons}>
              {(['newest', 'oldest', 'title'] as SortOption[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortButton,
                    sortBy === option && styles.sortButtonActive
                  ]}
                  onPress={() => setSortBy(option)}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === option && styles.sortButtonTextActive
                  ]}>
                    {option === 'newest' && 'Новые'}
                    {option === 'oldest' && 'Старые'}
                    {option === 'title' && 'По названию'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Список задач */}
      <FlatList
        data={processedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#6366F1"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>Задачи не найдены</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? "Попробуйте изменить поисковый запрос" : "Создайте первую задачу"}
            </Text>
          </View>
        }
      />

      {/* Модальное окно создания/редактирования */}
      <Modal
        visible={viewMode === 'create' || viewMode === 'edit'}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {viewMode === 'create' ? 'Новая задача' : 'Редактирование'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                resetForm();
                setViewMode('list');
              }}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Название задачи *</Text>
            <TextInput
              placeholder="Введите название задачи"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              style={styles.input}
              maxLength={100}
            />

            <Text style={styles.label}>Описание задачи *</Text>
            <TextInput
              placeholder="Опишите детали задачи"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.label}>Дедлайн (необязательно)</Text>
            <TextInput
              placeholder="ГГГГ-ММ-ДД"
              value={formData.deadline}
              onChangeText={(text) => setFormData(prev => ({ ...prev, deadline: text }))}
              style={styles.input}
            />
            <Text style={styles.hint}>Формат: 2024-12-31</Text>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => {
                  resetForm();
                  setViewMode('list');
                }}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.formButton, styles.submitButton]}
                onPress={viewMode === 'create' ? handleCreateTask : handleUpdateTask}
                disabled={createTask.isPending || updateTask.isPending}
              >
                {(createTask.isPending || updateTask.isPending) ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {viewMode === 'create' ? 'Создать' : 'Сохранить'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Модальное окно просмотра */}
      <Modal
        visible={viewMode === 'view'}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Просмотр задачи</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {selectedTask && (
            <ScrollView style={styles.viewContent}>
              <Text style={styles.viewTitle}>{selectedTask.title}</Text>
              
              <Text style={styles.viewLabel}>Описание</Text>
              <Text style={styles.viewDescription}>{selectedTask.description}</Text>
              
              {selectedTask.deadline && (
                <>
                  <Text style={styles.viewLabel}>Дедлайн</Text>
                  <View style={styles.deadlineBadge}>
                    <Ionicons name="calendar-outline" size={16} color="#EF4444" />
                    <Text style={styles.deadlineBadgeText}>
                      {new Date(selectedTask.deadline).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.viewActions}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.editButton]}
                  onPress={() => handleOpenEdit(selectedTask)}
                >
                  <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Редактировать</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.formButton, styles.deleteButton]}
                  onPress={() => handleDeleteTask(selectedTask)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default TasksScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC",
    paddingTop: 60,
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#6366F1",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Control Panel
  controlPanel: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: "row",
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: "#6366F1",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
  },

  // Task List
  listContent: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  taskContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 12,
  },
  taskActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  deadlineText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 6,
    fontWeight: "500",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },

  // Form
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: -8,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#6366F1",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  // View Mode
  viewContent: {
    padding: 20,
  },
  viewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
  },
  viewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  viewDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 24,
  },
  deadlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  deadlineBadgeText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
    marginLeft: 6,
  },
  viewActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  editButton: {
    backgroundColor: "#6366F1",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});