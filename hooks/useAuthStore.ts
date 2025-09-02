import {create} from "zustand";

type AuthState = {
    isSigned: boolean;
    setIsSigned: (value: boolean) => void;
}

const useAuthStore = create<AuthState>((set => ({
    isSigned: false,
    setIsSigned: (value: boolean) => set({ isSigned: value }),
})))

export default useAuthStore;