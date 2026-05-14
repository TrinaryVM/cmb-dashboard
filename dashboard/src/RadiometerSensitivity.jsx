import React, { useState, useEffect } from 'react';

export const RadiometerSensitivity = () => {
  const [tSys, setTSys] = useState(55); // K
  const [bw, setBw] = useState(200); // MHz
  const [integration, setIntegration] = useState(10); // Seconds
  const [isDicke, setIsDicke] = useState(false);
  const [sensitivity, setSensitivity] = useState(0);

  useEffect(() => {
    // Delta T = T_sys / sqrt(B * t)
    // Dicke factor = 2
    const b_hz = bw * 1e6;
    const factor = isDicke ? 2 : 1;
    const dT = (factor * tSys) / Math.sqrt(b_hz * integration);
    setSensitivity(dT);
  }, [tSys, bw, integration, isDicke]);

  return (
    <div className="chart-card" style={{ gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="chart-card-title">Radiometer Sensitivity Calculator</h3>
        <button 
          onClick={() => setIsDicke(!isDicke)}
          className={`badge ${isDicke ? 'badge-blue' : 'badge-amber'}`}
          style={{ cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'transparent' }}
        >
          {isDicke ? 'Dicke Mode (x2)' : 'Total Power Mode'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Temp (T_sys)</label>
            <input 
              type="range" min="1" max="1000" step="1" 
              value={tSys} onChange={(e) => setTSys(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>{tSys} K</div>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bandwidth (B)</label>
            <input 
              type="range" min="1" max="1000" step="10" 
              value={bw} onChange={(e) => setBw(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--blue)' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 'bold' }}>{bw} MHz</div>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Integration (τ)</label>
            <input 
              type="range" min="1" max="3600" step="1" 
              value={integration} onChange={(e) => setIntegration(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--green)' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>{integration} s</div>
          </div>
        </div>

        <div style={{ 
          background: '#05060a', 
          borderRadius: '12px', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          border: '1px solid var(--border-default)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Minimum Detectable ΔT
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {(sensitivity * 1000).toFixed(2)} mK
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
            ΔT = {isDicke ? '2 · ' : ''}T_sys / √(B · τ)
          </div>
          <div style={{ fontSize: '11px', color: sensitivity < 0.01 ? 'var(--green)' : 'var(--accent)', marginTop: '8px', opacity: 0.8 }}>
            {sensitivity < 0.01 ? 'Deep space resolution achieved' : 'Requires longer integration for CMB'}
          </div>
        </div>
      </div>
      <p className="chart-card-note">
        Calculates the noise floor of the radiometer. For CMB detection (2.725 K), you generally need ΔT &lt; 50 mK. 
        Higher bandwidth and longer integration times reduce the thermal noise floor.
      </p>
    </div>
  );
};
