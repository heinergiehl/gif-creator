import React, { createContext, useContext, useState } from 'react';
import { EditorElement, Frame } from '@/types';
// Define the type for clipboard context
interface ClipboardContextType {
  clipboard: {
    elements: EditorElement[];
    frames: Frame[];
    action: 'copy' | 'paste' | 'cut';
  } | null;
  setClipboard: React.Dispatch<
    React.SetStateAction<{
      elements: EditorElement[];
      frames: Frame[];
      action: 'copy' | 'paste' | 'cut';
    } | null>
  >;
}
// Create context with default value as null
const ClipboardContext = createContext<ClipboardContextType | null>(null);
// Provide the clipboard context
export const ClipboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [clipboard, setClipboard] = useState<{
    elements: EditorElement[];
    frames: Frame[];
    action: 'copy' | 'paste' | 'cut';
  } | null>(null);
  return (
    <ClipboardContext.Provider value={{ clipboard, setClipboard }}>
      {children}
    </ClipboardContext.Provider>
  );
};
// Hook to use clipboard context
export const useClipboard = (): ClipboardContextType => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};
