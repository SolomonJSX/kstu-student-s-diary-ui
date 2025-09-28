import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, STUDENT_ID_STORAGE_KEY } from "../utils/storage";
import { CERTIFICATION_URL } from "../constants/hosts";
import { SubjectGrade } from "../types/gradesType";
import { api } from "../utils/axios";

const refreshCertification = async (): Promise<SubjectGrade[]> => {
  const studentId = await getData(STUDENT_ID_STORAGE_KEY);
  const response = await api.get<SubjectGrade[]>(`${CERTIFICATION_URL}/refresh`, {
    params: { studentId },
  });
  return response.data;
};

export const useRefreshCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshCertification,
    onSuccess: (data) => {
      // 🔥 обновляем кэш
      queryClient.setQueryData(["certification"], data);
    },
  });
};