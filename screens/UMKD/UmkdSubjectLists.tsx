import React, { useEffect, useState } from 'react';
import { Searchbar, ActivityIndicator, Card, Text, Button, Modal, Portal } from 'react-native-paper';
import { StyleSheet, View, FlatList } from 'react-native';
import { getData, STUDENT_ID_STORAGE_KEY } from '../../utils/storage';
import { useSubjectsList } from '../../hooks/useSubjectsList';
import { useTeacherFiles } from '../../hooks/useTeacherFiles'; // Новый хук
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TeacherFilesList } from './TeacherFilesList';

const UmkdSubjectLists = () => {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const { data: subjects, isLoading, error } = useSubjectsList(studentId!);

  useEffect(() => {
    const loadStudentId = async () => {
      const id = await getData(STUDENT_ID_STORAGE_KEY);
      if (id) setStudentId(id);
    };
    loadStudentId();
  }, []);

  const filteredSubjects = subjects?.filter(
    (subject) =>
      subject.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubjectPress = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Загрузка предметов...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color="#d32f2f"
        />
        <Text variant="bodyMedium" style={styles.errorText}>
          Не удалось загрузить список предметов.
        </Text>
        <Button onPress={() => setStudentId(studentId)}>Повторить попытку</Button>
      </View>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="book-off-outline"
          size={48}
          color="#999"
        />
        <Text variant="bodyMedium" style={styles.emptyText}>
          Нет доступных предметов
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>
        Ваши предметы
      </Text>
      <Searchbar
        placeholder="Поиск по названию..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        icon="magnify"
        inputStyle={styles.searchInput}
      />
      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.subjectCard}
            mode="elevated"
            onPress={() => handleSubjectPress(item.id)}
          >
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons
                name="folder-star-outline"
                size={24}
                color="#6200ee"
                style={styles.cardIcon}
              />
              <Text variant="titleMedium" style={styles.subjectName}>
                {item.subject}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#999"
              />
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={36}
              color="#999"
            />
            <Text variant="bodyMedium">Ничего не найдено</Text>
          </View>
        }
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedSubjectId && (
            <TeacherFilesList
              studentId={studentId!}
              subjectId={selectedSubjectId}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#333',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  subjectCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardIcon: {
    marginRight: 12,
  },
  subjectName: {
    flex: 1,
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyList: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    marginVertical: 10,
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    flex: 1,
  },
});

export default UmkdSubjectLists;
