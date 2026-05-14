import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export const LiveSignalMonitor = () => {
  const [data, setData] = useState([]);
  const [entropy, setEntropy] = useState('...');
  const frameRef = useRef(0);

  useEffect(() => {
    // Initialize data
    const initialData = Array.from({ length: 50 }, (_, i) => ({
      time: i,
      value: -70 + Math.random() * 10,
    }));
    setData(initialData);

    const interval = setInterval(() => {
      frameRef.current += 1;
      
      setData((prev) => {
        const nextValue = -75 + Math.random() * 15 + Math.sin(frameRef.current * 0.2) * 2;
        const nextData = [...prev.slice(1), { time: frameRef.current, value: nextValue }];
        return nextData;
      });

      // Update a mock entropy value
      if (frameRef.current % 10 === 0) {
        const hex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setEntropy(hex);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Live RF Noise Power (Mock)</h3>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          11.250 GHz | 2.4 MSPS
        </div>
      </div>
      
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={[-100, -40]} 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickCount={5}
              label={{ value: 'dBFS', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 9 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="var(--accent)" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              strokeWidth={1.5}
              animationDuration={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Entropy Stream (SHA-3 Conditioned)
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--blue)', wordBreak: 'break-all', lineHeight: 1.2 }}>
          {entropy}...
        </div>
      </div>
    </div>
  );
};
