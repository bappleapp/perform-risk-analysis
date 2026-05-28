// src/stores/performStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalculatorState, PerformanceScenario, RiskFactorScores } from '../types/perform';

interface PerformStore extends CalculatorState {
  // Actions
  setCurrentScenario: (scenario: Partial<PerformanceScenario>) => void;
  updateCurrentScenario: (updates: Partial<PerformanceScenario>) => void;
  saveScenario: (name: string) => void;
  updateScenario: (id: string) => void;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  setCurrentStep: (step: number) => void;
  resetCurrentScenario: () => void;
  resetAnalysis: () => void;
  
  // Risk factor actions
  setBodyPartScore: (bodyPart: string, factor: keyof RiskFactorScores, score: number) => void;
  getRiskProfile: () => { [bodyPart: string]: number };
}

const initialState: Omit<CalculatorState, 'currentScenario'> = {
  scenarios: [],
  currentStep: 0,
  isDirty: false,
};

export const usePerformStore = create<PerformStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentScenario: {},

      setCurrentScenario: (scenario) => 
        set({ currentScenario: scenario, isDirty: true }),

      updateCurrentScenario: (updates) =>
        set((state) => ({
          currentScenario: { ...state.currentScenario, ...updates },
          isDirty: true,
        })),

      saveScenario: (name) => {
        const { currentScenario, scenarios } = get();
        const now = new Date();
        const newScenario: PerformanceScenario = {
          id: Math.random().toString(36).slice(2, 11),
          name,
          date: currentScenario.date || new Date().toISOString().split('T')[0],
          workplace: currentScenario.workplace || '',
          workUnit: currentScenario.workUnit || '',
          riskAssessors: currentScenario.riskAssessors || [],
          taskDescription: currentScenario.taskDescription || {
            name: '', whySelected: '', location: '', performedBy: '',
            generalDescription: '', postures: '', forcefulExertions: '',
            repetitionDuration: '', toolsEquipment: '', workOrganization: ''
          },
          bodyPartScores: currentScenario.bodyPartScores || {},
          riskControls: currentScenario.riskControls || {
            designControls: '', administrativeControls: '', comments: ''
          },
          createdAt: now,
          updatedAt: now,
        };

        set({
          scenarios: [...scenarios, newScenario],
          currentScenario: newScenario,
          isDirty: false,
        });
      },

      updateScenario: (id) => {
        const { currentScenario, scenarios } = get();
        const existing = scenarios.find(s => s.id === id);
        if (!existing) return;
        const updated: PerformanceScenario = {
          ...existing,
          ...currentScenario,
          id,
          name: existing.name,
          updatedAt: new Date(),
        };
        set({
          scenarios: scenarios.map(s => s.id === id ? updated : s),
          currentScenario: updated,
          isDirty: false,
        });
      },

      loadScenario: (id) => {
        const { scenarios } = get();
        const scenario = scenarios.find(s => s.id === id);
        if (scenario) {
          set({ currentScenario: scenario, isDirty: false });
        }
      },

      deleteScenario: (id) => {
        const { scenarios } = get();
        set({
          scenarios: scenarios.filter(s => s.id !== id),
          currentScenario: {},
          isDirty: false,
        });
      },

      setCurrentStep: (step) => set({ currentStep: step }),

      resetCurrentScenario: () => set({ currentScenario: {}, isDirty: false }),
      
      resetAnalysis: () => {
        set({
          currentScenario: {
            date: new Date().toISOString().split('T')[0],
          },
          currentStep: 0,
          isDirty: false
        });
      },

      setBodyPartScore: (bodyPart, factor, score) => {
        const { currentScenario } = get();
        const currentScores = currentScenario.bodyPartScores || {};
        
        set({
          currentScenario: {
            ...currentScenario,
            bodyPartScores: {
              ...currentScores,
              [bodyPart]: {
                ...currentScores[bodyPart],
                [factor]: score,
              },
            },
          },
          isDirty: true,
        });
      },

      getRiskProfile: () => {
        const { currentScenario } = get();
        const bodyPartScores = currentScenario.bodyPartScores || {};
        const riskProfile: { [bodyPart: string]: number } = {};

        Object.entries(bodyPartScores).forEach(([bodyPart, scores]) => {
          const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
          riskProfile[bodyPart] = totalScore;
        });

        return riskProfile;
      },
    }),
    {
      name: 'perform-storage',
    }
  )
);