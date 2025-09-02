import React from 'react'
import { View } from 'react-native';
import { Text, useTheme } from "react-native-paper"
import { ScheduleEntryType } from '../types/scheduleTypes';

const DayScheduleComponent = ({ lesson }: {  lesson: ScheduleEntryType }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 14,
      }}
    >
      {/* Время */}
      <View
        style={{
          minWidth: 75,
          backgroundColor: theme.colors.primaryContainer,
          borderRadius: 8,
          paddingVertical: 6,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: theme.colors.onPrimaryContainer,
            fontSize: 14,
          }}
        >
          {lesson.time}
        </Text>
      </View>

      {/* Информация о паре */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 2,
            color: theme.colors.onSurface,
          }}
        >
          {lesson.subject}
        </Text>
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: 2,
          }}
        >
          {lesson.teacher}
        </Text>
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 13,
          }}
        >
          {lesson.auditorium}, {lesson.corpus}
        </Text>
      </View>
    </View>
  )
}

export default DayScheduleComponent;

