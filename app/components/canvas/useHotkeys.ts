import { useStores } from '@/store';
import { useEffect } from 'react';
import { fabric } from 'fabric';
import { EditorElement } from '@/types';
export const useHotkeys = (canvasRef: React.RefObject<fabric.Canvas>) => {
  const store = useStores().editorStore;
  // copy, paste, cut, delete
  useEffect(() => {
    let activeObjects: fabric.Object[] = [];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (canvasRef.current) {
          // copy the active object to clipboard but dont add it to canvas, as it should be added on paste
          activeObjects = canvasRef.current.getActiveObjects();
          const activeObjectIds = activeObjects.map((obj) => obj.id);
          const elements = store.elements.filter((el) => activeObjectIds.includes(el.id));
          store.setCopiedElements(elements);
          canvasRef.current.getActiveObject()?.setControlVisible('copiedSuccess', true);
        }
      } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (canvasRef.current) {
          if (activeObjects.length > 0) {
            const elements = activeObjects
              .map((obj) => {
                const element = store.elements.find((el) => el.id === obj.id);
                return element;
              })
              .filter((el) => el !== undefined) as EditorElement[];
            if (elements.length > 0) store.copySelectedElements(elements);
          }
        }
      } else if (e.key === 'x' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (canvasRef.current) {
          const activeObject = canvasRef.current.getActiveObject();
          if (activeObject) {
            const elementToRemove = store.elements.find((el) => el.id === activeObject?.id);
            store.elements = store.elements.filter((el) => el.id !== elementToRemove?.id);
          }
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        if (canvasRef.current) {
          const activeObject = canvasRef.current.getActiveObject();
          if (activeObject) {
            const elementToRemove = store.elements.find((el) => el.id === activeObject?.id);
            store.elements = store.elements.filter((el) => el.id !== elementToRemove?.id);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
