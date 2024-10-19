"use client";

import { HexMapState } from "@/events/HexMapState";
import { createContext, ReactNode, useContext, useRef } from "react";
export const MapStateContext = createContext(new HexMapState());

export const MapStateProvider = ({ children }: { children: ReactNode }) => {
  const mapState = useRef(new HexMapState());

  return (
    <MapStateContext.Provider value={mapState.current}>
      {children}
    </MapStateContext.Provider>
  );
};

export const useMapState = () => {
  return useContext(MapStateContext);
};
