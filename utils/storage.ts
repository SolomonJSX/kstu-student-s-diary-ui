import AsyncStorage from "@react-native-async-storage/async-storage";
import {ScheduleEntryType} from "../types/scheduleTypes";

export const SEMESTER_SCHEDULE_STORAGE_KEY = 'STUDENT_SCHEDULE';
export const STUDENT_ID_STORAGE_KEY = 'studentId';
export async function saveData(key:string, value: string) {
    await AsyncStorage.setItem(key, value)
}

export async function getData(key:string) {
    return await AsyncStorage.getItem(key)
}

export async function deleteData(key:string) {
    await AsyncStorage.removeItem(key);
}

export const saveSchedule = async (schedule: ScheduleEntryType[]) => {
    try {
        const json = JSON.stringify(schedule)
        await saveData(SEMESTER_SCHEDULE_STORAGE_KEY, json)
    } catch (error) {
        console.error("Ошибка при сохранении расписания:", error);
    }
}

export const loadSchedule = async (): Promise<ScheduleEntryType[]> => {
    try {
        const json = await getData(SEMESTER_SCHEDULE_STORAGE_KEY);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error("Ошибка при загрузке расписания", e);
        return [];
    }
}

export const clearSchedule = async () => {
  await deleteData(SEMESTER_SCHEDULE_STORAGE_KEY);
};

export const DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];