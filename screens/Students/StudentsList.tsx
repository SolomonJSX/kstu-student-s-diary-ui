// components/StudentsList.tsx
import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useStudents } from "../../hooks/useGithubStudents";
import { api } from "../../utils/axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function StudentsList() {
  const { data, isLoading, error, refetch } = useStudents();
  const navigation = useNavigation<any>();

  // Каждый раз при открытии экрана заново загружаем список
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCreateBranch = async (studentId: number, fullName?: string) => {
    try {
      await api.post("/github/create-branch", { studentId, fullName });
      await refetch(); // обновляем список после успешного создания
    } catch (e: any) {
      console.error("Ошибка при создании ветки", e);
    }
  };

  if (isLoading) return <Text>Загрузка...</Text>;
  if (error) return <Text>Ошибка загрузки студентов</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* Кнопка Назад */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>⬅ Назад</Text>
      </TouchableOpacity>

      <FlatList
        data={data}
        keyExtractor={(item) => item.studentId.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.fullName ?? item.username}</Text>
              <Text>
                {item.gitHubBranchCreated ? "✅ Ветка создана" : "❌ Ветка не создана"}
              </Text>
            </View>

            {item.isCurrentUser && !item.gitHubBranchCreated && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleCreateBranch(item.studentId, item.fullName)}
              >
                <Text style={styles.buttonText}>Создать</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  backButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButtonText: {
    fontSize: 16,
  },
});
