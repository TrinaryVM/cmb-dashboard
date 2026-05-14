import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const SKMonitor = () => {
  const [data, setData] = useState([]);
  const [isRfi, setIsRfi] = useState(false);
  const frameRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      frameRef.current += 1;
      
      const base = 1.0;
      const noise = (Math.random() - 0.5) * 0.05;
      const rfi = frameRef.current % 30 > 25 ? Math.random() * 0.8 + 0.5 : 0;
      const currentSk = base + noise + rfi;
      
      setIsRfi(currentSk > 1.2 || currentSk < 0.8);

      setData(prev => {
        const newData = [...prev, { time: frameRef.current, sk: currentSk }];
        if (newData.length > 50) return newData.slice(1);
        return newData;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title" style={{ '--pulse-color': isRfi ? 'var(--red)' : 'var(--accent)' }}>
          Spectral Kurtosis (Mock Data)
        </h3>
        <div className={`badge ${isRfi ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '10px' }}>
          {isRfi ? '⚠️ RFI DETECTED' : '✓ GAUSSIAN'}
        </div>
      </div>
      
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isRfi ? 'var(--red)' : 'var(--accent)'} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isRfi ? 'var(--red)' : 'var(--accent)'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={[0, 2.5]} 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickCount={4}
              label={{ value: 'SK Value', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 9 }}
            />
            <ReferenceLine y={1.0} stroke="var(--text-muted)" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="sk" 
              stroke={isRfi ? 'var(--red)' : 'var(--accent)'} 
              fillOpacity={1} 
              fill="url(#colorSk)" 
              strokeWidth={1.5}
              animationDuration={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Gaussianity Metric
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          Current SK: {data.length > 0 ? data[data.length-1].sk.toFixed(4) : '0.0000'} | Threshold: 1.0 ± 0.2
        </div>
      </div>
      
      <p className="chart-card-note" style={{ marginTop: '12px' }}>
        SK ≈ 1.0 confirms thermal/quantum noise. Departures indicate non-stationary RFI 
        which must be filtered out for entropy quality.
      </p>
    </div>
  );
};
