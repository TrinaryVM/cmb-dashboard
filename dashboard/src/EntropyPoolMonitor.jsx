import React, { useState, useEffect, useRef } from 'react';

export const EntropyPoolMonitor = () => {
  const [poolSize, setPoolSize] = useState(1024);
  const [totalInjected, setTotalInjected] = useState(0);
  const [isInjecting, setIsInjecting] = useState(false);
  const poolMax = 4096;

  // Use a ref for the interval to prevent multiple injections
  const injectionIntervalRef = useRef(null);

  useEffect(() => {
    // Natural subtle drain (System Background Noise / Process seeding)
    const drainInterval = setInterval(() => {
      setPoolSize(prev => {
        // Only drain if there's significant entropy
        if (prev <= 128) return prev;
        const drain = Math.floor(Math.random() * 8) + 2;
        return Math.max(128, prev - drain);
      });
    }, 2000);

    return () => {
      clearInterval(drainInterval);
      if (injectionIntervalRef.current) clearInterval(injectionIntervalRef.current);
    };
  }, []);

  const injectEntropy = () => {
    if (poolSize >= poolMax || isInjecting) return;
    
    setIsInjecting(true);
    let injectedInSession = 0;
    
    injectionIntervalRef.current = setInterval(() => {
      setPoolSize(prev => {
        const next = Math.min(poolMax, prev + 256);
        if (next >= poolMax) {
          clearInterval(injectionIntervalRef.current);
          setIsInjecting(false);
        }
        return next;
      });
      
      setTotalInjected(prev => prev + 256);
      injectedInSession += 256;

      // Safety stop
      if (injectedInSession >= 2048) {
        clearInterval(injectionIntervalRef.current);
        setIsInjecting(false);
      }
    }, 150);
  };

  const poolPercentage = (poolSize / poolMax) * 100;
  const isCritical = poolSize < 512;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Linux Kernel Entropy Pool (/dev/random)</h3>
        <button 
          className={`badge ${isInjecting ? 'active' : ''}`}
          onClick={injectEntropy} 
          disabled={isInjecting || poolSize >= poolMax}
          style={{ 
            cursor: poolSize >= poolMax ? 'not-allowed' : 'pointer', 
            border: '1px solid var(--accent)', 
            background: isInjecting ? 'var(--accent)' : 'transparent', 
            color: isInjecting ? '#000' : 'var(--accent)', 
            fontWeight: 'bold',
            opacity: poolSize >= poolMax ? 0.5 : 1
          }}
        >
          {isInjecting ? 'INJECTING...' : (poolSize >= poolMax ? 'POOL FULL' : 'RNDADDENTROPY')}
        </button>
      </div>

      <div style={{ position: 'relative', height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, height: '100%', 
          width: `${poolPercentage}%`, 
          background: isCritical ? 'linear-gradient(90deg, #441111, var(--red))' : 'linear-gradient(90deg, var(--accent-dim), var(--accent))',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isCritical ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px var(--accent-glow)'
        }}></div>
        
        {/* Progress Grid Markers */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: '1px', height: '100%', background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>

        <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontFamily: 'var(--font-mono)', color: poolPercentage > 50 ? '#000' : 'var(--text-primary)', zIndex: 1, fontWeight: 'bold', textShadow: poolPercentage <= 50 ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
          {poolSize.toLocaleString()} / 4,096 BITS
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="docview-stat">
          <div className="docview-stat-value" style={{ fontSize: '15px' }}>{totalInjected.toLocaleString()} bits</div>
          <div className="docview-stat-label">Hardware Ingested</div>
        </div>
        <div className="docview-stat">
          <div className="docview-stat-value" style={{ fontSize: '15px', color: isCritical ? 'var(--red)' : 'var(--accent)' }}>
            {isCritical ? 'LOW_ENTROPY' : (poolSize > 3800 ? 'SATURATED' : 'STABLE')}
          </div>
          <div className="docview-stat-label">Pool Integrity</div>
        </div>
      </div>

      <div className="chart-telemetry-box">
        <div className="chart-telemetry-label">Entropy IOCTL Status</div>
        <div className="chart-telemetry-value">
          BLOCKING: {isCritical ? 'TRUE' : 'FALSE'} | SOURCE: CMB_RADIOMETER_01
        </div>
      </div>

      <p className="chart-card-note" style={{ marginTop: '12px' }}>
        Real-time simulation of the Linux entropy pool. Hardware TRNG injections prevent /dev/random 
        from blocking during high-load cryptographic requests.
      </p>
    </div>
  );
};
