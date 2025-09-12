export type UmkdSubjectsResponseType = {
    subject: string;
    id: string;
}

export type UmkdFilesRequestType = {
  studentId: string;
  subjectId: string;
};

export type UmkdFileType = {
  id: number;
  fileName: string;
  description: string;
  fileType: string;
  languageGroup: string;
  downloadUrl: string;
  size: string;
  uploadDate: string;
  downloads: number;
  rating: number;
};

export type TeacherFilesResponseType = {
  teacherName: string;
  files: UmkdFileType[];
};


/*
public class UmkdSubjectsResponse
{
    public string? Subject { get; set; }
    public string? Id { get; set; }
}

*/