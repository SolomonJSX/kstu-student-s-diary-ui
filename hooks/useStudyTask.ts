import { useInfiniteQuery } from "@tanstack/react-query";
import { StudyTaskPagedResult } from "../types/studyTaskType";
import { api } from "../utils/axios";

async function fetchTasksPage(
  page: number,
  pageSize: number,
  studentId?: number
): Promise<StudyTaskPagedResult> {
  const { data } = await api.get<StudyTaskPagedResult>("tasks/page", {
    params: { page, pageSize, studentId }
  });
  return data;
}

export function useStudyTasks(pageSize: number, studentId?: number) {
  return useInfiniteQuery({
    queryKey: ["tasks", studentId, pageSize],
    queryFn: ({ pageParam }: { pageParam: number }) => 
      fetchTasksPage(pageParam, pageSize, studentId),
    initialPageParam: 1,
    getNextPageParam: (lastPage: StudyTaskPagedResult) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}