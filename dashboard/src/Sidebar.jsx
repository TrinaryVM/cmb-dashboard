/* ═══════════════════════════════════════════════════════════
   Sidebar Navigation
   ═══════════════════════════════════════════════════════════ */
import { PROJECT, DOCS, XLSX_FILE } from './data.js';
import { useState, useEffect } from 'react';
import './Sidebar.css';

const COLOR_MAP = {
  accent: 'var(--accent)',
  amber: 'var(--accent)',
  violet: 'var(--accent)',
  blue: 'var(--accent)',
  green: 'var(--accent)',
  red: 'var(--red)',
};

export default function Sidebar({ activeId, onSelect, isOpen }) {
  const [entropy, setEntropy] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setEntropy(hex);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className={`sidebar glass ${isOpen ? 'is-open' : ''}`} role="navigation" aria-label="Document navigation">
      {/* Logo / Brand */}
      <div className="sidebar-brand">
        <div>
          <span><img src="/fractaltechlogo.svg" width="100%" alt="fractaltechlogo" /></span>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Nav label */}
      <div className="sidebar-section-label">Research Files</div>

      {/* Document links */}
      <nav className="sidebar-nav">
        {/* Overview / Home */}
        <button
          id="nav-overview"
          className={`sidebar-item ${activeId === 'overview' ? 'active' : ''}`}
          onClick={() => onSelect('overview')}
          aria-current={activeId === 'overview' ? 'page' : undefined}
        >
          <span className="sidebar-item-icon" style={{ color: 'var(--accent)' }}>🏠</span>
          <span className="sidebar-item-label">Overview</span>
        </button>

        {DOCS.map((doc) => (
          <button
            key={doc.id}
            id={`nav-${doc.id}`}
            className={`sidebar-item ${activeId === doc.id ? 'active' : ''}`}
            onClick={() => onSelect(doc.id)}
            aria-current={activeId === doc.id ? 'page' : undefined}
            style={{ '--item-color': COLOR_MAP[doc.color] }}
          >
            <span className="sidebar-item-icon">{doc.icon}</span>
            <span className="sidebar-item-label">{doc.title}</span>
            <span className="sidebar-item-size">{doc.sections}§</span>
          </button>
        ))}

        <div className="sidebar-divider" style={{ margin: '8px 0' }} />

        {/* Spreadsheet */}
        <button
          id="nav-comparison"
          className={`sidebar-item ${activeId === 'comparison' ? 'active' : ''}`}
          onClick={() => onSelect('comparison')}
          aria-current={activeId === 'comparison' ? 'page' : undefined}
          style={{ '--item-color': 'var(--red)' }}
        >
          <span className="sidebar-item-icon">{XLSX_FILE.icon}</span>
          <span className="sidebar-item-label truncate">{XLSX_FILE.title}</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          <span className="pulse-dot" aria-hidden="true" />
          <span>Active Research</span>
        </div>
        <div className="sidebar-footer-version">v{PROJECT.version}</div>
      </div>
    </aside>
  );
}
