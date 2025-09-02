import { View, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";

const GradesScreen = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        📊 Оценки
      </Text>
      <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        Раздел в разработке
      </Text>
      <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        Скоро здесь появятся ваши оценки и успеваемость
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default GradesScreen