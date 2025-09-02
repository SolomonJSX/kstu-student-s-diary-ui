import {useMutation} from "@tanstack/react-query";
import { api } from "../utils/axios";
import {LoginRequestType, LoginResponseType} from "../types/authType";
import { LOGIN_URL } from "../constants/hosts";

export const useLogin = () => {
    return useMutation({
        mutationFn: async ({ username, password }: LoginRequestType) => {
            const res = await api.post<LoginResponseType>(LOGIN_URL, {
                username,
                password
            })

            return res.data
        }
    })
}