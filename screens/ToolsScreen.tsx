// screens/ToolsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../hooks/useProfile";
import { getData, STUDENT_ID_STORAGE_KEY } from "../utils/storage";

type ToolItem = {
  id: string;
  title: string;
  description: string;
  screen?: string;
  allowedSpecialty?: string; // ✅ новое поле
};

const allTools: ToolItem[] = [
  {
    id: "1",
    title: "Создание GitHub ветки",
    description: "Каждый студент может создать ветку с ФИО в общем репозитории.",
    screen: "StudentsGithubListScreen",
    allowedSpecialty: "6B06104", // ✅ доступно только для этой спец.
  },
  // потом можно добавить ещё инструменты
];

export default function ToolsScreen() {
  const navigation = useNavigation<any>();
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const id = await getData(STUDENT_ID_STORAGE_KEY);
      if (id) setStudentId(id);
    };
    load();
  }, []);

  const { data: profile, isLoading } = useProfile(studentId || "");

  // ✅ фильтруем по specialty
  const filteredTools = allTools.filter((tool) => {
    if (!tool.allowedSpecialty) return true;
    return profile?.specialty?.includes(tool.allowedSpecialty);
  });

  const renderItem = ({ item }: { item: ToolItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => item.screen && navigation.navigate(item.screen)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Загрузка профиля...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTools}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Нет доступных инструментов для вашей специальности
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  desc: { fontSize: 14, color: "#666" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
});
