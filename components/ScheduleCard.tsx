import React from 'react'
import { Card, Divider, Text, useTheme } from "react-native-paper"
import { ScheduleEntryType } from '../types/scheduleTypes';
import DayScheduleComponent from './DayScheduleComponent';

const ScheduleCard = ({ isToday, fullDayNames, day, lessons }: {  isToday?: boolean, fullDayNames: Record<string, string>, day: string, lessons: ScheduleEntryType[] }) => {
  const theme = useTheme();

  return (
    <Card
            style={{
              marginBottom: 20,
              borderRadius: 14,
              borderWidth: isToday ? 2 : 0,
              borderColor: isToday ? theme.colors.primary : "transparent",
              backgroundColor: isToday ? theme.colors.primaryContainer : theme.colors.surface,
            }}
          >
            <Card.Content>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 12,
                  color: isToday ? theme.colors.onPrimaryContainer : theme.colors.onSurface
                }}
              >
                {fullDayNames[day.toUpperCase()] || day}
              </Text>

              <Divider style={{ marginBottom: 12 }} />

              {lessons.length === 0 ? (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Нет пар</Text>
              ) : (
                lessons.map((lesson, idx) => (
                  <DayScheduleComponent lesson={lesson} key={idx} />
                ))
              )}
            </Card.Content>
          </Card>
  )
}

export default ScheduleCard;