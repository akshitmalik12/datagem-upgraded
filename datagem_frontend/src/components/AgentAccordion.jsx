import React, { useState } from 'react';
export default function AgentAccordion({ steps }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg my-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-4 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        {open ? '▼' : '▶'} Agent Thinking Process...
      </button>
      {open && (
        <div className="p-4 bg-black text-green-400 font-mono text-xs max-h-40 overflow-y-auto">
          {steps.map((s, i) => <div key={i}>$ {s}</div>)}
        </div>
      )}
    </div>
  );
}
