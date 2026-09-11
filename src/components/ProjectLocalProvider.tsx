"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { COSTOS_DEFAULT, type CostosInput } from "@/lib/costos";
import {
  readLocalProject,
  TIENDA_DEFAULT,
  writeLocalProject,
  type TiendaLocal,
} from "@/lib/local-project";

type ProjectLocalContextValue = {
  ready: boolean;
  costos: CostosInput;
  setCostos: Dispatch<SetStateAction<CostosInput>>;
  resetCostos: () => void;
  tienda: TiendaLocal;
  setTienda: Dispatch<SetStateAction<TiendaLocal>>;
};

const ProjectLocalContext = createContext<ProjectLocalContextValue | null>(null);

export function ProjectLocalProvider({ children }: { children: ReactNode }) {
  const [costos, setCostos] = useState<CostosInput>(COSTOS_DEFAULT);
  const [tienda, setTienda] = useState<TiendaLocal>(TIENDA_DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readLocalProject();
    if (saved) {
      setCostos(saved.costos);
      setTienda(saved.tienda);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeLocalProject({ costos, tienda });
  }, [costos, tienda, ready]);

  const value = useMemo(
    () => ({
      ready,
      costos,
      setCostos,
      resetCostos: () => setCostos(COSTOS_DEFAULT),
      tienda,
      setTienda,
    }),
    [ready, costos, tienda],
  );

  return (
    <ProjectLocalContext.Provider value={value}>
      {children}
    </ProjectLocalContext.Provider>
  );
}

export function useProjectLocal() {
  const context = useContext(ProjectLocalContext);
  if (!context) {
    throw new Error("useProjectLocal necesita ProjectLocalProvider");
  }
  return context;
}
