// hooks/useToggleTaskCompletion.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/axios";
import { StudyTaskDto } from "../types/studyTaskType";

async function toggleTaskCompletion(id: number): Promise<StudyTaskDto> {
  const { data } = await api.patch<StudyTaskDto>(`tasks/${id}/complete`);
  return data;
}

export function useToggleTaskCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTaskCompletion,
    onSuccess: () => {
      // После изменения статуса обновляем список задач
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Ошибка при изменении статуса задачи:", error);
    },
  });
}
