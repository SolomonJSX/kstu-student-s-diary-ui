import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { useGrades } from "../../../hooks/useGrades";
import { GradeInfo } from "../../../types/gradesType";
import { Ionicons } from "@expo/vector-icons";

// Включение анимации для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const GradesScreen = () => {
  const { data, isLoading, error } = useGrades();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (subjectName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === subjectName ? null : subjectName);
  };

  const getGradeColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 85) return "#10b981"; // green
    if (percentage >= 70) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const calculateAverage = (item: GradeInfo) => {
    const allGrades = item.classes.flatMap(cls =>
      cls.grades.filter(g => g.date !== "0001-01-01T00:00:00" && g.total > 0)
    );

    if (allGrades.length === 0) return null;

    const total = allGrades.reduce((sum, grade) => sum + (grade.score / 200), 0);
    return ((total / allGrades.length) * 100).toFixed(1);
  };


  if (isLoading) {
    return (
      <View style={styles.center}>
        <Ionicons name="school-outline" size={64} color="#6b7280" />
        <Text style={styles.loadingText}>Загружаем оценки...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Ошибка загрузки</Text>
        <Text style={styles.errorSubtext}>Попробуйте позже</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: GradeInfo }) => {
    const isExpanded = expanded === item.subjectName;
    const average = calculateAverage(item);

    return (
      <Animated.View style={[styles.card, isExpanded && styles.cardExpanded]}>
        <TouchableOpacity
          onPress={() => toggleExpand(item.subjectName)}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subject} numberOfLines={1}>
                {item.subjectName}
              </Text>
              <View style={styles.scoresContainer}>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>РК1: {item.rK1}</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>РК2: {item.rK2}</Text>
                </View>
                {average && (
                  <View style={[styles.scoreBadge, styles.averageBadge]}>
                    <Text style={styles.averageText}>Ср: {average}%</Text>
                  </View>
                )}
              </View>
            </View>

            <Animated.View style={{
              transform: [{ rotate: isExpanded ? '180deg' : '0deg' }]
            }}>
              <Ionicons
                name="chevron-down"
                size={24}
                color="#6b7280"
              />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View style={styles.details}>
            <View style={styles.periodContainer}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.period}>Период: {item.period}</Text>
            </View>

            {item.classes.map((cls, idx) => (
              <View key={idx} style={styles.classBlock}>
                <View style={styles.classHeader}>
                  <Text style={styles.classTitle}>{cls.type}</Text>
                  <Text style={styles.teacher}>{cls.teacher}</Text>
                </View>

                {cls.hasData ? (
                  <View style={styles.gradesList}>
                    {cls.grades
                      .filter((g) => g.date !== "0001-01-01T00:00:00")
                      .map((g, gIdx) => (
                        <View key={gIdx} style={styles.gradeItem}>
                          <Text style={styles.gradeDate}>
                            {g.date ? new Date(g.date).toLocaleDateString('ru-RU') : "-"}
                          </Text>
                          <View style={styles.gradeScore}>
                            <Text style={[
                              styles.gradeValue,
                              { color: getGradeColor(g.score, g.total) }
                            ]}>
                              {g.score}/{g.total}
                            </Text>
                            <Text style={styles.gradePercentage}>
                              (
                              {g.total > 0
                                ? ((g.score / g.total) * 100).toFixed(0) + "%"
                                : "—"}
                              )
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Ionicons name="document-text-outline" size={20} color="#9ca3af" />
                    <Text style={styles.noData}>Нет данных</Text>
                  </View>
                )}
              </View>
            ))}
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={data || []}
      keyExtractor={(item) => item.subjectName}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardExpanded: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectInfo: {
    flex: 1,
    marginRight: 12,
  },
  subject: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  scoresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  scoreBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  averageBadge: {
    backgroundColor: "#eff6ff",
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  averageText: {
    color: "#3b82f6",
    fontWeight: "700",
  },
  details: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  period: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
  },
  classBlock: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 12,
  },
  classHeader: {
    marginBottom: 8,
  },
  classTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: "#374151",
  },
  teacher: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  gradesList: {
    gap: 6,
  },
  gradeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  gradeDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  gradeScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  gradePercentage: {
    fontSize: 12,
    color: "#9ca3af",
  },
  noDataContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  noData: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: "#ef4444",
    fontWeight: "600",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
});