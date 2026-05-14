import React, { useState, useEffect, useRef } from 'react';

export const MuonSimulator = () => {
  const canvasRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [totalBits, setTotalBits] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [isCapturing, setIsCapturing] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const drawGrid = () => {
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 0, W, H);
      
      ctx.strokeStyle = '#111218';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x <= W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    };

    const triggerMuon = () => {
      if (!isCapturing) return;
      const type = Math.random() > 0.3 ? 'track' : (Math.random() > 0.5 ? 'spot' : 'worm');
      const startX = Math.random() * W;
      const startY = Math.random() * H;
      const length = type === 'track' ? Math.random() * 60 + 20 : (type === 'spot' ? 5 : Math.random() * 40 + 10);
      const angle = Math.random() * Math.PI * 2;
      
      const newEvent = {
        id: Date.now(),
        type,
        x: Math.round(startX / 20) * 20,
        y: Math.round(startY / 20) * 20,
        timestamp: Date.now(),
        bits: type === 'track' ? 8 : 4
      };

      setLastEvent(newEvent);
      setTotalBits(prev => prev + newEvent.bits);

      let frame = 0;
      const animate = () => {
        if (frame > 25) return;
        drawGrid();
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'var(--accent)';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        if (type === 'track') {
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
        } else if (type === 'spot') {
          ctx.arc(startX, startY, 4, 0, Math.PI * 2);
        } else {
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(startX + 20, startY - 10, startX + 10, startY + 20, startX + length, startY + length);
        }
        ctx.stroke();
        frame++;
        requestAnimationFrame(animate);
      };
      animate();
    };

    drawGrid();
    const interval = setInterval(() => {
      if (Math.random() > 0.7) triggerMuon();
    }, 1200);

    return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title" style={{ '--pulse-color': isCapturing ? 'var(--accent)' : 'var(--text-muted)' }}>
          Muon Event Simulator (Mock)
        </h3>
        <div className={`badge ${isCapturing ? 'badge-blue' : 'badge-red'}`} style={{ fontSize: '10px' }}>
          {isCapturing ? 'LIVE SENSOR' : 'SENSOR PAUSED'}
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <canvas ref={canvasRef} width={600} height={600} style={{ width: '100%', height: '100%', display: 'block' }} />
        
        {lastEvent && (
          <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(0,0,0,0.85)', padding: '12px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', border: '1px solid var(--accent-dim)', color: 'white', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px solid var(--accent-dim)', paddingBottom: '2px' }}>CAPTURED_EVENT_{lastEvent.id.toString().slice(-4)}</div>
            <div style={{ opacity: 0.8, marginBottom: '2px' }}>TYPE: {lastEvent.type.toUpperCase()}</div>
            <div style={{ opacity: 0.8, marginBottom: '2px' }}>COORD: X{lastEvent.x} Y{lastEvent.y}</div>
            <div style={{ opacity: 0.8, marginBottom: '2px' }}>TS: {lastEvent.timestamp}</div>
            <div style={{ color: 'var(--accent)', marginTop: '6px', fontSize: '11px' }}>+ {lastEvent.bits} ENTROPY BITS</div>
          </div>
        )}

        <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
          DETECTOR_GRID_600x600_CMOS
        </div>
      </div>

      <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Muon Harvest Telemetry
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total Entropy:</span>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{totalBits} bits</span>
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="docview-stat">
          <div className="docview-stat-value" style={{ fontSize: '14px' }}>~12 / Day</div>
          <div className="docview-stat-label">Theoretical Yield</div>
        </div>
        <div className="docview-stat">
          <div className="docview-stat-value" style={{ fontSize: '14px' }}>Sea Level</div>
          <div className="docview-stat-label">Ambient Baseline</div>
        </div>
      </div>

      <p className="chart-card-note" style={{ marginTop: '12px' }}>
        Simulates muon detection on a CMOS grid. Arrival time (P1), spatial coordinates (P2), and outlier distance (P4) are harvested for entropy. 
      </p>
    </div>
  );
};
