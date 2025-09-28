import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GRADES_URL } from "../constants/hosts"
import { GradeInfo } from "../types/gradesType"
import { api } from "../utils/axios"
import { getData, STUDENT_ID_STORAGE_KEY } from "../utils/storage"

const refreshGradesRequest = async (): Promise<GradeInfo[]> => {
  const studentId = await getData(STUDENT_ID_STORAGE_KEY);
  const response = await api.get<GradeInfo[]>(`${GRADES_URL}/refresh`, {
    params: { studentId },
  });
  return response.data;
};

export const useRefreshGrades = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshGradesRequest,
    onSuccess: (data) => {
      // 🔥 сразу обновляем кэш
      queryClient.setQueryData(["grades"], data);
    },
  });
};