export enum RkEnum {
    Rk1 = "Rk1",
    Rk2 = "Rk2"
}

export interface GradeItem {
    type: RkEnum;
    date: string;
    score: number;
    total: number;
}

export interface ClassInfo {
    type: string;
    teacher: string;
    grades: GradeItem[];
    hasData: boolean;
}

export interface GradeInfo {
    subjectName: string;
    period: string;
    classes: ClassInfo[];
    rK1: number;
    rK2: number;
}

export interface SubjectGrade {
  discipline: string;
  credits: number;
  rK1: number;
  rK2: number;
  pa: number;
  sum: number;
  gpa: number;
  letterGrade: string;
  meaning: string;
}

