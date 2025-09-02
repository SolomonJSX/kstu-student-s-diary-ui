import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Card, ActivityIndicator, Text } from "react-native-paper";
import { useSemesterSchedule } from "../../hooks/useSemesterSchedule";
import { weekTypeEnum } from "../../types/scheduleTypes";
import { getData, STUDENT_ID_STORAGE_KEY } from "../../utils/storage";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import ScheduleCard from "../../components/ScheduleCard";
import { isTodayEvenWeek } from "../../utils/scheduleOptions";
import { useFocusEffect } from "@react-navigation/native";

dayjs.locale("ru");

const fullDayNames: Record<string, string> = {
  ПН: "Понедельник",
  ВТ: "Вторник",
  СР: "Среда",
  ЧТ: "Четверг",
  ПТ: "Пятница",
  СБ: "Суббота",
  ВС: "Воскресенье",
};

export const WeeklyScheduleScreen = ({ weekType }: { weekType: weekTypeEnum }) => {
  const [studentId, setStudentId] = useState("");
  const { data, isLoading } = useSemesterSchedule(studentId);
  const [today, setToday] = useState(dayjs)
  const lastDay = useRef(today.date())

  useFocusEffect(() => {
    const now = dayjs()
    if (lastDay.current !== now.date()) {
      lastDay.current = now.date()
      setToday(now) // обновляем
    }
  })

  // Определяем сегодняшний день
  const todayShort = today.format("dd").toUpperCase(); // ПН, ВТ и т.д.

  useEffect(() => {
    const loadData = async () => {
      const storedId = await getData(STUDENT_ID_STORAGE_KEY);
      if (storedId) setStudentId(storedId);
    };
    loadData();
  }, []);
  const currentWeekIsEven = isTodayEvenWeek();

  const shouldHighlightToday = (day: string) => {
    const isToday = day.toUpperCase() === todayShort;
    
    // Для числителя: текущая неделя нечетная (1) или оба типа (0)
    // Для знаменателя: текущая неделя четная (2) или оба типа (0)
    const isCorrectWeekType = 
      (weekType === weekTypeEnum.numerator && !currentWeekIsEven) ||
      (weekType === weekTypeEnum.denominator && currentWeekIsEven);
    
    return isToday && isCorrectWeekType;
  };

  useEffect(() => {
    const loadData = async () => {
      const storedId = await getData(STUDENT_ID_STORAGE_KEY);
      if (storedId) setStudentId(storedId);
    };
    loadData();
  }, []);

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  if (!data) {
    return <Text style={{ textAlign: "center", marginTop: 20 }}>Нет данных</Text>;
  }

  return (
    <ScrollView style={{ padding: 10 }}>
      {Object.entries(data).map(([day, lessons], idx) => {
        const isTodayHighlighted = shouldHighlightToday(day);

        return (
          <ScheduleCard day={day} fullDayNames={fullDayNames} lessons={lessons.filter(item => item.weekType === weekType || item.weekType === weekTypeEnum.both)} isToday={isTodayHighlighted} key={idx} />
        );
      })}
    </ScrollView>
  );
};
