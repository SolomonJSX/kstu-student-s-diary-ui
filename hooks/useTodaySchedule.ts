// useTodaySchedule.ts
import { useQuery } from "@tanstack/react-query";
import { TODAY_SCHEDULE_URL } from "../constants/hosts";
import { api } from "../utils/axios";
import {ScheduleEntryType} from "../types/scheduleTypes";

export const useTodaySchedule = (studentId: string) => {
  return useQuery({
    queryKey: ["todaySchedule", studentId],
    queryFn: async () => {
      const res = await api.get<ScheduleEntryType[]>(TODAY_SCHEDULE_URL, {
        params: { studentId },
      });
      return res.data
    },
    staleTime: 1000 * 60 * 5, // 1 минута кэша
  });
};
