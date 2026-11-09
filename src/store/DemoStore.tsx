import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { createSeedState } from '../data/seed';
import { createMockMarketplaceService, type MarketplaceService } from '../services/marketplaceService';
import type { DemoState } from '../types';
import { demoReducer, type DemoAction } from './reducer';

const STORAGE_KEY = 'angelo-mall-go-demo-v1';

function loadInitialState(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.shops) && Array.isArray(parsed.orders)) {
        return parsed;
      }
    }
  } catch {
    // Corrupt/blocked storage: fall back to a fresh demo.
  }
  return createSeedState();
}

function persist(state: DemoState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota (e.g. large demo image data URLs) — the demo keeps running in memory.
  }
}

interface DemoStoreValue {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
  service: MarketplaceService;
  resetDemo: () => void;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadInitialState);
  // A ref mirror lets the mock service read post-dispatch state synchronously,
  // mirroring how an awaited API call would return fresh records in Phase 2.
  const stateRef = useRef(state);

  const dispatch = useCallback((action: DemoAction) => {
    const next = demoReducer(stateRef.current, action);
    stateRef.current = next;
    setState(next);
    persist(next);
  }, []);

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET_DEMO', now: Date.now() });
  }, [dispatch]);

  const service = useMemo(
    () => createMockMarketplaceService(() => stateRef.current, dispatch),
    [dispatch],
  );

  const value = useMemo<DemoStoreValue>(
    () => ({ state, dispatch, service, resetDemo }),
    [state, dispatch, service, resetDemo],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore(): DemoStoreValue {
  const value = useContext(DemoStoreContext);
  if (!value) throw new Error('useDemoStore must be used inside DemoStoreProvider.');
  return value;
}
