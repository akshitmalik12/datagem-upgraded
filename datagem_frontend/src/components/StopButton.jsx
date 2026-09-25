import React from 'react';
export default function StopButton({ onStop }) {
  return (
    <button onClick={onStop} className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
      <div className="w-3 h-3 bg-white rounded-sm"></div> Stop Generating
    </button>
  );
}
