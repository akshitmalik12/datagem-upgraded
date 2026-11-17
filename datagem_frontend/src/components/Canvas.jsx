import React, { useState } from 'react';
import './Canvas.css'; // Assuming basic CSS for styling

const Canvas = ({ artifacts }) => {
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  return (
    <div className="canvas-container" style={{ display: 'flex', height: '100%' }}>
      <div className="canvas-sidebar" style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Artifacts</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {artifacts && artifacts.map((artifact, index) => (
            <li 
              key={index} 
              onClick={() => setSelectedArtifact(artifact)}
              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              {artifact.title || `Artifact ${index + 1}`}
            </li>
          ))}
        </ul>
      </div>
      <div className="canvas-main" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {selectedArtifact ? (
          <div>
            <h2>{selectedArtifact.title}</h2>
            <div className="artifact-content">
              {/* Render artifact content based on type */}
              {selectedArtifact.type === 'code' ? (
                <pre><code>{selectedArtifact.content}</code></pre>
              ) : selectedArtifact.type === 'markdown' ? (
                <div dangerouslySetInnerHTML={{ __html: selectedArtifact.content }} />
              ) : (
                <p>{selectedArtifact.content}</p>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
            <p>Select an artifact to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
