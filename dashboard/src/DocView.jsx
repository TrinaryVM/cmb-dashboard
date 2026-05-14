/* ═══════════════════════════════════════════════════════════
   DocView — detailed view for a single research document
   ═══════════════════════════════════════════════════════════ */
import {
  NoiseFigureChart,
  EntropyRateChart,
  AltitudeChart,
  NoiseBudgetChart,
  ExtractionMethodChart
} from './Charts.jsx';
import { LiveSignalMonitor } from './SignalSimulator.jsx';
import { ValidationDashboard } from './ValidationDashboard.jsx';
import { PowerCalculator } from './PowerCalculator.jsx';
import { FriisCalculator } from './FriisCalculator.jsx';
import { RadiometerSensitivity } from './RadiometerSensitivity.jsx';
import { SKMonitor } from './SKMonitor.jsx';
import { MuonSimulator } from './MuonSimulator.jsx';
import { VonNeumannSimulator } from './VonNeumannSimulator.jsx';
import { SkyDipInteractive } from './SkyDipInteractive.jsx';
import { EntropyPoolMonitor } from './EntropyPoolMonitor.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as DocContent from './docContent.js';
import './DocView.css';

const CONTENT_MAP = {
  'research_cmb_hardware.md': DocContent.CMB_HARDWARE_CONTENT,
  'research_cmb_signal_processing.md': DocContent.CMB_SIGNAL_PROCESSING_CONTENT,
  'research_cosmic_ray_mrng.md': DocContent.COSMIC_RAY_MRNG_CONTENT,
  'research_crypto_validation.md': DocContent.CRYPTO_VALIDATION_CONTENT
};

const COLOR_MAP = {
  accent: 'var(--accent)',
  amber:  'var(--accent)',
  violet: 'var(--accent)',
  blue:   'var(--accent)',
  green:  'var(--accent)',
  red:    'var(--red)',
};

const GLOW_MAP = {
  accent: 'var(--accent-glow)',
  amber:  'var(--accent-glow)',
  violet: 'var(--accent-glow)',
  blue:   'var(--accent-glow)',
  green:  'var(--accent-glow)',
};

export default function DocView({ doc }) {
  const color = COLOR_MAP[doc.color];
  const glow  = GLOW_MAP[doc.color];

  return (
    <div className="docview fade-in">

      {/* ── Document Header ─────────────────────────────── */}
      <div className="docview-header" style={{ '--doc-color': color, '--doc-glow': glow }}>
        <div className="docview-header-top">
          <span className="docview-icon">{doc.icon}</span>
          <div className="docview-meta">
            <span className={`badge ${doc.badgeClass}`}>{doc.size}</span>
            <span className="docview-sections-badge">{doc.sections} sections</span>
          </div>
        </div>
        <h1 className="docview-title">{doc.title}</h1>
        <p className="docview-desc">{doc.description}</p>
      </div>

      <div className="docview-body">

        {/* ── Key Stats ─────────────────────────────────── */}
        <div className="docview-stats-grid">
          {doc.keyStats.map((s, i) => (
            <div key={i} className="docview-stat" style={{ '--doc-color': color }}>
              <div className="docview-stat-value">{s.value}</div>
              <div className="docview-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Two-column layout (Summary & TOC) ─────────── */}
        <div className="docview-columns">

          {/* Table of Contents */}
          <div className="docview-toc-card">
            <div className="docview-card-title">
              <span>📋</span> Table of Contents
            </div>
            <ol className="docview-toc-list">
              {doc.toc.map((section, i) => (
                <li key={i} className="docview-toc-item">
                  <span className="docview-toc-num">{i + 1}</span>
                  <span className="docview-toc-text">{section}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Key Highlights */}
          <div className="docview-highlights-card">
            <div className="docview-card-title">
              <span>✨</span> Key Highlights
            </div>
            <ul className="docview-highlights-list">
              {doc.highlights.map((h, i) => (
                <li key={i} className="docview-highlight-item" style={{ '--doc-color': color }}>
                  <span className="docview-highlight-dot" style={{ background: color }} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Visualizations ─────────────────────────────── */}
        <div className="docview-viz-section">
          {doc.id === 'signal' && (
            <>
              <LiveSignalMonitor />
              <SKMonitor />
              <VonNeumannSimulator />
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">Entropy Throughput (Simulation)</h3>
                  <div className="badge badge-green" style={{ fontSize: '10px' }}>OPTIMAL</div>
                </div>
                <EntropyRateChart />
                <div className="chart-telemetry-box">
                  <div className="chart-telemetry-label">Processing Pipeline Status</div>
                  <div className="chart-telemetry-value">Von Neumann Yield: 42% | Post-Conditioning: SHA-3</div>
                </div>
              </div>
            </>
          )}
          {doc.id === 'hardware' && (
            <>
              <PowerCalculator />
              <FriisCalculator />
              <RadiometerSensitivity />
              <SkyDipInteractive />
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">LNB Conversion Curve (Simulation)</h3>
                  <div className="badge badge-blue" style={{ fontSize: '10px' }}>CALIBRATED</div>
                </div>
                <NoiseFigureChart />
                <div className="chart-telemetry-box">
                  <div className="chart-telemetry-label">Receiver Calibration Data</div>
                  <div className="chart-telemetry-value">Reference T_amb: 290K | Gain Slope: +0.2 dB/GHz</div>
                </div>
              </div>
            </>
          )}
          {doc.id === 'mrng' && (
            <>
              <MuonSimulator />
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">Cosmic Ray Flux (Mock Data)</h3>
                  <div className="badge badge-blue" style={{ fontSize: '10px' }}>ALTITUDE_ADJUSTED</div>
                </div>
                <AltitudeChart />
              </div>
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">Extraction Efficiency (P1-P4)</h3>
                  <div className="badge badge-amber" style={{ fontSize: '10px' }}>RESEARCH_DATA</div>
                </div>
                <ExtractionMethodChart />
              </div>
            </>
          )}
          {doc.id === 'crypto' && (
            <>
              <ValidationDashboard />
              <EntropyPoolMonitor />
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">System Noise Budget</h3>
                  <div className="badge badge-violet" style={{ fontSize: '10px' }}>THERMAL_ANALYSIS</div>
                </div>
                <NoiseBudgetChart />
                <div className="chart-telemetry-box">
                  <div className="chart-telemetry-label">Major Contributions</div>
                  <div className="chart-telemetry-value">CMB: 2.7K | LNB: 55K | Atmosphere: 10K (Zenith)</div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* ── Research Content (Markdown) ──────────────── */}
        <div className="docview-markdown-container">
          <div className="docview-card-title">
            <span>📖</span> Research Documentation
          </div>
          <div className="docview-markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="markdown-table-wrapper">
                    <table {...props} />
                  </div>
                )
              }}
            >
              {CONTENT_MAP[doc.filename] || "*No documentation content available for this file.*"}
            </ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}
