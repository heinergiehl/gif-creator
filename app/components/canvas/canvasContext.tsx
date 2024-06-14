'use client';
import React, { createContext, useContext, useRef, MutableRefObject } from 'react';
import { fabric } from 'fabric';
interface CanvasContextType {
  canvasRef: MutableRefObject<fabric.Canvas | null>;
}
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);
export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  return <CanvasContext.Provider value={{ canvasRef }}>{children}</CanvasContext.Provider>;
};
