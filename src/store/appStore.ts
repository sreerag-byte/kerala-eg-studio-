// ============================================================
// Kerala EG Studio — Application State Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SelectedCurriculum } from '../curriculum/types';
import type {
  DrawingCanvasState,
  SolverSolution,
  ExtractedQuestionData,
} from '../geometry/types';

// ── Saved solution ────────────────────────────────────────────
export interface SavedSolution {
  id: string;
  timestamp: number;
  questionText: string;
  topic: string;
  curriculum: SelectedCurriculum;
  solution: SolverSolution;
}

// ── App store ─────────────────────────────────────────────────
interface AppState {
  // Curriculum
  curriculum: SelectedCurriculum | null;
  setCurriculum: (c: SelectedCurriculum) => void;

  // API Key (stored locally, not sent to server)
  apiKey: string;
  setApiKey: (key: string) => void;

  // Current question session
  questionText: string;
  setQuestionText: (t: string) => void;
  uploadedImageData: string | null;
  uploadedImageMime: string | null;
  setUploadedImage: (data: string, mime: string) => void;
  clearUploadedImage: () => void;
  extractedData: ExtractedQuestionData | null;
  setExtractedData: (d: ExtractedQuestionData | null) => void;

  // Current solution
  currentSolution: SolverSolution | null;
  setCurrentSolution: (s: SolverSolution | null) => void;

  // Drawing canvas state
  canvasState: DrawingCanvasState;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleConstructionLines: () => void;
  toggleHiddenLines: () => void;
  toggleDimensions: () => void;
  toggleLabels: () => void;
  toggleProjectors: () => void;
  toggleDraftingStyle: () => void;
  setScale: (scale: number) => void;
  setPan: (x: number, y: number) => void;
  resetViewport: () => void;

  // Saved solutions (local)
  savedSolutions: SavedSolution[];
  saveSolution: (questionText: string, topic: string) => void;
  deleteSolution: (id: string) => void;
  loadSolution: (id: string) => void;

  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Teaching mode
  teachingMode: boolean;
  toggleTeachingMode: () => void;

  // Loading / error states
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
}

const DEFAULT_CANVAS_STATE: DrawingCanvasState = {
  objects: [],
  currentStep: 0,
  totalSteps: 0,
  viewport: { scale: 2.0, panX: 0, panY: 0 },
  showConstructionLines: true,
  showHiddenLines: true,
  showDimensions: true,
  showLabels: true,
  showProjectors: true,
  draftingStyle: 'MANUAL_SHEET',
  projectionAngle: 'FIRST_ANGLE',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Curriculum
      curriculum: null,
      setCurriculum: (c) => set({ curriculum: c }),

      // API Key
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      // Question session
      questionText: '',
      setQuestionText: (t) => set({ questionText: t }),
      uploadedImageData: null,
      uploadedImageMime: null,
      setUploadedImage: (data, mime) =>
        set({ uploadedImageData: data, uploadedImageMime: mime }),
      clearUploadedImage: () =>
        set({ uploadedImageData: null, uploadedImageMime: null }),
      extractedData: null,
      setExtractedData: (d) => set({ extractedData: d }),

      // Current solution
      currentSolution: null,
      setCurrentSolution: (s) => {
        if (s) {
          set({
            currentSolution: s,
            canvasState: {
              ...DEFAULT_CANVAS_STATE,
              objects: s.drawingObjects,
              currentStep: 1,
              totalSteps: s.steps.length,
            },
          });
        } else {
          set({ currentSolution: null, canvasState: DEFAULT_CANVAS_STATE });
        }
      },

      // Drawing canvas
      canvasState: DEFAULT_CANVAS_STATE,
      setCurrentStep: (step) =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            currentStep: Math.max(0, Math.min(step, state.canvasState.totalSteps)),
          },
        })),
      nextStep: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            currentStep: Math.min(
              state.canvasState.currentStep + 1,
              state.canvasState.totalSteps
            ),
          },
        })),
      prevStep: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            currentStep: Math.max(1, state.canvasState.currentStep - 1),
          },
        })),
      toggleConstructionLines: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            showConstructionLines: !state.canvasState.showConstructionLines,
          },
        })),
      toggleHiddenLines: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            showHiddenLines: !state.canvasState.showHiddenLines,
          },
        })),
      toggleDimensions: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            showDimensions: !state.canvasState.showDimensions,
          },
        })),
      toggleLabels: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            showLabels: !state.canvasState.showLabels,
          },
        })),
      toggleProjectors: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            showProjectors: !state.canvasState.showProjectors,
          },
        })),
      toggleDraftingStyle: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            draftingStyle: state.canvasState.draftingStyle === 'CAD' ? 'MANUAL_SHEET' : 'CAD',
          },
        })),
      setScale: (scale) =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            viewport: { ...state.canvasState.viewport, scale },
          },
        })),
      setPan: (x, y) =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            viewport: { ...state.canvasState.viewport, panX: x, panY: y },
          },
        })),
      resetViewport: () =>
        set((state) => ({
          canvasState: {
            ...state.canvasState,
            viewport: DEFAULT_CANVAS_STATE.viewport,
          },
        })),

      // Saved solutions
      savedSolutions: [],
      saveSolution: (questionText, topic) => {
        const { currentSolution, curriculum } = get();
        if (!currentSolution || !curriculum) return;
        const saved: SavedSolution = {
          id: `sol_${Date.now()}`,
          timestamp: Date.now(),
          questionText,
          topic,
          curriculum,
          solution: currentSolution,
        };
        set((state) => ({
          savedSolutions: [saved, ...state.savedSolutions].slice(0, 50),
        }));
      },
      deleteSolution: (id) =>
        set((state) => ({
          savedSolutions: state.savedSolutions.filter((s) => s.id !== id),
        })),
      loadSolution: (id) => {
        const { savedSolutions } = get();
        const sol = savedSolutions.find((s) => s.id === id);
        if (sol) get().setCurrentSolution(sol.solution);
      },

      // Navigation
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Teaching mode
      teachingMode: true,
      toggleTeachingMode: () =>
        set((state) => ({ teachingMode: !state.teachingMode })),

      // Loading / error
      isLoading: false,
      setIsLoading: (v) => set({ isLoading: v }),
      error: null,
      setError: (e) => set({ error: e }),
    }),
    {
      name: 'kerala-eg-studio-state',
      partialize: (state) => ({
        curriculum: state.curriculum,
        apiKey: state.apiKey,
        savedSolutions: state.savedSolutions,
        teachingMode: state.teachingMode,
      }),
    }
  )
);
