// hooks/useTaskAttachments.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/axios";
import {
    TaskAttachment,
    UploadAttachmentResponse,
    UploadMultipleAttachmentsResponse,
} from "../types/studyTaskType";

// -------------------------
// API методы
// -------------------------
export const taskAttachmentApi = {
    // Загрузка одного файла
    uploadAttachment: async (
        taskId: number,
        file: File
    ): Promise<UploadAttachmentResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await api.post<UploadAttachmentResponse>(
            `/tasks/${taskId}/attachments`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        return data;
    },

    // Загрузка нескольких файлов
    uploadMultipleAttachmentsDirect: async (taskId: number, formData: FormData): Promise<any> => {
        const { data } = await api.post(`/tasks/${taskId}/attachments/multiple`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true, // это аналог credentials: 'include' для axios
        });
        return data;
    },

    // Получение вложений задачи
    getTaskAttachments: async (taskId: number): Promise<TaskAttachment[]> => {
        const { data } = await api.get<TaskAttachment[]>(`/tasks/${taskId}/attachments`);
        return data;
    },

    // Скачивание файла
    downloadAttachment: async (attachmentId: number): Promise<Blob> => {
        const { data } = await api.get<Blob>(`/tasks/attachments/${attachmentId}/download`, {
            responseType: "blob",
        });
        return data;
    },

    // Удаление файла
    deleteAttachment: async (attachmentId: number): Promise<{ message: string }> => {
        const { data } = await api.delete<{ message: string }>(
            `/tasks/attachments/${attachmentId}`
        );
        return data;
    },
};

// -------------------------
// Хуки React Query
// -------------------------

// Получение всех файлов задачи
export const useTaskAttachments = (taskId: number) => {
    return useQuery({
        queryKey: ["task-attachments", taskId],
        queryFn: () => taskAttachmentApi.getTaskAttachments(taskId),
        enabled: !!taskId,
    });
};

// Загрузка одного файла
export const useUploadAttachment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, file }: { taskId: number; file: File }) =>
            taskAttachmentApi.uploadAttachment(taskId, file),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["task-attachments", variables.taskId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
        },
    });
};

// Загрузка нескольких файлов
export const useUploadMultipleAttachments = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, files }: { taskId: number; files: File[] }) => {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append("files", file);
            });
            return taskAttachmentApi.uploadMultipleAttachmentsDirect(taskId, formData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["task-attachments", variables.taskId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
        },
    });
};

// Удаление файла
export const useDeleteAttachment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: taskAttachmentApi.deleteAttachment,
        onSuccess: () => {
            // Если taskId неизвестен, инвалидируем все attachments
            queryClient.invalidateQueries({ queryKey: ["task-attachments"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};

// Скачивание файла (без кэширования)
export const useDownloadAttachment = () => {
    return useMutation({
        mutationFn: taskAttachmentApi.downloadAttachment,
    });
};
