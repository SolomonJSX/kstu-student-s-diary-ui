import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCertification } from "../../../hooks/useCertification";
import { useRefreshCertification } from "../../../hooks/useRefreshCertification";
import { SubjectGrade } from "../../../types/gradesType";

export const CertificationScreen = () => {
  const { data, isLoading, error, refetch } = useCertification();
  const refreshMutation = useRefreshCertification();

  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (refreshMutation.isPending) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [refreshMutation.isPending]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "#10b981"; // A - green
    if (grade >= 80) return "#3b82f6"; // B - blue
    if (grade >= 70) return "#f59e0b"; // C - amber
    if (grade >= 60) return "#f97316"; // D - orange
    return "#ef4444"; // F - red
  };

  const calculateOverallGPA = () => {
    if (!data || data.length === 0) return 0;
    const totalGPA = data.reduce((sum, item) => sum + item.gpa, 0);
    return (totalGPA / data.length).toFixed(2);
  };

  const getLetterGradeColor = (letter: string) => {
    switch (letter.toUpperCase()) {
      case 'A': return "#10b981";
      case 'B': return "#3b82f6";
      case 'C': return "#f59e0b";
      case 'D': return "#f97316";
      case 'F': return "#ef4444";
      default: return "#6b7280";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="school" size={80} color="#3b82f6" />
        </Animated.View>
        <Text style={styles.loadingTitle}>Загружаем аттестацию</Text>
        <Text style={styles.loadingSubtitle}>Это может занять несколько секунд</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={80} color="#ef4444" />
        <Text style={styles.errorTitle}>Ошибка загрузки</Text>
        <Text style={styles.errorSubtitle}>Проверьте подключение к интернету</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: SubjectGrade; index: number }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: 1,
          transform: [{ translateY: 0 }]
        }
      ]}
    >
      {/* Заголовок дисциплины */}
      <View style={styles.cardHeader}>
        <Text style={styles.subject} numberOfLines={2}>{item.discipline}</Text>
        <View style={styles.creditsBadge}>
          <Ionicons name="bookmark-outline" size={14} color="#6b7280" />
          <Text style={styles.creditsText}>{item.credits} кр.</Text>
        </View>
      </View>

      {/* Оценки */}
      <View style={styles.gradesContainer}>
        <View style={styles.gradeItem}>
          <Text style={styles.gradeLabel}>РК1</Text>
          <Text style={[styles.gradeValue, { color: getGradeColor(item.rK1) }]}>
            {item.rK1}
          </Text>
        </View>

        <View style={styles.gradeItem}>
          <Text style={styles.gradeLabel}>РК2</Text>
          <Text style={[styles.gradeValue, { color: getGradeColor(item.rK2) }]}>
            {item.rK2}
          </Text>
        </View>

        <View style={styles.gradeItem}>
          <Text style={styles.gradeLabel}>ПА</Text>
          <Text style={[styles.gradeValue, { color: getGradeColor(item.pa) }]}>
            {item.pa}
          </Text>
        </View>

        <View style={styles.gradeItem}>
          <Text style={styles.gradeLabel}>Сумма</Text>
          <Text style={[styles.gradeValue, { color: getGradeColor(item.sum) }]}>
            {item.sum}
          </Text>
        </View>
      </View>

      {/* Итоговая оценка */}
      <View style={styles.finalGradeContainer}>
        <View style={styles.gpaContainer}>
          <Text style={styles.gpaLabel}>GPA</Text>
          <Text style={styles.gpaValue}>{item.gpa.toFixed(2)}</Text>
        </View>

        <View style={[
          styles.letterGradeBadge,
          { backgroundColor: getLetterGradeColor(item.letterGrade) + '20' }
        ]}>
          <Text style={[
            styles.letterGrade,
            { color: getLetterGradeColor(item.letterGrade) }
          ]}>
            {item.letterGrade}
          </Text>
        </View>

        <Text style={styles.meaning} numberOfLines={1}>{item.meaning}</Text>
      </View>
    </Animated.View>
  );

  const overallGPA = calculateOverallGPA();

  return (
    <View style={styles.container}>
      {/* Хедер с общей статистикой */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Академическая аттестация</Text>
            <Text style={styles.subtitle}>{data?.length || 0} дисциплин</Text>
          </View>

          <View style={styles.overallGPA}>
            <Text style={styles.overallGPALabel}>Общий GPA</Text>
            <Text style={styles.overallGPAValue}>{overallGPA}</Text>
          </View>
        </View>


        {/* Кнопка обновления */}
        <TouchableOpacity
          style={[
            styles.refreshBtn,
            (refreshMutation.isPending || isLoading) && styles.refreshDisabled
          ]}
          onPress={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending || isLoading}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons
              name="refresh"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
          </Animated.View>
          <Text style={styles.refreshText}>
            {refreshMutation.isPending ? "Обновляем..." : "Обновить"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Список дисциплин */}
      <FlatList
        data={data || []}
        keyExtractor={(item, idx) => `${item.discipline}-${idx}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end", // вместо center → текст и GPA на одной линии снизу
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  overallGPA: {
    alignItems: "flex-end",
  },
  overallGPALabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  overallGPAValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3b82f6",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  refreshDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0.1,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  subject: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  creditsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 4,
  },
  gradesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
  },
  gradeItem: {
    alignItems: "center",
  },
  gradeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  gradeValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  finalGradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  gpaContainer: {
    alignItems: "center",
  },
  gpaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  gpaValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2937",
  },
  letterGradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  letterGrade: {
    fontSize: 16,
    fontWeight: "800",
  },
  meaning: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f8fafc",
  },
  loadingTitle: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
  },
  errorTitle: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: "700",
    color: "#ef4444",
    textAlign: "center",
  },
  errorSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
});