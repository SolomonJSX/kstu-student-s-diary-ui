import { useQuery } from "@tanstack/react-query"
import { GRADES_URL } from "../constants/hosts"
import { GradeInfo } from "../types/gradesType"
import { api } from "../utils/axios"
import { getData, STUDENT_ID_STORAGE_KEY } from "../utils/storage"

const fetchGrades = async (): Promise<GradeInfo[]> => {
    const studentId = await getData(STUDENT_ID_STORAGE_KEY)
    const response = await api.get<GradeInfo[]>(GRADES_URL, {
        params: {
            studentId: studentId
        }
    })

    return response.data
}

export const useGrades = () => {
    return useQuery({
        queryKey: ["grades"],
        queryFn: fetchGrades,
        staleTime: 1000 * 60,
    })
}