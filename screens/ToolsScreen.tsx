// screens/ToolsScreen.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

type ToolItem = {
  id: string;
  title: string;
  description: string;
  screen?: string; // экран, куда переходить
};

const tools: ToolItem[] = [
  {
    id: "1",
    title: "Создание GitHub ветки",
    description: "Каждый студент может создать ветку с ФИО в общем репозитории.",
    screen: "StudentsGithubListScreen",
  }
];

export default function ToolsScreen() {
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: ToolItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => item.screen && navigation.navigate(item.screen)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tools}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
});
