import React, { useEffect, useState } from "react";
import {
  Searchbar,
  ActivityIndicator,
  Card,
  Text,
  Button,
  Modal,
  Portal,
} from "react-native-paper";
import { StyleSheet, View, FlatList } from "react-native";
import { getData, STUDENT_ID_STORAGE_KEY } from "../../utils/storage";
import { useSubjectsList } from "../../hooks/useSubjectsList";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TeacherFilesList } from "./TeacherFilesList";

const getSubjectIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("матем")) return { icon: "calculator-variant", color: "#1976d2" };
  if (lower.includes("физ")) return { icon: "atom-variant", color: "#ef6c00" };
  if (lower.includes("информ")) return { icon: "laptop", color: "#2e7d32" };
  if (lower.includes("эконом")) return { icon: "chart-line", color: "#6a1b9a" };
  if (lower.includes("истор")) return { icon: "book-open-page-variant", color: "#8d6e63" };
  return { icon: "folder", color: "#0288d1" }; // дефолт
};

const UmkdSubjectLists = () => {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredSubjects = subjects?.filter((subject) =>
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
        <MaterialCommunityIcons name="book-off-outline" size={48} color="#999" />
        <Text variant="bodyMedium" style={styles.emptyText}>
          Нет доступных предметов
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>
        📚 Ваши предметы
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
        renderItem={({ item }) => {
          const { icon, color } = getSubjectIcon(item.subject);
          return (
            <Card
              style={styles.subjectCard}
              mode="elevated"
              onPress={() => handleSubjectPress(item.id)}
            >
              <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons
                  name={icon}
                  size={26}
                  color={color}
                  style={styles.cardIcon}
                />
                <Text variant="titleMedium" style={styles.subjectName}>
                  {item.subject}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#bbb"
                />
              </Card.Content>
            </Card>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <MaterialCommunityIcons name="magnify-close" size={36} color="#999" />
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
            <TeacherFilesList studentId={studentId!} subjectId={selectedSubjectId} />
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
    backgroundColor: "#f4f6f8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    marginBottom: 16,
    fontWeight: "700",
    color: "#212121",
  },
  searchBar: {
    marginBottom: 14,
    elevation: 3,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  subjectCard: {
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  cardIcon: {
    marginRight: 14,
  },
  subjectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyList: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    color: "#d32f2f",
    marginVertical: 10,
  },
  emptyText: {
    color: "#666",
    marginTop: 10,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    flex: 1,
  },
});

export default UmkdSubjectLists;
