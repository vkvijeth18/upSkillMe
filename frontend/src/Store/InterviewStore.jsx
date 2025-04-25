import { create } from "zustand";

const useInterviewStore = create((set, get) => ({
    interviewType: "", // Stores the selected interview type

    setInterviewType: (type) => {
        set({ interviewType: type });
    },
}));

export default useInterviewStore;
