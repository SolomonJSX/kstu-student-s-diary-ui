import { useQuery } from "@tanstack/react-query"
import { UMKD_LISTS } from "../constants/hosts"
import { UmkdSubjectsResponseType } from "../types/subjectsType"
import { api } from "../utils/axios"

const fetchSubjectsLists = async (studentId: string) => {
    const response = await api.get<UmkdSubjectsResponseType[]>(UMKD_LISTS, {
        params: {
            studentId: studentId
        }
    })

    return response.data
}

export const useSubjectsList = (studentId: string) => {
    return useQuery({
        queryKey: ["umkdSubjectLists"],
        queryFn: async () => await fetchSubjectsLists(studentId),
    })
}