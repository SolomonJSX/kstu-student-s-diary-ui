// hooks/useTeacherFiles.ts
import { useQuery } from "@tanstack/react-query";
import { UMKD_TEACHER_FILES } from "../constants/hosts";
import { TeacherFilesResponseType, UmkdFilesRequestType } from "../types/subjectsType";
import { api } from "../utils/axios";

const fetchTeacherFiles = async (request: UmkdFilesRequestType) => {
  const response = await api.get<TeacherFilesResponseType[]>(UMKD_TEACHER_FILES, {
    params: request,
  });
  console.log("Files:", response.data);
  return response.data; // Возвращаем массив
};

export const useTeacherFiles = (request: UmkdFilesRequestType) => {
  return useQuery<TeacherFilesResponseType[], Error>({
    queryKey: ['teacherFiles', request.studentId, request.subjectId],
    queryFn: () => fetchTeacherFiles(request),
    enabled: !!request.studentId && !!request.subjectId,
  });
};
