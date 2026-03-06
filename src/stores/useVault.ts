import { create } from "zustand";
import {
  persistKeyToSession,
  clearKeyFromSession,
} from "@/src/lib/crypto/sessionKeyStore";

interface VaultState {
  masterKey: CryptoKey | null;
  keySalt: string | null;
  isUnlocked: boolean;
  hasCompletedOnboarding: boolean;
  needsOnboarding: boolean;

  unlockVault: (key: CryptoKey, keySalt: string) => void;
  lockVault: () => void;
  setKeySalt: (keySalt: string) => void;
  setNeedsOnboarding: (value: boolean) => void;
}

export const useVault = create<VaultState>((set) => ({
  masterKey: null,
  keySalt: null,
  isUnlocked: false,
  hasCompletedOnboarding: false,
  needsOnboarding: false,

  unlockVault: (key: CryptoKey, keySalt: string) => {
    // Persist to sessionStorage so a page refresh restores the vault
    // without asking for the password again.
    persistKeyToSession(key, keySalt);
    set({
      masterKey: key,
      keySalt,
      isUnlocked: true,
      hasCompletedOnboarding: true,
      needsOnboarding: false,
    });
  },

  setKeySalt: (keySalt: string) =>
    set({
      keySalt,
      hasCompletedOnboarding: true,
      needsOnboarding: false,
    }),

  setNeedsOnboarding: (value: boolean) =>
    set({ needsOnboarding: value }),

  lockVault: () => {
    clearKeyFromSession();
    set({
      masterKey: null,
      keySalt: null,
      isUnlocked: false,
      hasCompletedOnboarding: false,
      needsOnboarding: false,
    });
  },
}));