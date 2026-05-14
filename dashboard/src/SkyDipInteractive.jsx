import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const SkyDipInteractive = () => {
  const [elevation, setElevation] = useState(90); 
  const [data, setData] = useState([]);

  useEffect(() => {
    const T_cmb = 2.725;
    const T_gal = 1.5;
    const T_lnb = 55;
    const T_atm_zenith = 10;
    
    const curve = [];
    for (let el = 10; el <= 90; el += 5) {
      const rad = (el * Math.PI) / 180;
      const t_atm = T_atm_zenith / Math.sin(rad);
      const t_sys = T_cmb + T_gal + T_lnb + t_atm;
      curve.push({ el, t_sys });
    }
    setData(curve);
  }, []);

  const calculateTsys = (el) => {
    const rad = (el * Math.PI) / 180;
    return (2.725 + 1.5 + 55 + (10 / Math.sin(rad))).toFixed(2);
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Sky-Dip Calibration (Simulation)</h3>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          SECCHIA-H | 11.2 GHz
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ANTENNA ELEVATION</label>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{elevation}°</span>
        </div>
        <input 
          type="range" min="10" max="90" step="1" value={elevation} 
          onChange={(e) => setElevation(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
        <div className="docview-stat" style={{ flex: 1, padding: '12px' }}>
          <div className="docview-stat-value" style={{ fontSize: '18px' }}>{calculateTsys(elevation)} K</div>
          <div className="docview-stat-label">System Temperature (T_sys)</div>
        </div>
        <div style={{ width: '100px', height: '60px', border: '1px solid var(--border-subtle)', borderRadius: '4px', position: 'relative', overflow: 'hidden', background: '#000' }}>
          <div style={{ 
            position: 'absolute', bottom: '0', left: '50%', width: '2px', height: '100%', background: 'var(--accent)', 
            transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${90 - elevation}deg)`,
            transition: 'transform 0.3s ease-out'
          }}>
            <div style={{ width: '20px', height: '10px', background: 'var(--accent)', borderRadius: '10px 10px 0 0', position: 'absolute', top: 0, left: '-9px' }}></div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '1px', background: 'var(--text-muted)' }}></div>
        </div>
      </div>

      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTsys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="el" stroke="var(--text-muted)" fontSize={10} label={{ value: 'Elevation (°)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 9 }} />
            <YAxis stroke="var(--text-muted)" fontSize={10} domain={[60, 150]} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }} />
            <ReferenceLine x={elevation} stroke="var(--accent)" strokeDasharray="5 5" />
            <Area type="monotone" dataKey="t_sys" stroke="var(--accent)" fill="url(#colorTsys)" strokeWidth={1.5} animationDuration={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-card-note" style={{ marginTop: '16px' }}>
        Tipping the antenna increases the path length through the atmosphere (secant law). 
        Used to calibrate LNB noise floor isolated from CMB.
      </p>
    </div>
  );
};
