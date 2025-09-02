import { useQuery } from '@tanstack/react-query';
import {PROFILE_URL} from "../constants/hosts";
import {api} from "../utils/axios";
import {ProfileType} from "../types/profileType";

const fetchProfile = async (studentId: string): Promise<ProfileType> => {
    const { data } = await api.get<ProfileType>(PROFILE_URL, {
        params: {
            studentId
        }
    })
    return data;
}

export function useProfile(studentId: string) {
    return useQuery({
        queryKey: ["profile", studentId],
        queryFn: () => fetchProfile(studentId),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 5,
        retry: 1
    });
}
