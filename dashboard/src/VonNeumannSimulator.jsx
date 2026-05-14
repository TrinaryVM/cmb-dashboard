import React, { useState, useEffect } from 'react';

export const VonNeumannSimulator = () => {
  const [bias, setBias] = useState(0.7); 
  const [rawBits, setRawBits] = useState([]);
  const [cleanBits, setCleanBits] = useState([]);

  const generateBits = () => {
    const raw = [];
    const clean = [];
    for (let i = 0; i < 40; i += 2) {
      const b1 = Math.random() < bias ? 1 : 0;
      const b2 = Math.random() < bias ? 1 : 0;
      raw.push(b1, b2);
      if (b1 === 0 && b2 === 1) clean.push(0);
      else if (b1 === 1 && b2 === 0) clean.push(1);
    }
    setRawBits(raw);
    setCleanBits(clean);
  };

  useEffect(() => {
    generateBits();
    const interval = setInterval(generateBits, 2000);
    return () => clearInterval(interval);
  }, [bias]);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Von Neumann Debiasing (Simulation)</h3>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          ALGO: WHITEN_VN_01
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>SOURCE BIAS (P=1)</label>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{(bias * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range" min="0.1" max="0.9" step="0.05" value={bias} 
          onChange={(e) => setBias(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Raw Biased Stream</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            {rawBits.map((b, i) => (
              <span key={i} style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: b ? 'rgba(237, 237, 245, 0.1)' : 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '2px', color: b ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '10px' }}>▼ PROCESS ▼</div>
        </div>

        <div style={{ background: 'rgba(var(--accent-rgb), 0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--accent-dim)' }}>
          <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between' }}>
            <span>Conditioned Output</span>
            <span>Yield: {((cleanBits.length / rawBits.length) * 100).toFixed(0)}%</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            {cleanBits.map((b, i) => (
              <span key={i} style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent)', color: '#000', borderRadius: '2px', fontWeight: 'bold' }}>
                {b}
              </span>
            ))}
            {cleanBits.length === 0 && <span style={{ color: 'var(--red)', fontStyle: 'italic', fontSize: '9px' }}>Generating entropy...</span>}
          </div>
        </div>
      </div>

      <p className="chart-card-note" style={{ marginTop: '16px' }}>
        Processes bit pairs: (0,1)→0, (1,0)→1, discard identicals. Guarantees unbiased output at the cost of throughput.
      </p>
    </div>
  );
};
