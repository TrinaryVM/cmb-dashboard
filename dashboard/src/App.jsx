/* ═══════════════════════════════════════════════════════════
   App — root layout: sidebar + main content area
   ═══════════════════════════════════════════════════════════ */
import { useState, useEffect, useRef } from 'react';
import Starfield from './Starfield.jsx';
import Sidebar from './Sidebar.jsx';
import Overview from './Overview.jsx';
import DocView from './DocView.jsx';
import { PROJECT, DOCS, XLSX_FILE } from './data.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, LabelList
} from 'recharts';
import { RNG_COMPARISON_DATA } from './visualizationData.js';
import './App.css';

export default function App() {
  const [activeId, setActiveId] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  // Scroll to top on navigation
  useEffect(() => {
    const scrollHandler = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
    return () => clearTimeout(scrollHandler);
  }, [activeId]);

  const handleSelect = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  // Resolve active doc
  const activeDoc = DOCS.find((d) => d.id === activeId) ?? null;
  const isOverview = activeId === 'overview';
  const isComparison = activeId === 'comparison';

  return (
    <>
      <Starfield />

      <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar activeId={activeId} onSelect={handleSelect} isOpen={sidebarOpen} />

        <div className="app-main">
          <header className="app-topbar glass">
            <div className="topbar-left">
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <span className="menu-icon">☰</span>
              </button>
              <div className="topbar-breadcrumb">
                <span className="topbar-crumb-root">Fractal Tech</span>
                <span className="topbar-crumb-sep" aria-hidden="true">/</span>
                <span className="topbar-crumb-page">
                  {isOverview ? 'Overview' :
                    isComparison ? XLSX_FILE.title :
                      activeDoc ? activeDoc.title : ''}
                </span>
              </div>
            </div>

            <div className="topbar-right">
              <div className="topbar-status">
                <span className="pulse-dot" aria-hidden="true" />
                <span>CMB Entropy Dashboard</span>
              </div>
            </div>
          </header>

          <main id="main-content" className="app-content" tabIndex="-1" ref={scrollRef}>
            {isOverview && <Overview onSelect={setActiveId} />}

            {isComparison && (
              <div className="comparison-view fade-in">
                <div className="comparison-header">
                  <span style={{ fontSize: '32px' }}>{XLSX_FILE.icon}</span>
                  <div>
                    <h2 className="comparison-title">{XLSX_FILE.title}</h2>
                    <p className="comparison-sub">{XLSX_FILE.description}</p>
                  </div>
                </div>

                <div className="docview-columns">
                  <div className="chart-card">
                    <div className="chart-card-header">
                      <h3 className="chart-card-title">Throughput (bits/sec) — Log Scale</h3>
                      <div className="badge badge-amber" style={{ fontSize: '10px' }}>ARCHITECTURAL_DATA</div>
                    </div>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={RNG_COMPARISON_DATA} layout="vertical" margin={{ left: 40, right: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                          <XAxis type="number" scale="log" domain={[1e-7, 1e7]} hide />
                          <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={100} />
                          <Tooltip
                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                            formatter={(val) => val < 1 ? `${val.toFixed(8)}` : val.toLocaleString()}
                          />
                          <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                            {RNG_COMPARISON_DATA.map((entry, index) => (
                              <Cell key={index} fill={entry.name.includes('CMB') ? 'var(--accent)' : 'var(--accent-dim)'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-telemetry-box">
                      <div className="chart-telemetry-label">Entropy Yield Analysis</div>
                      <div className="chart-telemetry-value">CMB: 2.5 Mbit/s (Target) | MRNG: 0.000008 bit/s (Measured)</div>
                    </div>
                  </div>

                  <div className="chart-card">
                    <div className="chart-card-header">
                      <h3 className="chart-card-title">Cost vs. Throughput Analysis</h3>
                      <div className="badge badge-blue" style={{ fontSize: '10px' }}>ROI_METRIC</div>
                    </div>
                    <div style={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 100, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                          <XAxis type="number" dataKey="cost" name="Hardware Cost" unit="$" stroke="var(--text-muted)" />
                          <YAxis type="number" dataKey="rate" name="Throughput" unit=" bps" stroke="var(--text-muted)" scale="log" domain={[1, 1e7]} />
                          <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                          />
                          <Scatter name="RNG Methods" data={RNG_COMPARISON_DATA} fill="var(--accent)">
                            <LabelList dataKey="name" position="right" fill="var(--text-muted)" fontSize={11} offset={10} />
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-telemetry-box">
                      <div className="chart-telemetry-label">Economic Viability Report</div>
                      <div className="chart-telemetry-value">Efficiency Leader: CMB Radiometer | Cost Floor: Smartphone MRNG ($0)</div>
                    </div>
                  </div>
                </div>

                <div className="docview-highlights-card">
                  <div className="docview-card-title">Detailed Architectural Comparison</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                          <th style={{ padding: '12px' }}>Dimension</th>
                          <th style={{ padding: '12px' }}>CMB Radiometer</th>
                          <th style={{ padding: '12px' }}>Smartphone MRNG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { dim: 'Physical Source', cmb: 'Cosmic Microwave Background (Big Bang relic)', mrng: 'Cosmic ray muons (hadronic showers)' },
                          { dim: 'Entropy Rate', cmb: '5–19 Mbps (high-rate continuous)', mrng: '~0.028 bits / hour (extremely low)' },
                          { dim: 'Latency', cmb: 'Milliseconds (real-time stream)', mrng: 'Hours/Days (stochastic arrival)' },
                          { dim: 'Hardware Cost', cmb: '$65–$2,000 (Dish + SDR)', mrng: '$0 (Existing smartphone)' },
                          { dim: 'NIST Pass Rate', cmb: '98.9% (Chapman 2016)', mrng: '100% (Kutschera 2023)' },
                          { dim: 'PQC Readiness', cmb: 'Primary seed for ML-KEM', mrng: 'Pool supplement only' },
                        ].map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px', fontWeight: '700' }}>{row.dim}</td>
                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.cmb}</td>
                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.mrng}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="docview-highlights-card">
                  <div className="docview-card-title">Hardware Tiers (from Workbook)</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-strong)', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Method</th>
                          <th style={{ padding: '12px' }}>Setup Complexity</th>
                          <th style={{ padding: '12px' }}>Best Use Case</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RNG_COMPARISON_DATA.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{r.name}</td>
                            <td style={{ padding: '12px' }}>{r.setup}</td>
                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                              {r.name.includes('CMB') ? 'Continuous high-rate CSPRNG' :
                                r.name.includes('MRNG') ? 'Entropy seed injection' :
                                  r.name.includes('Intel') ? 'Hardware fallback' : 'Specialized HSM'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {!isOverview && !isComparison && activeDoc && (
              <DocView doc={activeDoc} />
            )}
          </main>

          <footer className="app-footer">
            <div className="footer-content">
              <span>© 2026 FRACTAL TECH CORP</span>
              <span>Version {PROJECT.version}</span>
              <span>{PROJECT.name}</span>
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .comparison-view, .docview, .overview { padding: 20px 16px 48px; }
          .hero-title { font-size: 36px; }
        }
      `}</style>
    </>
  );
}
