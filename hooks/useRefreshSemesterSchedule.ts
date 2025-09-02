// hooks/useRefreshSemesterSchedule.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/axios";
import { ScheduleResponse, ScheduleEntryType } from "../types/scheduleTypes";
import { REFRESH_SCHEDULE_URL } from "../constants/hosts";

// Типы
export type SessionRequest = {
    studentId: string;
};

// Запрос на сервер
async function refreshSemesterSchedule(
    req: SessionRequest
) {
    const { data } = await api.post<ScheduleEntryType[]>( // меняем на массив
        REFRESH_SCHEDULE_URL,
        req
    );

    return data;
}

// Хук
export function useRefreshSemesterSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: refreshSemesterSchedule,
        onSuccess: (data, variables) => {
            // Обновляем кэш семестрового расписания
            queryClient.invalidateQueries({
                queryKey: ["semesterSchedule"]
            });

            // Инвалидируем связанные запросы
            queryClient.invalidateQueries({
                queryKey: ["todaySchedule"]
            });
        },
        onError: (error: any) => {
            console.error("Failed to refresh schedule:", error.response?.data || error.message);
        },
    });
}