import { create } from "zustand";

const useResumeStore = create((set, get) => ({
    resumeText: "",

    setResumeText: (text) => {
        set({ resumeText: text });

    },
}));

export default useResumeStore;
