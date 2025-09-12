import { useQuery } from "@tanstack/react-query";
import { StudentItem } from "../types/githubType";
import { api } from "../utils/axios";
import { getData, STUDENT_ID_STORAGE_KEY } from "../utils/storage";

const fetchStudents = async (): Promise<StudentItem[]> => {
  const studentId = await getData(STUDENT_ID_STORAGE_KEY);
  const { data } = await api.get<StudentItem[]>("/students", {
    params: { currentStudentId: studentId }
  });
  return data;
};

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: 1000 * 60,
  });
}