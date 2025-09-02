import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/axios";
import { StudyTaskDto } from "../types/studyTaskType";

async function fetchTodayAndTomorrowTasks(studentId: string): Promise<StudyTaskDto[]> {
  const { data } = await api.get<StudyTaskDto[]>(`tasks/today-tomorrow?studentId=${studentId}`);
  return data;
}

export function useTodayAndTomorrowTasks(studentId: string) {
  return useQuery({
    queryKey: ["todayTomorrowTasks", studentId],
    queryFn: () => fetchTodayAndTomorrowTasks(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });
}
