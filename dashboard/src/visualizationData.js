// ═══════════════════════════════════════════════════════════
//  Visualization Data — extracted from research .md files
// ═══════════════════════════════════════════════════════════

export const SYSTEM_NOISE_BUDGET = [
  { name: 'CMB', temp: 2.725, color: 'var(--accent)' },
  { name: 'Atmosphere', temp: 10, color: 'var(--violet)' },
  { name: 'Galactic', temp: 3, color: 'var(--blue)' },
  { name: 'Spillover', temp: 12, color: 'var(--red)' },
  { name: 'LNB Noise', temp: 57, color: 'var(--text-muted)' },
];

export const LNB_NOISE_CONVERSION = [
  { nf: 0.1, temp: 6.8 },
  { nf: 0.2, temp: 13.9 },
  { nf: 0.3, temp: 21.2 },
  { nf: 0.4, temp: 28.7 },
  { nf: 0.5, temp: 36.5 },
  { nf: 0.6, temp: 44.4 },
  { nf: 0.7, temp: 52.6 },
  { nf: 0.8, temp: 61.1 },
  { nf: 0.9, temp: 69.8 },
  { nf: 1.0, temp: 78.8 },
];

export const ENTROPY_RATES = [
  { device: 'RTL-SDR', rate: 5.7, color: 'var(--accent)' },
  { device: 'Airspy R2', rate: 40, color: 'var(--blue)' },
  { device: 'HackRF', rate: 47, color: 'var(--violet)' },
  { device: 'USRP B210', rate: 250, color: 'var(--green)' },
  { device: 'pSPEC', rate: 950, color: 'var(--red)' },
];

export const COSMIC_RAY_ALTITUDE = [
  { altitude: 0, rate: 1, label: 'Sea Level' },
  { altitude: 1500, rate: 2, label: 'Denver-ish' },
  { altitude: 2400, rate: 2.5, label: 'Mountain' },
  { altitude: 10000, rate: 3.24, label: 'Cruising' },
  { altitude: 12000, rate: 5, label: 'High Altitude' },
];

export const DETECTED_MUONS_PER_DAY = [
  { model: 'Galaxy Nexus', area: 7.68, muons: 9 },
  { model: 'Lumia 720', area: 12.00, muons: 14 },
  { model: 'iPhone 5', area: 15.50, muons: 18 },
  { model: 'iPhone 6', area: 17.30, muons: 20 },
];

export const NIST_STS_TESTS = [
  { id: 1, name: 'Frequency (Monobit)', status: 'pass', p: 0.842, desc: 'Proportion of 0s and 1s' },
  { id: 2, name: 'Block Frequency', status: 'pass', p: 0.912, desc: 'Frequency of bits within blocks' },
  { id: 3, name: 'Runs', status: 'pass', p: 0.723, desc: 'Total number of runs of consecutive bits' },
  { id: 4, name: 'Longest Run of Ones', status: 'pass', p: 0.456, desc: 'Longest run of ones within a block' },
  { id: 5, name: 'Binary Matrix Rank', status: 'pass', p: 0.678, desc: 'Linear dependence among substrings' },
  { id: 6, name: 'Spectral (FFT)', status: 'pass', p: 0.234, desc: 'Periodic patterns in the sequence' },
  { id: 7, name: 'Non-overlapping Template', status: 'pass', p: 0.890, desc: 'Search for non-periodic patterns' },
  { id: 8, name: 'Overlapping Template', status: 'pass', p: 0.345, desc: 'Search for periodic patterns' },
  { id: 9, name: 'Maurer\'s Universal', status: 'pass', p: 0.567, desc: 'Compressibility of the sequence' },
  { id: 10, name: 'Linear Complexity', status: 'pass', p: 0.789, desc: 'Length of an LFSR generating the sequence' },
  { id: 11, name: 'Serial', status: 'pass', p: 0.123, desc: 'Frequency of all possible n-bit patterns' },
  { id: 12, name: 'Approximate Entropy', status: 'pass', p: 0.432, desc: 'Frequency of overlapping patterns' },
  { id: 13, name: 'Cumulative Sums', status: 'pass', p: 0.876, desc: 'Random walk excursions' },
  { id: 14, name: 'Random Excursions', status: 'pass', p: 0.543, desc: 'Number of visits to states in a random walk' },
  { id: 15, name: 'Random Excursions Variant', status: 'pass', p: 0.654, desc: 'Total number of times a state is visited' },
];

export const PQC_ALGORITHMS = [
  { name: 'ML-KEM-768', type: 'KEM', strength: '192-bit', seed: 32 },
  { name: 'ML-DSA-65', type: 'Signature', strength: '192-bit', seed: 32 },
  { name: 'Kyber1024', type: 'KEM', strength: '256-bit', seed: 32 },
  { name: 'Dilithium5', type: 'Signature', strength: '256-bit', seed: 32 },
];

export const BIT_EXTRACTION_METHODS = [
  { method: 'P1 (Time-diff)', bits: 2.4, efficiency: '95%', color: 'var(--accent)' },
  { method: 'P2 (Spatial)', bits: 1.8, efficiency: '72%', color: 'var(--accent-dim)' },
  { method: 'P3 (Intensity)', bits: 0.9, efficiency: '36%', color: 'var(--text-muted)' },
  { method: 'P4 (Hybrid)', bits: 3.2, efficiency: '88%', color: 'var(--accent)' },
];

export const RNG_COMPARISON_DATA = [
  { name: 'CMB Radiometer', rate: 2500000, cost: 220, nist: 98.9, setup: 'Medium', type: 'Quantum-Certified' },
  { name: 'MRNG (Cosmic)', rate: 0.000008, cost: 0, nist: 100, setup: 'Low', type: 'Environmental' },
  { name: 'Hardware QRNG', rate: 4000000, cost: 1200, nist: 100, setup: 'High', type: 'Commercial' },
  { name: 'Dark Noise QRNG', rate: 2400000, cost: 50, nist: 99.5, setup: 'Low', type: 'Semi-Quantum' },
  { name: 'Intel RDSEED', rate: 800000, cost: 300, nist: 100, setup: 'None', type: 'Silicon' },
];
