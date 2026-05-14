/* ═══════════════════════════════════════════════════════════
   Overview Page — project summary, key metrics, timeline
   ═══════════════════════════════════════════════════════════ */
import { NoiseBudgetChart, EntropyRateChart, AltitudeChart } from './Charts.jsx';
import { PowerCalculator } from './PowerCalculator.jsx';
import { PROJECT, DOCS, KEY_METRICS, TIMELINE, XLSX_FILE } from './data.js';
import './Overview.css';

const COLOR_MAP = {
  accent: 'var(--accent)',
  amber: 'var(--accent)',
  violet: 'var(--accent)',
  blue: 'var(--accent)',
  green: 'var(--accent)',
  red: 'var(--red)',
};

const GLOW_MAP = {
  accent: 'var(--accent-glow)',
  amber: 'var(--accent-glow)',
  violet: 'var(--accent-glow)',
  blue: 'var(--accent-glow)',
  green: 'var(--accent-glow)',
  red: 'var(--red-glow)',
};

export default function Overview({ onSelect }) {
  return (
    <div className="overview fade-in">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="overview-hero">
        <div className="hero-badge badge badge-amber" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
          <span>𝌻</span> Fractal Tech Research
        </div>
        <h1 className="hero-title">
          <span className="gradient-text" style={{ background: 'linear-gradient(90deg, var(--text-primary), var(--accent-dim))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{PROJECT.name}</span>
        </h1>
        <p className="hero-subtitle">{PROJECT.description}</p>
        <div className="hero-chips">
          <span className="hero-chip">Radiometry</span>
          <span className="hero-chip">SDR / GNU Radio</span>
          <span className="hero-chip">Entropy Extraction</span>
          <span className="hero-chip">PQC Integration</span>
          <span className="hero-chip">NIST SP 800-90B</span>
        </div>
      </section>

      {/* ── Key Metrics ───────────────────────────────────── */}
      <section className="overview-section">
        <div className="section-header">
          <h2 className="section-title">Key Metrics</h2>
        </div>
        <div className="metrics-grid">
          {KEY_METRICS.map((m, i) => (
            <div
              key={i}
              className="metric-card"
              style={{
                '--card-color': COLOR_MAP[m.color],
                '--card-glow': GLOW_MAP[m.color],
              }}
            >
              <div className="metric-icon">{m.icon}</div>
              <div className="metric-value">{m.value}</div>
              <div className="metric-label">{m.label}</div>
              <div className="metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Research Documents ────────────────────────────── */}
      <section className="overview-section">
        <div className="section-header">
          <h2 className="section-title">Research Documents</h2>
          <span className="section-count">{DOCS.length + 1} files</span>
        </div>
        <div className="docs-grid">
          {DOCS.map((doc) => (
            <button
              key={doc.id}
              id={`overview-doc-${doc.id}`}
              className="doc-card"
              onClick={() => onSelect(doc.id)}
              style={{
                '--card-color': COLOR_MAP[doc.color],
                '--card-glow': GLOW_MAP[doc.color],
              }}
            >
              <div className="doc-card-header">
                <span className="doc-card-icon">{doc.icon}</span>
                <span className={`badge ${doc.badgeClass}`}>{doc.size}</span>
              </div>
              <h3 className="doc-card-title">{doc.title}</h3>
              <p className="doc-card-desc">{doc.description}</p>
              <div className="doc-card-stats">
                <span>{doc.sections} sections</span>
                <span className="doc-card-arrow">Open →</span>
              </div>
            </button>
          ))}

          {/* Spreadsheet card */}
          <button
            className="doc-card doc-card-xlsx"
            onClick={() => onSelect('comparison')}
            style={{ '--card-color': 'var(--red)', '--card-glow': 'var(--red-glow)' }}
          >
            <div className="doc-card-header">
              <span className="doc-card-icon">{XLSX_FILE.icon}</span>
              <span className="badge badge-red">{XLSX_FILE.size}</span>
            </div>
            <h3 className="doc-card-title">{XLSX_FILE.title}</h3>
            <p className="doc-card-desc">{XLSX_FILE.description}</p>
            <div className="doc-card-stats">
              <span>Excel spreadsheet comparison data</span>
              <span className="doc-card-arrow">Open →</span>
            </div>
          </button>
        </div>
      </section>

      {/* ── Pipeline Diagram ──────────────────────────────── */}
      <section className="overview-section">
        <div className="section-header">
          <h2 className="section-title">CMB Entropy Pipeline</h2>
          <span className="section-count">Architecture</span>
        </div>
        <div className="pipeline">
          {[
            { icon: '📡', label: 'Dish / Horn', sub: '10–20 GHz', color: 'amber' },
            { icon: '🔧', label: 'LNB / LNA', sub: '0.5 dB NF, 50–65 dB gain', color: 'amber' },
            { icon: '📻', label: 'RTL-SDR', sub: '2.4 MSPS, 8-bit IQ', color: 'violet' },
            { icon: '⚙️', label: 'GNU Radio', sub: 'FFT, PSD, filtering', color: 'violet' },
            { icon: '🔀', label: 'Von Neumann', sub: 'Debiasing / SHA-3', color: 'blue' },
            { icon: '🔐', label: 'ML-KEM / DRBG', sub: 'PQC key generation', color: 'green' },
          ].map((step, i, arr) => (
            <div key={i} className="pipeline-step-wrap">
              <div
                className="pipeline-step"
                style={{ '--step-color': COLOR_MAP[step.color] }}
              >
                <div className="pipeline-step-icon">{step.icon}</div>
                <div className="pipeline-step-label">{step.label}</div>
                <div className="pipeline-step-sub">{step.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="pipeline-arrow" aria-hidden="true">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Visualizations ────────────────────────────── */}
      <section className="overview-section">
        <div className="section-header">
          <h2 className="section-title">Key Visualizations</h2>
          <span className="section-count">Research data trends</span>
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-card-title">System Noise Temperature Budget</h3>
            <NoiseBudgetChart />
            <p className="chart-card-note">Relative contributions to T_sys in a typical amateur Ku-band setup.</p>
          </div>
          <div className="chart-card">
            <h3 className="chart-card-title">Entropy Rate by Configuration</h3>
            <EntropyRateChart />
            <p className="chart-card-note">Measured throughput (Mbps) after Von Neumann debiasing.</p>
          </div>
          <div className="chart-card">
            <h3 className="chart-card-title">Cosmic Ray Rate vs. Altitude</h3>
            <AltitudeChart />
            <p className="chart-card-note">Normalized detection rate increase relative to sea level.</p>
          </div>
          <PowerCalculator />
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────── */}
      <section className="overview-section">
        <div className="section-header">
          <h2 className="section-title">Research Timeline</h2>
          <span className="section-count">Key milestones</span>
        </div>
        <div className="timeline">
          <div className="timeline-line" />
          {TIMELINE.map((item, i) => (
            <div key={i} className="timeline-item">
              <div
                className="timeline-dot"
                style={{
                  '--dot-color': COLOR_MAP[item.type],
                  '--dot-glow': GLOW_MAP[item.type]
                }}
              />
              <div className="timeline-content">
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-event">{item.event}</div>
                <div className="timeline-sub">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Build Paths ─────────────────────────────────────── */}
      <section className="overview-section">
        <div className="section-header">
          <h2 className="section-title">Hardware Build Paths</h2>
          <span className="section-count">From hobbyist to research-grade</span>
        </div>
        <div className="build-grid">
          {[
            {
              level: 'Entry-Level',
              cost: '$65',
              hardware: 'RTL-SDR + Ku-LNB',
              rate: '250 Kbps',
              target: 'Amateur radio astronomy & casual entropy seeding.',
              color: 'amber'
            },
            {
              level: 'Advanced',
              cost: '$220',
              hardware: '60cm Dish + TCXO LNB + Airspy',
              rate: '5 Mbps',
              target: 'High-assurance server seeding & research labs.',
              color: 'violet'
            },
            {
              level: 'Research-Grade',
              cost: '$1000+',
              hardware: 'Corrugated Horn + Cryo LNA + BladeRF',
              rate: '20+ Mbps',
              target: 'Post-Quantum mission critical infrastructure.',
              color: 'blue'
            }
          ].map((b, i) => (
            <div key={i} className="build-card" style={{ '--card-color': COLOR_MAP[b.color] }}>
              <div className="build-level">{b.level}</div>
              <div className="build-cost">{b.cost}</div>
              <div className="build-hw">{b.hardware}</div>
              <div className="build-rate">
                <span className="pulse-dot" />
                {b.rate}
              </div>
              <div className="build-target">{b.target}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Conclusion ─────────────────────────────────────── */}
      <section className="overview-section" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '40px', marginTop: '60px' }}>
        <div className="conclusion-grid">
          <div className="conclusion-main">
            <h2 className="hero-title" style={{ fontSize: '32px', marginBottom: '20px' }}>Final Research Verdict</h2>
            <p className="hero-subtitle">
              After extensive analysis of both CMB-based radiometry and cosmic-ray MRNG,
              the <strong>TrinaryVM</strong> research concludes that CMB radiation offers a
              superior entropy density (approx. 10⁶ times greater) and more robust statistical
              isotropy than smartphone-based cosmic ray detection.
            </p>
            <div className="hero-chips">
              <span className="hero-chip">Quantum Proven</span>
              <span className="hero-chip">PQC Ready</span>
              <span className="hero-chip">High-Throughput</span>
            </div>
          </div>
          <div className="conclusion-stat-card">
            <div className="metric-label">Recommended Strategy</div>
            <div className="metric-value" style={{ fontSize: '24px', margin: '12px 0' }}>SDR-CMB-SHA3</div>
            <p className="metric-sub">
              A 11.2 GHz radiometer chain with NIST SP 800-90B conditioning provides
              the optimal balance of cost, complexity, and security for next-generation
              cryptographic systems.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
