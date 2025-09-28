// hooks/useGeneralTasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/axios";

export interface GeneralTask {
  id: number;
  title: string;
  description: string;
  deadline?: string;
  group: string;
  studentId: number;
}

// ------------------------
// GET: Все задачи
// ------------------------
// hooks/useGeneralTasks.ts
export const useTasksByGroup = (groupCode: string) => {
  return useQuery<GeneralTask[], Error>({
    queryKey: ["tasks", groupCode], // ключ запроса с группой
    queryFn: async () => {
      const response = await api.get<GeneralTask[]>("/generalTasks", { params: { group: groupCode } });
      return response.data;
    },
    enabled: !!groupCode, // не запускаем запрос, если groupCode пустой
  });
};


// ------------------------
// GET: Одна задача по id
// ------------------------
export const useTask = (id: number) => {
  return useQuery<GeneralTask, Error>({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await api.get(`/generalTasks/${id}`);
      return response.data as GeneralTask;
    },
    enabled: !!id, // не запускаем запрос, если id нет
  });
};

// ------------------------
// POST: Создание задачи
// ------------------------
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: Omit<GeneralTask, "id">) => {
      const response = await api.post("/generalTasks", newTask);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

// ------------------------
// PUT: Обновление задачи
// ------------------------
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: GeneralTask) => {
      await api.put(`/generalTasks/${task.id}`, task);
      return task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
    },
  });
};

// ------------------------
// DELETE: Удаление задачи
// ------------------------
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/generalTasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
