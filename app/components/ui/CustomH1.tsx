import React from 'react';
interface CustomH1Props {
  text: string;
}
function CustomH1({ text }: CustomH1Props) {
  return (
    <h1 className="bg-pink-600 bg-gradient-to-r from-pink-500 to-purple-600  bg-clip-text text-5xl font-bold text-transparent">
      {text}
    </h1>
  );
}
export default CustomH1;
