import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';

import {
  SYSTEM_NOISE_BUDGET,
  LNB_NOISE_CONVERSION,
  ENTROPY_RATES,
  COSMIC_RAY_ALTITUDE,
  DETECTED_MUONS_PER_DAY,
  BIT_EXTRACTION_METHODS,
} from './visualizationData.js';

const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass" style={{ padding: '10px', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '12px' }}>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ margin: 0, color: payload[0].color || 'var(--accent)' }}>
          {payload[0].value} {suffix}
        </p>
      </div>
    );
  }
  return null;
};

export const NoiseBudgetChart = () => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={SYSTEM_NOISE_BUDGET}
          dataKey="temp"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          stroke="none"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {SYSTEM_NOISE_BUDGET.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip suffix="K" />} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const EntropyRateChart = () => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <BarChart data={ENTROPY_RATES} layout="vertical" margin={{ left: 20, right: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
        <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
        <YAxis dataKey="device" type="category" stroke="var(--text-muted)" fontSize={12} width={80} />
        <Tooltip content={<CustomTooltip suffix="Mbps" />} />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
          {ENTROPY_RATES.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const AltitudeChart = () => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <AreaChart data={COSMIC_RAY_ALTITUDE} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <Tooltip content={<CustomTooltip suffix="x ground" />} />
        <Area type="monotone" dataKey="rate" stroke="var(--blue)" fillOpacity={1} fill="url(#colorRate)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const NoiseFigureChart = () => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <LineChart data={LNB_NOISE_CONVERSION}>
        <XAxis dataKey="nf" stroke="var(--text-muted)" fontSize={12} label={{ value: 'Noise Figure (dB)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} />
        <YAxis stroke="var(--text-muted)" fontSize={12} label={{ value: 'Temp (K)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10 }} />
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <Tooltip content={<CustomTooltip suffix="K" />} />
        <Line type="monotone" dataKey="temp" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const ExtractionMethodChart = () => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <BarChart data={BIT_EXTRACTION_METHODS} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis dataKey="method" stroke="var(--text-muted)" fontSize={11} />
        <YAxis stroke="var(--text-muted)" fontSize={11} label={{ value: 'Bits/Event', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip suffix="bits" />} />
        <Bar dataKey="bits" radius={[4, 4, 0, 0]}>
          {BIT_EXTRACTION_METHODS.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
