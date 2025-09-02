// hooks/useCreateStudyTask.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StudyTask, StudyTaskCreateDto } from "../types/studyTaskType";
import { api } from "../utils/axios";

async function createStudyTask(task: StudyTaskCreateDto): Promise<StudyTask> {
  const { data } = await api.post<StudyTask>("tasks", task);
  console.log("Created task:", data);
  return data;
}

export function useCreateStudyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudyTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error creating task:", error);
    },
  });
}