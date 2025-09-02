export type StudyTaskDto = {
    id: number;
    studentId: number;
    subject: string;
    description: string;
    deadline?: string | null;
    isCompleted: boolean;
    createdAt: string;
}

export type StudyTaskPagedResult = {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    data: StudyTaskDto[];
}

export interface StudyTaskCreateDto {
  studentId: number;
  description: string;
  deadline?: string; // ISO string (например: "2025-09-01T12:00:00Z")
  subject: string;
}

export type StudyTask = {
    id: number;
    studentId: number;
    subject: string;
    description: string;
    deadline?: string | null;
    isCompleted: boolean;
    createdAt: string;
}