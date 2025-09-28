import { useQuery } from "@tanstack/react-query";
import { getData, STUDENT_ID_STORAGE_KEY } from "../utils/storage";
import { SubjectGrade } from "../types/gradesType";
import { CERTIFICATION_URL } from "../constants/hosts";
import { api } from "../utils/axios";

const fetchCertification = async (): Promise<SubjectGrade[]> => {
  const studentId = await getData(STUDENT_ID_STORAGE_KEY);
  const response = await api.get<SubjectGrade[]>(CERTIFICATION_URL, {
    params: { studentId },
  });
  return response.data;
};

export const useCertification = () => {
  return useQuery({
    queryKey: ["certification"],
    queryFn: fetchCertification,
    staleTime: 1000 * 60 * 60 * 24, // сутки
  });
};