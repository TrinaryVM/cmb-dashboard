import React, { useState, useEffect } from 'react';
import { NIST_STS_TESTS, PQC_ALGORITHMS } from './visualizationData.js';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip, RadarChart as RC, Cell
} from 'recharts';

export const ValidationDashboard = () => {
  const [activeTab, setActiveTab] = useState('nist');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [keyLog, setKeyLog] = useState([]);

  const simulateKeyGen = (alg) => {
    setGeneratingKey(true);
    setKeyLog([]);
    const steps = [
      `Initializing ${alg}...`,
      `Requesting 32 bytes from TRNG pool...`,
      `Conditioning with SHA3-256...`,
      `Seeding HMAC_DRBG (SP 800-90A)...`,
      `Running NTT transform...`,
      `Generating Public Key (A, t)...`,
      `Generating Secret Key (s)...`,
      `Keypair generation SUCCESS.`
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setKeyLog(prev => [...prev, step]);
        if (i === steps.length - 1) setGeneratingKey(false);
      }, i * 600);
    });
  };

  return (
    <div className="validation-dashboard chart-card" style={{ gap: '20px' }}>
      <div className="dashboard-tabs">
        <button 
          onClick={() => setActiveTab('nist')}
          className={`tab-btn ${activeTab === 'nist' ? 'active' : ''}`}
        >
          NIST SP 800-22 Results
        </button>
        <button 
          onClick={() => setActiveTab('pool')}
          className={`tab-btn ${activeTab === 'pool' ? 'active' : ''}`}
        >
          Crypto Standards
        </button>
        <button 
          onClick={() => setActiveTab('pqc')}
          className={`tab-btn ${activeTab === 'pqc' ? 'active' : ''}`}
        >
          PQC Integration
        </button>
      </div>

      {activeTab === 'nist' && (
        <div className="fade-in">
          <h3 className="chart-card-title">Statistical Test Suite (Simulation)</h3>
          <div className="dashboard-grid" style={{ marginTop: '16px' }}>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={NIST_STS_TESTS}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="id" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Radar
                    name="P-Value"
                    dataKey="p"
                    stroke="var(--accent)"
                    fill="var(--accent)"
                    fillOpacity={0.4}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="nist-test-list" style={{ fontSize: '11px', overflowY: 'auto', maxHeight: '300px', paddingRight: '10px' }}>
              {NIST_STS_TESTS.map(test => (
                <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{test.id}. {test.name}</span>
                  <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>{test.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="chart-card-note" style={{ marginTop: '12px' }}>
            Radar plot shows P-values for 10^7 bits of SHA3-conditioned CMB entropy. 
            All tests pass with p &gt; 0.01.
          </p>
        </div>
      )}

      {activeTab === 'pool' && (
        <div className="fade-in">
          <h3 className="chart-card-title">NIST SP 800-90A DRBG Architectures</h3>
          <p className="chart-card-note" style={{ marginBottom: '16px' }}>
            Comparing deterministic random bit generators for high-assurance seeding.
          </p>

          <div className="comparison-table-wrap" style={{ fontSize: '11px', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ padding: '10px' }}>Mechanism</th>
                  <th style={{ padding: '10px' }}>Based On</th>
                  <th style={{ padding: '10px' }}>Security Strength</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-secondary)' }}>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>HMAC_DRBG</td>
                  <td style={{ padding: '10px' }}>HMAC-SHA256</td>
                  <td style={{ padding: '10px' }}>256 bits</td>
                  <td style={{ padding: '10px' }}><span className="badge badge-green">Recommended</span></td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>Hash_DRBG</td>
                  <td style={{ padding: '10px' }}>SHA-512</td>
                  <td style={{ padding: '10px' }}>256 bits</td>
                  <td style={{ padding: '10px' }}><span className="badge badge-blue">Standard</span></td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>CTR_DRBG</td>
                  <td style={{ padding: '10px' }}>AES-256</td>
                  <td style={{ padding: '10px' }}>256 bits</td>
                  <td style={{ padding: '10px' }}><span className="badge badge-blue">Standard</span></td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>Dual_EC_DRBG</td>
                  <td style={{ padding: '10px' }}>Elliptic Curves</td>
                  <td style={{ padding: '10px' }}>-</td>
                  <td style={{ padding: '10px' }}><span className="badge badge-red">Deprecated</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="chart-telemetry-box" style={{ marginTop: '20px' }}>
            <div className="chart-telemetry-label">Seeding Recommendation</div>
            <div className="chart-telemetry-value">
              Use HMAC_DRBG with 256-bit entropy input from CMB radiometer for Post-Quantum readiness.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pqc' && (
        <div className="fade-in">
          <h3 className="chart-card-title">liboqs Key Generation (Simulation)</h3>
          <div className="dashboard-grid" style={{ marginTop: '16px' }}>
            <div className="pqc-alg-grid" style={{ display: 'grid', gap: '10px' }}>
              {PQC_ALGORITHMS.map(alg => (
                <button 
                  key={alg.id}
                  className={`tab-btn ${generatingKey ? '' : 'active'}`}
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', padding: '12px', opacity: generatingKey ? 0.5 : 1 }}
                  disabled={generatingKey}
                  onClick={() => simulateKeyGen(alg.id)}
                >
                  <span style={{ fontWeight: 'bold' }}>{alg.id}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{alg.type}</span>
                </button>
              ))}
            </div>

            <div style={{ background: '#000', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px', height: '260px', overflowY: 'auto' }}>
              <div style={{ color: 'var(--accent)', marginBottom: '8px', borderBottom: '1px solid var(--accent-dim)', paddingBottom: '4px' }}>
                TERMINAL Output [PQ_KEM_GEN]
              </div>
              {keyLog.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px', color: log.includes('SUCCESS') ? 'var(--green)' : 'var(--text-secondary)' }}>
                  <span style={{ opacity: 0.5 }}>[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
              {generatingKey && <div className="blink" style={{ color: 'var(--accent)' }}>_</div>}
              {keyLog.length === 0 && !generatingKey && <div style={{ color: 'var(--text-muted)' }}>Select an algorithm to simulate key generation...</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
