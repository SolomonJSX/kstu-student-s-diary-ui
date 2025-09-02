import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/axios";

async function deleteStudyTask(id: number): Promise<void> {
  await api.delete(`tasks/${id}`);
}

export function useDeleteStudyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudyTask,
    onSuccess: () => {
      // обновляем кэш списка задач после удаления
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Ошибка при удалении задачи:", error);
    },
  });
}
