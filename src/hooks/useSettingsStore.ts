import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  darkMode: boolean;
  autoSave: boolean;
  toggleDarkMode: () => void;
  toggleAutoSave: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      darkMode: false,
      autoSave: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleAutoSave: () => set((s) => ({ autoSave: !s.autoSave })),
    }),
    { name: 'md-editor-settings' }
  )
);
