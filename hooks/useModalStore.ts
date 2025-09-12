// store/useModalStore.ts
import { create } from 'zustand';

type ModalStore = {
  isModalVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  isModalVisible: false,
  openModal: () => set({ isModalVisible: true }),
  closeModal: () => set({ isModalVisible: false }),
}));
