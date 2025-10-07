import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Cup {
  id: string;
  name: string;
  isConnected: boolean;
  batteryLevel: number;
  color: string;
  mode: CupMode;
  brightness: number;
}

export type CupMode = 'static' | 'pulse' | 'strobe' | 'rainbow';

export interface ColorPreset {
  id: string;
  name: string;
  color: string;
  mode: CupMode;
  brightness: number;
}

interface NiteControlState {
  cups: Cup[];
  selectedCups: string[];
  colorPresets: ColorPreset[];
  isScanning: boolean;
  isConnecting: boolean;
  error: string | null;
  currentColor: string;
  currentMode: CupMode;
  currentBrightness: number;
}

interface NiteControlActions {
  scanForCups: () => Promise<void>;
  connectToCup: (cupId: string) => Promise<void>;
  disconnectFromCup: (cupId: string) => Promise<void>;
  renameCup: (cupId: string, name: string) => void;
  selectCup: (cupId: string) => void;
  deselectCup: (cupId: string) => void;
  selectAllCups: () => void;
  deselectAllCups: () => void;
  setColor: (color: string) => Promise<void>;
  setCupColor: (cupId: string, color: string) => Promise<void>;
  setMode: (mode: CupMode) => Promise<void>;
  setBrightness: (brightness: number) => Promise<void>;
  savePreset: (name: string) => void;
  deletePreset: (presetId: string) => void;
  applyPreset: (presetId: string) => Promise<void>;
  clearError: () => void;
}

type NiteControlStore = NiteControlState & NiteControlActions;

// Mock cups data
const mockCups: Cup[] = [
  {
    id: 'cup-1',
    name: 'Cup 1',
    isConnected: false,
    batteryLevel: 85,
    color: '#00FF88',
    mode: 'static',
    brightness: 80,
  },
  {
    id: 'cup-2',
    name: 'Cup 2',
    isConnected: false,
    batteryLevel: 92,
    color: '#00D4FF',
    mode: 'pulse',
    brightness: 75,
  },
  {
    id: 'cup-3',
    name: 'Cup 3',
    isConnected: false,
    batteryLevel: 67,
    color: '#B347FF',
    mode: 'static',
    brightness: 90,
  },
];

export const useNiteControlStore = create<NiteControlStore>()(
  persist(
    (set, get) => ({
      // State
      cups: mockCups,
      selectedCups: [],
      colorPresets: [
        {
          id: 'preset-1',
          name: 'Neon Green',
          color: '#00FF88',
          mode: 'static',
          brightness: 80,
        },
        {
          id: 'preset-2',
          name: 'Electric Blue',
          color: '#00D4FF',
          mode: 'pulse',
          brightness: 75,
        },
        {
          id: 'preset-3',
          name: 'Party Mode',
          color: '#FF47B3',
          mode: 'rainbow',
          brightness: 100,
        },
      ],
      isScanning: false,
      isConnecting: false,
      error: null,
      currentColor: '#00FF88',
      currentMode: 'static',
      currentBrightness: 80,

      // Actions
      scanForCups: async () => {
        set({ isScanning: true, error: null });
        
        try {
          // Mock BLE scan - replace with real BLE later
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          set({
            isScanning: false,
            error: null,
          });
        } catch (error) {
          set({
            isScanning: false,
            error: 'Failed to scan for cups',
          });
        }
      },

      connectToCup: async (cupId: string) => {
        set({ isConnecting: true, error: null });
        
        try {
          // Mock BLE connection - replace with real BLE later
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          set(state => ({
            cups: state.cups.map(cup =>
              cup.id === cupId ? { ...cup, isConnected: true } : cup
            ),
            isConnecting: false,
            error: null,
          }));
        } catch (error) {
          set({
            isConnecting: false,
            error: 'Failed to connect to cup',
          });
        }
      },

      disconnectFromCup: async (cupId: string) => {
        try {
          // Mock BLE disconnection - replace with real BLE later
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            cups: state.cups.map(cup =>
              cup.id === cupId ? { ...cup, isConnected: false } : cup
            ),
            selectedCups: state.selectedCups.filter(id => id !== cupId),
          }));
        } catch (error) {
          set({ error: 'Failed to disconnect from cup' });
        }
      },

      renameCup: (cupId: string, name: string) => {
        set(state => ({
          cups: state.cups.map(cup =>
            cup.id === cupId ? { ...cup, name } : cup
          ),
        }));
      },

      selectCup: (cupId: string) => {
        set(state => ({
          selectedCups: state.selectedCups.includes(cupId)
            ? state.selectedCups
            : [...state.selectedCups, cupId],
        }));
      },

      deselectCup: (cupId: string) => {
        set(state => ({
          selectedCups: state.selectedCups.filter(id => id !== cupId),
        }));
      },

      selectAllCups: () => {
        const { cups } = get();
        const connectedCupIds = cups
          .filter(cup => cup.isConnected)
          .map(cup => cup.id);
        
        set({ selectedCups: connectedCupIds });
      },

      deselectAllCups: () => {
        set({ selectedCups: [] });
      },

      setColor: async (color: string) => {
        const { selectedCups } = get();
        set({ currentColor: color });
        
        try {
          // Mock BLE color update - replace with real BLE later
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set(state => ({
            cups: state.cups.map(cup =>
              selectedCups.includes(cup.id) ? { ...cup, color } : cup
            ),
          }));
        } catch (error) {
          set({ error: 'Failed to set color' });
        }
      },

      setCupColor: async (cupId: string, color: string) => {
        try {
          // Mock BLE color update for specific cup - replace with real BLE later
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set(state => ({
            cups: state.cups.map(cup =>
              cup.id === cupId ? { ...cup, color } : cup
            ),
          }));
        } catch (error) {
          set({ error: 'Failed to set cup color' });
        }
      },

      setMode: async (mode: CupMode) => {
        const { selectedCups } = get();
        set({ currentMode: mode });
        
        try {
          // Mock BLE mode update - replace with real BLE later
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set(state => ({
            cups: state.cups.map(cup =>
              selectedCups.includes(cup.id) ? { ...cup, mode } : cup
            ),
          }));
        } catch (error) {
          set({ error: 'Failed to set mode' });
        }
      },

      setBrightness: async (brightness: number) => {
        const { selectedCups } = get();
        set({ currentBrightness: brightness });
        
        try {
          // Mock BLE brightness update - replace with real BLE later
          await new Promise(resolve => setTimeout(resolve, 200));
          
          set(state => ({
            cups: state.cups.map(cup =>
              selectedCups.includes(cup.id) ? { ...cup, brightness } : cup
            ),
          }));
        } catch (error) {
          set({ error: 'Failed to set brightness' });
        }
      },

      savePreset: (name: string) => {
        const { currentColor, currentMode, currentBrightness } = get();
        const newPreset: ColorPreset = {
          id: Date.now().toString(),
          name,
          color: currentColor,
          mode: currentMode,
          brightness: currentBrightness,
        };
        
        set(state => ({
          colorPresets: [...state.colorPresets, newPreset],
        }));
      },

      deletePreset: (presetId: string) => {
        set(state => ({
          colorPresets: state.colorPresets.filter(preset => preset.id !== presetId),
        }));
      },

      applyPreset: async (presetId: string) => {
        const { colorPresets } = get();
        const preset = colorPresets.find(p => p.id === presetId);
        
        if (!preset) return;
        
        set({
          currentColor: preset.color,
          currentMode: preset.mode,
          currentBrightness: preset.brightness,
        });
        
        // Apply to selected cups
        await get().setColor(preset.color);
        await get().setMode(preset.mode);
        await get().setBrightness(preset.brightness);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'nite-control-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cups: state.cups,
        colorPresets: state.colorPresets,
        currentColor: state.currentColor,
        currentMode: state.currentMode,
        currentBrightness: state.currentBrightness,
      }),
    }
  )
);