// useTodaySchedule.ts
import { useQuery } from "@tanstack/react-query";
import { TODAY_SCHEDULE_URL } from "../constants/hosts";
import { api } from "../utils/axios";
import {ScheduleEntryType} from "../types/scheduleTypes";
import dayjs from "dayjs";

export const useTodaySchedule = (studentId: string) => {
  const today = dayjs().format('YYYY-MM-DD');

  return useQuery({
    queryKey: ["todaySchedule", studentId],
    queryFn: async () => {
      const res = await api.get<ScheduleEntryType[]>(TODAY_SCHEDULE_URL, { params: { studentId, date: today } });
      return res.data
    },
    staleTime: 1000 * 60 * 5, // 1 минута кэша
  });
};
