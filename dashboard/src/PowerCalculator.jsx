import React, { useState, useEffect } from 'react';

export const PowerCalculator = () => {
  const [temp, setTemp] = useState(2.725);
  const [bandwidth, setBandwidth] = useState(500); // MHz
  const [power, setPower] = useState(0);

  const k = 1.38e-23;

  useEffect(() => {
    const p = k * temp * (bandwidth * 1e6);
    setPower(p);
  }, [temp, bandwidth]);

  const formatPower = (p) => {
    if (p < 1e-12) return `${(p * 1e15).toFixed(2)} fW`;
    if (p < 1e-9) return `${(p * 1e12).toFixed(2)} pW`;
    return `${(p * 1e9).toFixed(2)} nW`;
  };

  return (
    <div className="chart-card" style={{ gap: '16px' }}>
      <h3 className="chart-card-title">Rayleigh-Jeans Power Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Temperature (K)
            </label>
            <input 
              type="range" min="0.1" max="100" step="0.1" 
              value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>
              <span>{temp} K</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                {temp === 2.725 ? '(CMB)' : ''}
              </span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Bandwidth (MHz)
            </label>
            <input 
              type="range" min="1" max="2000" step="10" 
              value={bandwidth} onChange={(e) => setBandwidth(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--blue)' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 'bold' }}>{bandwidth} MHz</div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '12px', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Received Noise Power (P)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
            {formatPower(power)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            P = k · T · B
          </div>
        </div>
      </div>
      <p className="chart-card-note">
        Calculates the theoretical noise power available in a given bandwidth. 
        Note how small the 2.725K CMB signal is compared to typical thermal noise.
      </p>
    </div>
  );
};
