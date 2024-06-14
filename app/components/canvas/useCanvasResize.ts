import { useEffect } from 'react';
export const useCanvasResize = (
  canvasRef: React.RefObject<fabric.Canvas>,
  containerWidth: number,
) => {
  useEffect(() => {
    const resizeCanvas = () => {
      const canvasContainer = document.getElementById('grid-canvas-container');
      if (!canvasContainer || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ratio = canvas.getWidth() / canvas.getHeight();
      const containerWidth = window.innerWidth / 3.2;
      const containerHeight = containerWidth / ratio;
      const scale = containerWidth / canvas.getWidth();
      canvas.setWidth(containerWidth);
      canvas.setHeight(containerHeight);
      const objects = canvas.getObjects();
      objects.forEach((object) => {
        object.scaleX && (object.scaleX *= scale);
        object.scaleY && (object.scaleY *= scale);
        object.left && (object.left *= scale);
        object.top && (object.top *= scale);
        object.setCoords();
      });
      console.log('Canvas resized');
    };
    window.addEventListener('resize', resizeCanvas);
    // resizeCanvas();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
};
