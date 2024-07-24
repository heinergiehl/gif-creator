import React, { useState, useRef } from 'react';
const DraggableDrawer = ({
  children,
  minHeight = 100,
  maxHeight = '80vh',
  defaultHeight = 300,
}: {
  children: React.ReactNode;
  minHeight?: number | string;
  maxHeight?: number | string;
  defaultHeight?: number;
}) => {
  const [height, setHeight] = useState(defaultHeight);
  const [isOpen, setIsOpen] = useState(true); // Manage drawer open state
  const drawerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
    if (!handleRef.current) return;
    handleRef.current.initialY = e.touches[0].clientY;
    handleRef.current.initialHeight = height;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
    if (!handleRef.current) return;
    const newY = e.touches[0].clientY;
    const deltaY = handleRef.current.initialY - newY;
    const newHeight = handleRef.current.initialHeight + deltaY;
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setHeight(newHeight);
    }
  };
  return (
    <div
      ref={drawerRef}
      style={{
        height,
        maxHeight,
        minHeight,
        zIndex: isOpen ? 10 : 1, // Adjust z-index based on open state
        transition: 'z-index 0.3s',
      }}
      className="relative bottom-0 w-screen bg-white shadow-md"
    >
      <div
        ref={handleRef}
        className="flex h-10  w-full items-center justify-center bg-gray-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={() => setIsOpen(!isOpen)} // Toggle drawer open state on click
      >
        <span className="h-1 w-10 rounded bg-gray-400"></span>
      </div>
      <div className="absolute h-full overflow-y-auto">{children}</div>
    </div>
  );
};
export default DraggableDrawer;
