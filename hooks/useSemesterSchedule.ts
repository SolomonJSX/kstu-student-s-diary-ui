import { api } from "../utils/axios";
import { SEMESTER_SCHEDULE_URL } from "../constants/hosts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {ScheduleResponse} from "../types/scheduleTypes";

export const useSemesterSchedule = (studentId: string) => {
    return useQuery({
        queryKey: ["semesterSchedule", studentId],
        queryFn: async () => {
            const res = await api.get<ScheduleResponse>(SEMESTER_SCHEDULE_URL, {
                params: {
                    studentId
                }
            })

            return res.data
        },
        staleTime: 1000 * 60 * 5
    })
}