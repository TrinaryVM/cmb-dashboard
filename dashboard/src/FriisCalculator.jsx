import React, { useState, useEffect } from 'react';

export const FriisCalculator = () => {
  const [nf1, setNf1] = useState(0.7); // Stage 1 NF (dB)
  const [gain1, setGain1] = useState(55); // Stage 1 Gain (dB)
  const [nf2, setNf2] = useState(3.5); // Stage 2 NF (dB)
  
  const [t1, setT1] = useState(0);
  const [t2, setT2] = useState(0);
  const [tTotal, setTTotal] = useState(0);

  useEffect(() => {
    // Convert NF dB to linear
    const f1 = Math.pow(10, nf1 / 10);
    const f2 = Math.pow(10, nf2 / 10);
    const g1 = Math.pow(10, gain1 / 10);

    const temp1 = 290 * (f1 - 1);
    const temp2 = 290 * (f2 - 1);
    const total = temp1 + (temp2 / g1);

    setT1(temp1);
    setT2(temp2);
    setTTotal(total);
  }, [nf1, gain1, nf2]);

  return (
    <div className="chart-card" style={{ gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="chart-card-title">Friis Cascade Calculator</h3>
        <span className="badge badge-amber">Stage 1: LNB → Stage 2: SDR</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LNB Noise Figure (dB)</label>
            <input 
              type="range" min="0.1" max="5.0" step="0.1" 
              value={nf1} onChange={(e) => setNf1(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>{nf1} dB ({t1.toFixed(1)} K)</div>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LNB Gain (dB)</label>
            <input 
              type="range" min="10" max="70" step="1" 
              value={gain1} onChange={(e) => setGain1(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--green)' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>{gain1} dB</div>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SDR Noise Figure (dB)</label>
            <input 
              type="range" min="1.0" max="15.0" step="0.5" 
              value={nf2} onChange={(e) => setNf2(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--blue)' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 'bold' }}>{nf2} dB ({t2.toFixed(1)} K)</div>
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
            System Noise Temperature (T_sys)
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {tTotal.toFixed(2)} K
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
            T = T₁ + T₂/G₁
          </div>
          <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '8px', opacity: 0.8 }}>
            {gain1 >= 50 ? 'LNB Gain effectively masks SDR noise' : 'Low gain increases noise contribution'}
          </div>
        </div>
      </div>
      <p className="chart-card-note">
        This calculator demonstrates why a high-gain LNB (Stage 1) makes the high noise figure of a cheap RTL-SDR (Stage 2) practically irrelevant for CMB detection.
      </p>
    </div>
  );
};
