export type ScheduleEntryType = {
    day: string;
    time: string;
    subject: string;
    teacher: string;
    auditorium: string;
    corpus: corpusEnum;
    weekType: weekTypeEnum; // 0 - обе недели, 1 - нечётная, 2 - чётная
    weekStartDate: string;
    createdAt: string;
};

export enum weekTypeEnum {
    both,
    numerator,
    denominator
}

export enum corpusEnum
{
    unknown,
    oneK,    // 1 К
    twoK,    // 2 К
    gla      // ГЛА
}

export type ScheduleResponse = Record<string, ScheduleEntryType[]>