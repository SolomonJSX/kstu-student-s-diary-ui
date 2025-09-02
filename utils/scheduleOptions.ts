import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { getData, SEMESTER_SCHEDULE_STORAGE_KEY } from "./storage";
import { ScheduleResponse, weekTypeEnum } from "../types/scheduleTypes";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

export const isTodayEvenWeek = (): boolean => {
    const semesterStart = new Date(2025, 8, 1); // месяцы с 0! => 8 = сентябрь
    const today = new Date();

    // Разница в днях
    const diffTime = today.getTime() - semesterStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Номер недели с начала семестра (начинаем с 1)
    const weekNumber = Math.floor(diffDays / 7) + 1;

    // true если неделя чётная
    return weekNumber % 2 === 0;
}

export const getTodaySchedule = async (today: dayjs.Dayjs, weekType: weekTypeEnum) => {
    const scheduleStore = await getData(SEMESTER_SCHEDULE_STORAGE_KEY)

    if (!scheduleStore) throw new Error("No today schedule store")

    const scheduleData: ScheduleResponse = JSON.parse(scheduleStore)

    if (!scheduleData) throw new Error("No today schedule")

    const todayShort = today.format("dd").toUpperCase()

    return scheduleData[todayShort].filter(item => item.weekType === weekType || item.weekType == weekTypeEnum.both)
}