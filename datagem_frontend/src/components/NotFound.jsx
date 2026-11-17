import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090a0f',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{
          fontSize: '4.5rem',
          fontWeight: '800',
          letterSpacing: '-0.05em',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          lineHeight: 1
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#f8fafc',
          marginBottom: '0.75rem'
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          The page or analytical view you are looking for does not exist or has been relocated in DataGem 2.0.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/chat')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: '#041c14',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
            }}
          >
            Go to Analytical Chat →
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              fontWeight: '500',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
