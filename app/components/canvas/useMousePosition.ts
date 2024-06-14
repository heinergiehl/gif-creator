//  a hook that returns the current mouse position on the canvas
//  and updates the position on mouse move
// this is used to add additional html elements on top of the canvas for showing the size of the element being modified
// or to show the position of the element being added
import { useEffect, useState } from 'react';
// but i think i need the mouse position relative to the overall window
export const useMousePosition = (canvasRef: React.RefObject<fabric.Canvas>) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getElement().getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef]);
  return mousePosition;
};
