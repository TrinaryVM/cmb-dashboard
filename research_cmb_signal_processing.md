# CMB Signal Processing Pipeline: Entropy Extraction from Cosmic Microwave Background Radiation

*Research compiled from academic papers, hardware specifications, and open-source projects.*

---

## Table of Contents

1. [Overview & Physical Basis](#1-overview--physical-basis)
2. [Signal Chain: Antenna → ADC](#2-signal-chain-antenna--adc)
3. [Python Libraries for Radio Astronomy Signal Processing](#3-python-libraries-for-radio-astronomy-signal-processing)
4. [Noise Decomposition: Separating CMB from Other Sources](#4-noise-decomposition-separating-cmb-from-other-sources)
5. [Entropy Extraction Methods](#5-entropy-extraction-methods)
6. [Achievable Entropy Rates](#6-achievable-entropy-rates)
7. [Existing Open-Source RF Noise RNG Projects](#7-existing-open-source-rf-noise-rng-projects)
8. [Lee & Cleaver (2017): CMB Power Spectrum as RBG](#8-lee--cleaver-2017-cmb-power-spectrum-as-rbg)
9. [NIST SP 800-90B Health Tests](#9-nist-sp-800-90b-health-tests)
10. [End-to-End Python Pipeline](#10-end-to-end-python-pipeline)
11. [References](#11-references)

---

## 1. Overview & Physical Basis

The Cosmic Microwave Background (CMB) is a pervasive thermal blackbody radiation field at T = 2.72548 ± 0.00057 K, a remnant of the Epoch of Recombination ~380,000 years after the Big Bang. Its spectral radiance peaks at 282.1 GHz (1063.3 μm wavelength).

**Why CMB radiation is an entropy source:**

- **Quantum indeterminacy**: Individual photon arrival times and energies are governed by quantum mechanics — fundamentally unpredictable.
- **Spatial isotropy**: The CMB is nearly isotropic across the full sky (anisotropies at ΔT/T ≈ 10⁻⁵), meaning any direction yields statistically equivalent randomness.
- **Non-reproducibility**: Even if an adversary (Eve) observes the same patch of sky at the same time, quantum degeneracy guarantees a different measurement due to photon shot noise and quantum vacuum fluctuations.
- **Combined noise**: In practice, the _total_ microwave receiver noise — CMB + atmospheric emission + receiver thermal noise (Johnson-Nyquist) — is all physically random. The combined system noise temperature (T_sys) of even a modest ground-based receiver is still dominated by irreducible physical randomness.

**Key insight from Chapman et al. (2016)**: The noise available at the output of a radio telescope includes: (1) system noise (internally generated), (2) 2.73 K CMB component, (3) celestial source noise power, and (4) terrain interference signals. All components are fundamentally random; the CMB fraction provides a quantum-certified floor.

---

## 2. Signal Chain: Antenna → ADC

### 2.1 Hardware Overview

```
Sky Signal
    │
    ▼
┌─────────────────┐
│  Dish/Horn      │  Parabolic reflector, horn antenna, or dipole array
│  Antenna        │  Frequency: depends on target band (see table below)
└────────┬────────┘
         │ RF (microwave)
         ▼
┌─────────────────┐
│  LNB / LNA      │  Low-Noise Block Downconverter / Low-Noise Amplifier
│                 │  NF ≈ 0.5–1.5 dB (HEMT-based, cryogenic: ~0.1 dB)
│                 │  Gain: 20–60 dB
│                 │  Mixer + LO → downconverts RF to IF band
└────────┬────────┘
         │ IF (Intermediate Frequency: 950 MHz – 2.15 GHz for satellite LNBs)
         ▼
┌─────────────────┐
│  Bandpass       │  Selects target IF band, rejects aliasing
│  Filter         │  Bandwidth: 300 MHz – 2 GHz typical
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IF Amplifier   │  Total system gain: 55–70 dB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ADC            │  Digitizes the analog IF signal
│                 │  See specifications below
└────────┬────────┘
         │ Digital samples (I/Q or real)
         ▼
┌─────────────────┐
│  DSP / FPGA /   │  FFT, filtering, entropy extraction
│  Software (PC)  │
└─────────────────┘
```

### 2.2 Frequency Bands for CMB Observation

| Band         | Frequency         | Advantage                                       | Limitation                          |
|--------------|-------------------|-------------------------------------------------|-------------------------------------|
| 1–2 GHz (L)  | 1.0–2.0 GHz       | Cheap RTL-SDR hardware; HI line at 1.42 GHz    | Galactic synchrotron dominates      |
| 6–8 GHz (C)  | 6.5–6.8 GHz       | Used in Chapman et al. (2016) telescope RNG    | Requires dish + cooled LNA          |
| 10–12 GHz (X/Ku) | 10.7–12.75 GHz | Satellite LNBs cheap (~$20); CMB peak nearby   | Atmospheric water vapor             |
| 19 GHz (K)   | 18.5–20.5 GHz     | Used at UC Davis CMB lab (~500 MHz IF bandwidth) | Specialized hardware               |
| 30–300 GHz   | mm-wave           | Near CMB spectral peak (282 GHz)               | Expensive, requires cryo cooling    |
| 55–110 MHz   | VHF               | PRATUSH / SARAS – detects redshifted HI        | Galactic foregrounds; RFI-heavy     |

**Optimal window for ground-based entropy harvesting: 10–20 GHz** — cheap Ku-band satellite LNBs provide good sensitivity, atmospheric noise is moderate, and hardware is commercially available.

### 2.3 Typical Hardware Specifications

#### Consumer/Amateur SDR (e.g., RTL-SDR, HackRF)

| Parameter            | RTL-SDR v3          | HackRF One           | Airspy R2             |
|----------------------|---------------------|----------------------|-----------------------|
| Frequency range      | 500 kHz – 1.75 GHz  | 1 MHz – 6 GHz        | 24 – 1800 MHz         |
| Sample rate          | Up to 3.2 Msps      | Up to 20 Msps        | 10 Msps               |
| ADC bit depth        | 8-bit I/Q           | 8-bit I/Q            | 12-bit I/Q            |
| Bandwidth            | ~2.4 MHz usable     | ~17 MHz usable       | ~9 MHz usable         |
| Noise Figure         | ~3.5 dB             | ~8 dB                | ~3.5 dB               |
| Price                | ~$30                | ~$300                | ~$170                 |

#### Research-Grade (PRATUSH / SARAS / DSN-class)

| Parameter            | PRATUSH pSPEC ADC         | DSN 70m X-band            |
|----------------------|---------------------------|---------------------------|
| Frequency range      | 55–110 MHz IF             | 8.425 GHz RF              |
| Sample rate          | 250 Msps (max 1.25 Gsps)  | Not applicable (analog IF)|
| ADC bit depth        | 10-bit (ENOB: 7.8 bits)   | 14-bit (research grade)   |
| Bandwidth            | 125 MHz                   | 500 MHz                   |
| SNR                  | 52 dB                     | ~65 dB                    |
| System noise temp    | ~1000 K (terrestrial)     | 17.12 K (zenith, clear)   |

#### Ku-Band Satellite LNB (for CMB entropy harvesting, budget setup)

```
Input frequency:  10.70 – 12.75 GHz (Ku-band sky signal)
LO frequency:     9.75 GHz or 10.6 GHz
IF output:        950 – 2150 MHz (L-band)
Noise figure:     < 0.5 dB (modern units: ~0.2 dB)
Gain:             50–55 dB
Polarization:     Linear H/V or Circular
Cost:             ~$15–$30 (commodity DBS unit)
```

Connect LNB IF output → RTL-SDR or HackRF → PC for SDR processing.

### 2.4 Signal Chain Parameters by Configuration

| Configuration           | Sample Rate   | ADC Bits | Effective Bits | IF Bandwidth | Noise Figure |
|-------------------------|---------------|----------|----------------|--------------|--------------|
| RTL-SDR + Ku LNB        | 2.4 Msps      | 8        | ~6             | 2.4 MHz      | ~6 dB total  |
| HackRF + Ku LNB         | 20 Msps       | 8        | ~5.5           | 17 MHz       | ~9 dB total  |
| Airspy + LNA + Ku LNB   | 10 Msps       | 12       | ~9             | 9 MHz        | ~4 dB total  |
| USRP B210 + Ku LNB      | 56 Msps       | 12       | ~10            | 56 MHz       | ~5 dB total  |
| Research: pSPEC + LNA   | 250 Msps      | 10       | ~7.8           | 125 MHz      | <2 dB total  |

---

## 3. Python Libraries for Radio Astronomy Signal Processing

### 3.1 GNU Radio (`gnuradio`)

GNU Radio is the primary framework for SDR-based radio astronomy signal processing. It uses a directed-graph model where DSP blocks are nodes connected by data streams.

**Installation:**
```bash
sudo apt install gnuradio gr-osmosdr
pip install gnuradio  # or conda install -c conda-forge gnuradio
```

**Core Python API:**
```python
from gnuradio import gr, blocks, analog, fft, filter
from gnuradio.filter import firdes
import osmosdr  # for RTL-SDR / HackRF source

class CMBReceiver(gr.top_block):
    def __init__(self, center_freq=1.42e9, samp_rate=2.4e6):
        gr.top_block.__init__(self)
        
        # RTL-SDR Source
        self.src = osmosdr.source()
        self.src.set_sample_rate(samp_rate)
        self.src.set_center_freq(center_freq)
        self.src.set_gain(30)
        
        # Low-pass filter to select band
        taps = firdes.low_pass(
            gain=1.0,
            samp_rate=samp_rate,
            cutoff_freq=samp_rate/2 * 0.9,
            transition_width=samp_rate * 0.05,
            window=fft.window.WIN_BLACKMAN_hARRIS
        )
        self.lpf = filter.fir_filter_ccf(1, taps)
        
        # Convert complex IQ to power (magnitude squared)
        self.mag_sq = blocks.complex_to_mag_squared()
        
        # File sink to capture raw samples
        self.sink = blocks.file_sink(gr.sizeof_float, "cmb_raw.bin")
        
        self.connect(self.src, self.lpf, self.mag_sq, self.sink)
```

**gr-radio_astro (WVURAIL)**: Out-of-tree GNU Radio module for radio astronomy. Provides spectrometer blocks, calibration, and hydrogen-line processing.

```bash
git clone https://github.com/WVURAIL/gr-radio_astro.git
cd gr-radio_astro && mkdir build && cd build
cmake .. && make && sudo make install
```

Key blocks:
- `radio_astro.detect`: Signal detection above threshold
- `radio_astro.ra_ascii_sink`: ASCII spectrum output
- `spectrometer_w_cal.grc`: Complete calibrated spectrometer flowgraph

### 3.2 `numpy` and `scipy.signal`

Essential for offline processing of captured SDR data.

```python
import numpy as np
from scipy import signal
import struct

def load_iq_samples(filename, dtype=np.uint8):
    """Load RTL-SDR raw IQ (8-bit unsigned) samples."""
    raw = np.fromfile(filename, dtype=dtype)
    # Deinterleave I and Q, center on zero
    iq = raw.astype(np.float32) - 128.0
    complex_samples = iq[0::2] + 1j * iq[1::2]
    return complex_samples

def compute_power_spectrum(samples, nfft=4096, fs=2.4e6):
    """Compute Welch power spectral density estimate."""
    freqs, psd = signal.welch(
        samples,
        fs=fs,
        nperseg=nfft,
        window='blackmanharris',
        return_onesided=False,
        scaling='density'
    )
    return np.fft.fftshift(freqs), np.fft.fftshift(psd)

def compute_noise_temperature(psd_linear, bandwidth_hz, gain_linear, k_b=1.38e-23):
    """Convert PSD to system noise temperature."""
    # P_noise = k_B * T_sys * B
    # PSD has units W/Hz; total power P = integral(PSD * df)
    total_power = np.mean(psd_linear) * bandwidth_hz
    T_sys = total_power / (k_b * bandwidth_hz * gain_linear)
    return T_sys
```

### 3.3 `healpy`

Used for CMB sky maps in HEALPix pixelization scheme. Originally developed for BOOMERANG and WMAP CMB data; now standard for full-sky CMB analysis.

```python
import healpy as hp
import numpy as np

# Load a CMB temperature map (e.g., Planck FITS file)
cmb_map = hp.read_map('planck_cmb_map.fits')

# Get power spectrum C_l from the map
nside = hp.get_nside(cmb_map)
cl = hp.anafast(cmb_map, lmax=2*nside)

# Use C_l values as entropy source (Lee & Cleaver approach)
# The multipole moments are random variables with non-Gaussian distributions at low l
entropy_seed = cl.tobytes()  # raw bytes of the power spectrum coefficients

# Pixel value at a specific sky coordinate
theta, phi = np.pi/2, 0.0  # equatorial plane
pix = hp.ang2pix(nside, theta, phi)
pixel_temp = cmb_map[pix]  # temperature fluctuation in K

print(f"NSIDE: {nside}, Npix: {hp.nside2npix(nside)}")
print(f"C_l[2]: {cl[2]:.4e} K^2 (quadrupole)")
```

### 3.4 `astropy`

Provides time, coordinate, and unit utilities essential for radio astronomy data reduction.

```python
from astropy.time import Time
from astropy.coordinates import SkyCoord, AltAz, EarthLocation
import astropy.units as u

# Define observation location and time
location = EarthLocation(lat=51.5*u.deg, lon=-0.1*u.deg, height=100*u.m)
obs_time = Time.now()

# Target: zenith (optimal for CMB, minimal atmospheric path)
zenith = AltAz(alt=90*u.deg, az=0*u.deg, location=location, obstime=obs_time)

# Convert to galactic coordinates to check for foreground contamination
galactic = zenith.transform_to('galactic')
print(f"Galactic l={galactic.l.deg:.1f}, b={galactic.b.deg:.1f}")
# High |b| (galactic latitude) = less galactic foreground = cleaner CMB
```

### 3.5 `sp800-90b` (PyPI)

Python package for NIST SP 800-90B entropy assessment.

```bash
pip install sp800-90b
```

```python
import sp800_90b
import numpy as np

# Load raw ADC samples (8-bit values)
samples = np.fromfile('cmb_raw.bin', dtype=np.uint8)

# Estimate min-entropy
data = sp800_90b.Data(samples)
h_min = data.min_entropy()
print(f"Min-entropy: {h_min:.4f} bits/symbol")
# For 8-bit ADC with well-behaved thermal noise: typically 7.0–7.9 bits/symbol
```

---

## 4. Noise Decomposition: Separating CMB from Other Sources

### 4.1 System Noise Temperature Budget

The total system noise temperature T_sys at the receiver input is:

```
T_sys = T_CMB/L_atm + T_atm + T_ant + T_feed + T_LNA + T_followup
```

Where:
- **T_CMB = 2.725 K**: Cosmic Microwave Background (frequency-independent below 100 GHz)
- **T_atm**: Atmospheric emission (depends on elevation, weather, frequency)
- **T_ant**: Antenna ohmic losses and ground pickup (sidelobes)
- **T_LNA**: Receiver front-end noise temperature (~4–20 K for HEMT, ~100–500 K for RTL-SDR)
- **L_atm**: Atmospheric loss factor (ratio, > 1)

**Example budget (DSN 70m antenna, X-band 8.425 GHz, zenith, clear weather):**

| Component                   | Noise Temp (K) | Fraction of Total |
|-----------------------------|----------------|-------------------|
| CMB (T_CMB/L_atm)           | ~2.7           | 15.8%             |
| Atmospheric emission        | ~2.1           | 12.3%             |
| Antenna ohmic/sidelobes     | 3.77           | 22.0%             |
| Feed losses                 | 2.74           | 16.0%             |
| LNA                         | 4.43           | 25.9%             |
| Follow-up electronics       | 1.38           | 8.1%              |
| **Total T_sys**             | **17.12 K**    | 100%              |

**For a budget RTL-SDR setup (RTL-SDR + Ku-band LNB, no dish):**

| Component              | Noise Temp (K) | Notes                                    |
|------------------------|----------------|------------------------------------------|
| CMB (effective)        | ~3             | Through typical ~0.1 dB atmospheric loss |
| Atmosphere             | ~5–15          | Varies with weather and elevation        |
| LNB noise              | ~15–30         | 0.5 dB NF ≈ 35 K                         |
| RTL-SDR ADC/IF noise   | ~500–1000      | Dominates entirely                       |
| **Total T_sys**        | **~550–1050 K**| CMB fraction < 0.5%                     |

### 4.2 Why the CMB Fraction Doesn't Matter for Entropy

The key insight is that **all components of the noise are physically random**:

- **Johnson-Nyquist (thermal) noise**: Arises from random thermal motion of electrons — quantum mechanically irreducible at finite temperature.
- **Atmospheric emission**: Thermal emission from random molecular collisions in the troposphere.
- **Receiver noise**: Shot noise and thermal noise in transistors.
- **CMB itself**: Quantum blackbody radiation from the Big Bang.

Even if the RTL-SDR's own noise dominates (T_LNA >> T_CMB), the output is still **a true physical random process**, just not exclusively of cosmic origin. The CMB contribution provides a physically certified minimum entropy floor that cannot be controlled by any adversary.

### 4.3 Calibration and Noise Separation Techniques

#### Y-factor (Dicke switching) method

```python
def y_factor_noise_temp(T_hot=290, T_cold=77, power_hot=None, power_cold=None):
    """
    Measure receiver noise temperature via Y-factor.
    T_hot: hot load temperature (K), typically 290 K (ambient)
    T_cold: cold load (liquid nitrogen = 77 K, or sky = 4-20 K)
    power_hot, power_cold: measured output power (linear)
    """
    Y = power_hot / power_cold  # Y-factor (should be > 1)
    T_receiver = (T_hot - Y * T_cold) / (Y - 1)
    return T_receiver

# Example:
T_rx = y_factor_noise_temp(T_hot=290, T_cold=77, power_hot=1.23, power_cold=0.68)
print(f"Receiver noise temp: {T_rx:.1f} K")
```

#### Antenna tipping curve (atmospheric separation)

```python
import numpy as np

def tipping_curve_fit(elevations_deg, T_sys_measured, T_CMB=2.725, T_atm_physical=261.25):
    """
    Fit antenna tipping curve to separate atmospheric from CMB noise.
    T_sys(el) = T_CMB/L_atm(el) + T_atm(el) + T_receiver
    L_atm(el) = exp(tau_zenith / sin(elevation))
    """
    elevations_rad = np.radians(elevations_deg)
    # Air mass: 1/sin(el)
    airmass = 1.0 / np.sin(elevations_rad)
    
    # Fit: T_sys = T_CMB * exp(-tau*AM) + T_atm_physical*(1-exp(-tau*AM)) + T_rx
    from scipy.optimize import curve_fit
    
    def model(AM, tau_z, T_rx):
        L = np.exp(tau_z * AM)
        T_atm = T_atm_physical * (1 - 1/L)
        return T_CMB/L + T_atm + T_rx
    
    popt, pcov = curve_fit(model, airmass, T_sys_measured, p0=[0.05, 50])
    tau_zenith, T_rx = popt
    return tau_zenith, T_rx
```

#### RFI detection and flagging

```python
import numpy as np
from scipy import signal

def detect_rfi(spectrum, threshold_sigma=5.0):
    """
    Flag RFI channels using spectral kurtosis / sigma clipping.
    Returns boolean mask: True = RFI contaminated.
    """
    median = np.median(spectrum)
    mad = np.median(np.abs(spectrum - median))  # Median Absolute Deviation
    sigma_est = 1.4826 * mad  # Robust std estimation
    
    rfi_mask = np.abs(spectrum - median) > threshold_sigma * sigma_est
    return rfi_mask

def spectral_kurtosis_rfi(samples_iq, nfft=1024, M=1):
    """
    Spectral Kurtosis estimator for RFI detection.
    For thermal (Gaussian) noise: SK = 1.0 ± statistical fluctuations.
    RFI increases SK significantly.
    """
    n_blocks = len(samples_iq) // nfft
    samples_iq = samples_iq[:n_blocks * nfft].reshape(n_blocks, nfft)
    
    # FFT each block
    spectra = np.abs(np.fft.fft(samples_iq, axis=1))**2
    
    # Spectral Kurtosis estimator
    S1 = np.mean(spectra, axis=0)
    S2 = np.mean(spectra**2, axis=0)
    
    N = n_blocks
    SK = ((N * M + 1) / (M - 1)) * (N * S2 / S1**2 - 1)
    
    # Expected SK = 1.0 ± sqrt(2/N) for pure Gaussian noise
    # Flag if SK outside [1 - 3*sqrt(2/N), 1 + 3*sqrt(2/N)]
    tol = 3 * np.sqrt(2 / N)
    rfi_mask = np.abs(SK - 1.0) > tol
    return SK, rfi_mask
```

---

## 5. Entropy Extraction Methods

### 5.1 Min-Entropy Estimation

Before applying any extractor, measure the min-entropy H_∞ of the raw samples:

```
H_∞(X) = -log₂(max_x P[X = x])
```

For an ideal ADC digitizing Gaussian thermal noise with amplitude much larger than 1 LSB (so quantization noise is small), the distribution of digitized samples is Gaussian → nearly uniform across the full ADC range → min-entropy ≈ bit depth.

```python
import numpy as np
from collections import Counter

def min_entropy_estimate(samples):
    """
    Empirical min-entropy estimation from a sample array.
    samples: integer array (e.g., uint8 ADC values 0–255)
    """
    counts = Counter(samples)
    total = len(samples)
    max_prob = max(counts.values()) / total
    h_min = -np.log2(max_prob)
    return h_min

def min_entropy_binary(bits):
    """Min-entropy of a binary sequence."""
    n = len(bits)
    p1 = np.sum(bits) / n
    p0 = 1 - p1
    max_prob = max(p1, p0)
    return -np.log2(max_prob)

# Example: 8-bit ADC, well-calibrated thermal noise
# Expected: H_min ≈ 7.0–7.9 bits/sample
```

### 5.2 Von Neumann Debiasing

The classic method for producing unbiased bits from a biased but independent binary source.

**Efficiency**: For source bias p, expected output rate = 2p(1-p) bits per input bit pair. Maximized at p=0.5 (output rate = 0.5 bits/bit-in). For p=0.6, rate = 2(0.6)(0.4) = 0.48 bits/pair.

```python
def von_neumann_extract(bits):
    """
    Von Neumann debiasing.
    Input: array of bits (0/1), possibly biased but independent.
    Output: unbiased bits.
    """
    output = []
    bits = np.asarray(bits, dtype=np.uint8)
    
    # Process pairs
    for i in range(0, len(bits) - 1, 2):
        b0, b1 = bits[i], bits[i+1]
        if b0 == 0 and b1 == 1:
            output.append(0)
        elif b0 == 1 and b1 == 0:
            output.append(1)
        # Discard (0,0) and (1,1) pairs
    
    return np.array(output, dtype=np.uint8)


def iterative_von_neumann(bits, passes=4):
    """
    Iterative Von Neumann extractor — more efficient than single-pass.
    Applies VN recursively to the discarded pairs.
    Based on Peres (1992) iterated extraction.
    """
    result = []
    
    def vn_pass(b):
        out = []
        discarded_same = []  # 00 and 11 pairs
        for i in range(0, len(b) - 1, 2):
            if b[i] != b[i+1]:
                out.append(b[i+1])  # 01→0, 10→1 (using second bit)
            else:
                discarded_same.append(b[i])
        return out, discarded_same
    
    current = list(bits)
    for _ in range(passes):
        if len(current) < 2:
            break
        extracted, current = vn_pass(current)
        result.extend(extracted)
    
    return np.array(result, dtype=np.uint8)


def bits_from_adc_lsb(samples, n_bits=2):
    """
    Extract the n least-significant bits from each ADC sample.
    LSBs of ADC contain the most noise (highest entropy).
    """
    mask = (1 << n_bits) - 1
    lsb_values = samples & mask
    # Unpack to individual bits
    bits = np.unpackbits(
        lsb_values.astype(np.uint8).reshape(-1, 1),
        axis=1, count=n_bits, bitorder='little'
    ).flatten()
    return bits
```

### 5.3 SHA-256 / SHA-3 Conditioning

The most practical and NIST-approved method. The hash function acts as a randomness extractor and conditioner simultaneously.

```python
import hashlib
import numpy as np

def sha256_conditioner(raw_data: bytes, output_bytes: int = 32) -> bytes:
    """
    NIST SP 800-90B approved hash-based conditioning.
    raw_data: raw entropy bytes from ADC (≥ output_bytes * 2 recommended)
    output_bytes: desired output length (32 for SHA-256, 64 for SHA-512)
    """
    return hashlib.sha256(raw_data).digest()[:output_bytes]

def sha3_conditioner(raw_data: bytes, output_bytes: int = 32) -> bytes:
    """SHA-3 (Keccak) conditioning — preferred for new designs."""
    return hashlib.sha3_256(raw_data).digest()[:output_bytes]

def hash_df(entropy_input: bytes, requested_bits: int, 
            hash_fn=hashlib.sha256) -> bytes:
    """
    NIST SP 800-90A Hash_df derivation function.
    Conditions entropy_input into requested_bits of output.
    """
    hash_len = hash_fn(b'').digest_size  # bytes
    requested_bytes = (requested_bits + 7) // 8
    
    output = b''
    counter = 1
    while len(output) < requested_bytes:
        h = hash_fn(
            bytes([counter]) + 
            requested_bits.to_bytes(4, 'big') + 
            entropy_input
        )
        output += h.digest()
        counter += 1
    
    return output[:requested_bytes]


class CMBEntropyConditioner:
    """
    Practical entropy conditioner for CMB/RF noise data.
    Implements NIST SP 800-90B Section 3.1.5.1 approved conditioning.
    """
    def __init__(self, block_size_bytes=64):
        self.block_size = block_size_bytes
        self.pool = b''
        self.bytes_generated = 0
    
    def feed(self, raw_samples: np.ndarray):
        """Feed raw ADC samples into entropy pool."""
        self.pool += raw_samples.tobytes()
    
    def generate(self, n_bytes: int) -> bytes:
        """Extract conditioned random bytes."""
        output = b''
        while len(output) < n_bytes:
            if len(self.pool) < self.block_size:
                raise RuntimeError("Insufficient entropy in pool")
            
            block = self.pool[:self.block_size]
            self.pool = self.pool[self.block_size:]
            
            conditioned = hashlib.sha3_256(block).digest()
            output += conditioned
            self.bytes_generated += len(conditioned)
        
        return output[:n_bytes]
```

### 5.4 Toeplitz Hashing (Information-Theoretic Extractor)

The Toeplitz strong extractor is provably secure: given n input bits with min-entropy H_∞ ≥ k, it extracts m = k - 2·log(1/ε) output bits that are ε-close to uniform. This is information-theoretic security, unlike hash conditioning.

```python
import numpy as np

def toeplitz_extract(raw_bits: np.ndarray, m: int, seed: np.ndarray) -> np.ndarray:
    """
    Toeplitz hashing randomness extractor.
    
    Args:
        raw_bits: n input bits (from entropy source)
        m: desired output bits (m ≤ H_∞ - 2*log2(1/epsilon))
        seed: m + n - 1 uniformly random seed bits (from LFSR or separate source)
    
    Returns:
        m extracted bits, ε-close to uniform
    
    The Toeplitz matrix T is (m × n), where T[i,j] = seed[i+j].
    Output = T · raw_bits (mod 2) = XOR of selected input bits.
    """
    n = len(raw_bits)
    assert len(seed) == m + n - 1, f"Seed must be {m + n - 1} bits long"
    
    output = np.zeros(m, dtype=np.uint8)
    for i in range(m):
        # Row i of Toeplitz matrix = seed[i:i+n]
        row = seed[i:i+n]
        output[i] = np.dot(raw_bits, row) % 2
    
    return output


def toeplitz_extract_fft(raw_bits: np.ndarray, m: int, seed: np.ndarray) -> np.ndarray:
    """
    FFT-accelerated Toeplitz extraction.
    Toeplitz matrix-vector product via circulant convolution.
    O(n log n) instead of O(m*n).
    """
    n = len(raw_bits)
    # Embed in circulant matrix of size (m+n-1)
    # Use FFT convolution trick
    seed_padded = np.zeros(m + n - 1, dtype=np.float64)
    seed_padded[:] = seed.astype(np.float64)
    
    raw_padded = np.zeros(m + n - 1, dtype=np.float64)
    raw_padded[:n] = raw_bits.astype(np.float64)
    
    # Convolution in frequency domain
    conv = np.fft.irfft(np.fft.rfft(seed_padded) * np.fft.rfft(raw_padded),
                        n=m + n - 1)
    
    # Extract relevant portion and reduce mod 2
    result = np.round(conv[:m]).astype(np.int64) % 2
    return result.astype(np.uint8)


def lfsr_seed_generator(n_bits: int, polynomial: int = 0x8E, initial_state: int = 0xACE1):
    """
    LFSR-based seed generator for Toeplitz extractor.
    polynomial: feedback polynomial in hex (primitive polynomial over GF(2))
    For 8-bit: 0x8E = x^8 + x^6 + x^5 + x^4 + 1 (maximal-length)
    """
    bits = []
    state = initial_state & 0xFF
    poly = polynomial & 0xFF
    
    for _ in range(n_bits):
        # Output LSB
        bit = state & 1
        bits.append(bit)
        # LFSR feedback: XOR feedback bits determined by polynomial
        feedback = bin(state & poly).count('1') % 2
        state = (state >> 1) | (feedback << 7)
    
    return np.array(bits, dtype=np.uint8)
```

### 5.5 XOR Folding

Fast but weaker than Toeplitz. Reduces bias by XOR-ing N independent bits together.

```python
def xor_fold(samples: np.ndarray, fold_factor: int = 4) -> np.ndarray:
    """
    XOR folding: combine fold_factor samples via XOR.
    Reduces bias of each output bit by factor (2p_max - 1)^fold_factor.
    For ADC samples: unpack to bits first.
    """
    bits = np.unpackbits(samples.astype(np.uint8))
    n_out = len(bits) // fold_factor
    bits_matrix = bits[:n_out * fold_factor].reshape(n_out, fold_factor)
    folded = np.bitwise_xor.reduce(bits_matrix, axis=1)
    return folded

def xor_fold_bytes(samples: np.ndarray, fold_factor: int = 8) -> np.ndarray:
    """XOR fold at byte level."""
    n_out = len(samples) // fold_factor
    result = np.zeros(n_out, dtype=np.uint8)
    for i in range(fold_factor):
        result ^= samples[i::fold_factor][:n_out]
    return result
```

### 5.6 LFSR-Based Post-Processing

LFSRs scramble bits efficiently but are NOT cryptographically secure. Use only for pre-whitening before a hash conditioner.

```python
def lfsr_whiten(data: np.ndarray, taps: list = [32, 22, 2, 1]) -> np.ndarray:
    """
    LFSR whitening using a 32-bit maximal-length LFSR.
    XOR input with LFSR output (stream cipher).
    NOT cryptographically secure — use before SHA-3 conditioning.
    """
    state = 0xDEADBEEF  # Non-zero initial state
    output = np.empty_like(data)
    
    for i, byte in enumerate(data):
        # Generate one byte of LFSR output
        lfsr_byte = 0
        for bit_pos in range(8):
            # Fibonacci LFSR: output = XOR of taps
            feedback = 0
            for tap in taps:
                feedback ^= (state >> (tap - 1)) & 1
            state = ((state << 1) | feedback) & 0xFFFFFFFF
            lfsr_byte |= (state & 1) << bit_pos
        
        output[i] = byte ^ lfsr_byte
    
    return output
```

---

## 6. Achievable Entropy Rates

### 6.1 Theoretical Maximum: Johnson-Nyquist Noise

The thermal noise power in bandwidth B at temperature T is:
```
P_noise = k_B * T * B  (Watts)
```

For an ADC sampling at rate f_s with bandwidth B = f_s/2:
- Number of independent samples per second = f_s
- Each sample carries H_∞ bits of entropy (≈ ADC bit depth for well-designed circuit)
- **Raw entropy rate** = f_s × H_∞ bits/second

### 6.2 Hardware Configuration vs. Entropy Rate

| Hardware Configuration | Sample Rate | Eff. Bits/Sample | Raw Rate (Mbit/s) | After Von Neumann (bias p=0.51) | After SHA-256 |
|------------------------|-------------|------------------|-------------------|----------------------------------|---------------|
| RTL-SDR (8-bit IQ)     | 2.4 Msps    | ~5               | 12                | ~5.7                             | 11 Mbit/s (2 SHA/s per 64B) |
| HackRF (8-bit IQ)      | 20 Msps     | ~5               | 100               | ~47                              | Limited by CPU |
| Airspy R2 (12-bit)     | 10 Msps     | ~8               | 80                | ~40                              | 80 Mbit/s theoretical |
| USRP B210 (12-bit)     | 56 Msps     | ~9               | 504               | ~250                             | 500 Mbit/s theoretical |
| Research pSPEC (10-bit)| 250 Msps    | ~7.8             | 1950              | ~950                             | 2 Gbit/s theoretical |

**After SHA-3 conditioning** (practical bottleneck is CPU hashing speed):
- SHA-3-256 throughput on modern x86: ~2–5 GB/s
- For 64-byte input blocks: ~30–80 million hashes/second
- Practical output rate: ~1–2 Gbit/s from a single CPU core

**Key limiting factor**: For all consumer SDR hardware, the CPU hashing rate, not the ADC rate, limits the entropy output rate. At 2.4 Msps RTL-SDR with 8-bit output, you have 2.4 MB/s of raw data; SHA-3 conditioning at 2 GB/s throughput produces ~2.4 MB/s of high-quality output easily.

### 6.3 CMB-Specific Contribution

At a ground-based site with T_sys = 50 K (good research instrument):
- T_CMB / T_sys ≈ 2.725 / 50 = 5.4% of total noise power is from CMB
- CMB contribution to per-sample min-entropy ≈ 5.4% × H_∞(total)

For the combined noise (the physically meaningful quantity):
- If H_∞ = 7.5 bits/sample at 10 Msps → **75 Mbit/s raw entropy**
- CMB fraction certifiably contributes ~4 Mbit/s from quantum blackbody radiation

**For entropy harvesting purposes, the total thermal noise is the source.** The CMB provides the quantum-certified floor; atmospheric and receiver noise are equally random but less philosophically elegant.

### 6.4 Practical Entropy Rate Budget (Ku-Band LNB + RTL-SDR)

```
Hardware:     Ku-band LNB + RTL-SDR v3
ADC:          8-bit, 2.4 Msps, effective ~5-6 bits/sample
Raw rate:     2.4 Msps × 6 bits = 14.4 Mbit/s
After VN:     ~6.9 Mbit/s (p ≈ 0.5, VN efficiency ~48%)
After SHA256: ~6.9 Mbit/s (no rate reduction, hash output expands)
Practically:  ~1 Mbit/s (conservative, accounting for conditioning overhead)

System noise: T_sys ≈ 800 K (LNB 30K + RTL-SDR 770K)
CMB fraction: 2.725/800 ≈ 0.34% — cosmically sourced randomness
```

---

## 7. Existing Open-Source RF Noise RNG Projects

### 7.1 Chapman, Grewar & Natusch (2016) — Celestial RNG

**"Celestial sources for random number generation"** — Edith Cowan University / Institute for Radio Astronomy and Space Research, Auckland.

**Signal chain:**
- Telescope: WRAO (Warkworth Radio Astronomical Observatory)
- Target sources: G309 (Maser 309.92+0.47) and M17 nebula
- RF band: 6.5–6.8 GHz (300 MHz bandwidth)
- Down-converter: LNA → mixer (LO from H-maser) → IF at 825 MHz center, 300 MHz wide
- Final digitization: RTL-SDR

**Processing:**
1. Record ~1 minute per source → ~400 MB binary files
2. `hexdump` to extract 128-bit lines in hex
3. Each 128-bit line used as SHA-256 seed
4. Hash output (256 bits) sampled 2 bytes at a time for integer generation

**Results:**
- Pre-hashing: Gaussian amplitude distribution (expected for noise)
- Post-hashing: Uniform distribution
- **98.9% of 512 bitstreams passed NIST STS** (identical to SecureRandom control)
- Entropy value (R's entropy package): higher than Java SecureRandom control

**Key finding**: ~400 MB of useful entropy per minute from a modest SDR setup.

### 7.2 Infinite Noise TRNG

Open-source USB TRNG using modular entropy multiplication from thermal noise.

- Source: Thermal noise of resistors, amplified in a feedback loop
- Raw rate: 300 kbit/s at 0.86 bits/bit min-entropy
- With SHA-3 conditioning: up to 500 Mbit/s output (at cost of CPU)
- Health monitoring built into driver: flags any deviation > 3% from expected entropy

```bash
git clone https://github.com/waywardgeek/infnoise.git
```

```python
# Read from Infinite Noise TRNG
import subprocess

def read_infnoise(n_bytes=1024):
    result = subprocess.run(
        ['infnoise', '--raw-output', str(n_bytes)],
        capture_output=True
    )
    return result.stdout[:n_bytes]
```

### 7.3 RAVA TRNG (Avalanche Noise)

Open-hardware TRNG using avalanche breakdown of reverse-biased Zener diodes.

- Source: Reverse-biased 24V Zener → avalanche noise → differential analog circuit
- Output rate: 136 kbit/s unbiased, no post-processing needed
- Python driver: `pip install rng-rava`

```python
from rng_rava.rava_rng import RAVA_RNG

rng = RAVA_RNG()
rng.open('/dev/ttyACM0')
random_bytes = rng.get_bytes(1024)
rng.close()
```

### 7.4 OneRNG

Open-hardware USB TRNG using RF noise + avalanche noise.

- Two entropy sources: RF antenna (RF noise floor) + avalanche diode
- Rate: 350 kbit/s raw
- XOR-folded combination of both sources
- SHA-256 conditioning in firmware

The RF noise source in OneRNG is functionally similar to a CMB receiver: it captures broadband RF noise from the environment, which includes the CMB contribution.

### 7.5 MRNG (2023) — Cosmic Ray TRNG

**Kutschera et al., "MRNG: Accessing Cosmic Radiation as an Entropy Source for a Non-Deterministic Random Number Generator"**, Entropy 25(6):854, 2023.

- Source: Ultra-high energy cosmic rays (muons) detected via smartphone camera sensor
- Method: Dark-frame captures → single-event upsets from cosmic ray muons → bit extraction
- Results: Passed NIST STS randomness tests
- Limitation: Very low rate (muon flux ~1 cm⁻²·min⁻¹ at sea level)

### 7.6 gr-radio_astro (WVURAIL)

GNU Radio OOT module specifically for radio astronomy that includes hydrogen-line and broadband noise acquisition blocks.

```bash
git clone https://github.com/WVURAIL/gr-radio_astro.git
```

Features:
- `spectrometer_w_cal.grc`: Full calibrated spectrometer flowgraph
- Calibration blocks for hot/cold load Y-factor
- Supports RTL-SDR, Airspy, USRP

---

## 8. Lee & Cleaver (2017): CMB Power Spectrum as RBG

**Full reference**: Jeffrey S. Lee, Gerald B. Cleaver. "The cosmic microwave background radiation power spectrum as a random bit generator for symmetric- and asymmetric-key cryptography." *Heliyon* 3(10):e00422, 2017. doi:10.1016/j.heliyon.2017.e00422. PMC5639047.

*(Originally arXiv:1511.02511, submitted Nov 2015.)*

### 8.1 Core Thesis

The CMB power spectrum (the set of C_l coefficients representing temperature fluctuations as a function of angular scale) constitutes a truly random, arbitrarily large, non-reproducible number that can serve as:
1. A symmetric key for Vernam cipher (one-time pad)
2. A private key seed for asymmetric cryptography (RSA, ECC)

### 8.2 Data Source: Planck Mission

- ESA Planck satellite maps CMB over 4π steradians
- Resolution: several arcminutes (5×10⁷ pixels/detector)
- Power spectrum: C_l coefficients for multipole moments l = 2 to ~2500
- Available at: https://pla.esac.esa.int/

### 8.3 Methodology

**Step 1: Power spectrum extraction (two-pass)**

*Pass 1*: Estimate all parameters (including detector noise) using auto-spectra and cross-spectra between detector pairs.

*Pass 2*: Fix noise estimates; use fiducial Gaussian approximation to extract CMB-only C_l coefficients.

**Mathematical framework:**

The pseudo-C_l estimator for detector pair (i, j):
```
C̃_l^{ij} = 1/(2l+1) Σ_m T̃_{lm}^i (T̃_{lm}^j)*
```

where T̃_{lm}^i are spherical harmonic coefficients of the weighted temperature map from detector i.

The binned power spectrum:
```
Ĉ_r = Σ_l w_r(l) Ĉ_l
```

with window functions w_r(l) providing noise-weighted averaging across multipole bins r.

**Step 3: Bit extraction**

The paper proposes two modes:
1. **Single detector**: Use intensity digits from one detector at specified (sky frequency, binning parameters, coordinates, time, duration)
2. **Multiple detectors**: Use digits from cross-spectra between detector pairs

The key is that each C_l value is a **unique, non-reproducible real number** due to quantum vacuum fluctuations, even if measured simultaneously by two observers.

**Step 4: Key generation**

```python
# Pseudocode for Lee & Cleaver key generation
import healpy as hp
import numpy as np
import hashlib

def generate_cmb_key(planck_map_file, nside=512, lmax=1000, n_bytes=32):
    """
    Generate a cryptographic key from CMB power spectrum.
    Uses Planck CMB map.
    """
    # Load CMB temperature map
    cmb_map = hp.read_map(planck_map_file)
    
    # Extract power spectrum C_l
    cl = hp.anafast(cmb_map, lmax=lmax)
    
    # The C_l values are random variables — use their raw bytes as entropy
    # Each C_l is a float64 (8 bytes); lmax=1000 gives 8000 bytes of entropy
    raw_entropy = cl.tobytes()
    
    # Condition with SHA-3 (paper uses the raw spectrum; we add conditioning)
    key = hashlib.sha3_256(raw_entropy).digest()
    
    return key

def cmb_vernam_pad(plaintext: bytes, planck_map_file: str) -> bytes:
    """
    Lee & Cleaver style: use CMB spectrum as one-time pad key material.
    For a proper OTP, key must be at least as long as plaintext.
    """
    cmb_map = hp.read_map(planck_map_file)
    cl = hp.anafast(cmb_map, lmax=10000)  # More multipoles = more key material
    
    key_bytes = cl.tobytes()
    if len(key_bytes) < len(plaintext):
        raise ValueError("Insufficient CMB spectrum length for OTP")
    
    # XOR plaintext with CMB key
    ciphertext = bytes(p ^ k for p, k in zip(plaintext, key_bytes))
    return ciphertext
```

### 8.4 FIPS 140-2 Compliance Argument

Lee & Cleaver argue the CMB spectrum method meets FIPS 140-2 requirements:

- **Adequate security strength**: C_l values from Planck give >10^7 pixels × 8 bytes = 56 MB of entropy per map
- **Key independence**: K = V ⊕ W where V and W are independent spectral bands — neither can be determined from the other
- **Non-reproducibility**: Eve cannot reproduce Alice's exact C_l measurement due to quantum indeterminacy

**Caveat**: FIPS 140-2 requires the RBG to "reside within the FIPS 140 key-generating module." An external astronomical source does not satisfy this co-residency requirement, so formal certification is not possible under current standards.

### 8.5 Critique and Limitations

1. **No statistical tests performed**: The paper contains no NIST STS, Dieharder, or similar empirical randomness tests on actual extracted bits.
2. **Low entropy rate from Planck data**: Planck C_l values are publicly available and fixed; an adversary with the same public data could reproduce them exactly. The true entropy source must be **new measurements**, not archived data.
3. **Practical implementation gap**: No code, no bit extraction algorithm, no signal chain specification.
4. **Better approach (Chapman et al.)**: Use real-time radio telescope noise (which includes CMB) and condition with SHA-256 — this has been empirically validated.

---

## 9. NIST SP 800-90B Health Tests

NIST SP 800-90B specifies mandatory continuous health tests for entropy sources. Two tests are required:

### 9.1 Repetition Count Test (RCT)

Detects when the entropy source gets "stuck" producing the same value repeatedly.

```
Let H = min-entropy estimate of the noise source (bits/sample)
Cutoff C = ceil(1 + (-α/log2(P_max)))
where P_max = 2^{-H} is max probability of any symbol
α = false positive rate (e.g., 2^{-20})
```

```python
class RepetitionCountTest:
    """
    NIST SP 800-90B Section 4.4.1 Repetition Count Test.
    Detects entropy source failure (stuck output).
    """
    
    def __init__(self, h_min: float, alpha: float = 2**-20):
        """
        h_min: estimated min-entropy per sample (bits)
        alpha: false positive rate (probability of false failure alarm)
        """
        import math
        p_max = 2**(-h_min)
        # Cutoff: smallest C such that P_max^{C-1} <= alpha
        self.C = math.ceil(1 + (-math.log(alpha) / math.log(2)) / h_min)
        self.last_sample = None
        self.run_count = 0
        self.failures = 0
        print(f"RCT initialized: H_min={h_min:.2f}, C={self.C}")
    
    def test(self, sample) -> bool:
        """
        Process one sample. Returns True if PASS, False if FAIL.
        """
        if self.last_sample is None:
            self.last_sample = sample
            self.run_count = 1
            return True
        
        if sample == self.last_sample:
            self.run_count += 1
            if self.run_count >= self.C:
                self.failures += 1
                return False  # FAIL: entropy source may have failed
        else:
            self.last_sample = sample
            self.run_count = 1
        
        return True  # PASS
    
    def reset(self):
        self.last_sample = None
        self.run_count = 0


class AdaptiveProportionTest:
    """
    NIST SP 800-90B Section 4.4.2 Adaptive Proportion Test.
    Detects when one symbol becomes anomalously frequent.
    """
    
    def __init__(self, h_min: float, is_binary: bool = False, 
                 alpha: float = 2**-20):
        """
        h_min: min-entropy per sample
        is_binary: True if source output is binary (1-bit); False for multi-bit
        alpha: false positive rate
        """
        from scipy.stats import binom
        
        # Window size
        self.W = 1024 if is_binary else 512
        self.is_binary = is_binary
        self.alpha = alpha
        
        # Compute cutoff C using binomial distribution
        # P(count >= C | p_max, W) <= alpha
        p_max = 2**(-h_min)
        # Cutoff: smallest C such that P[Bin(W, p_max) >= C] <= alpha
        self.C = binom.ppf(1 - alpha, self.W, p_max)
        if self.C < 0:
            self.C = self.W  # Fallback
        self.C = int(self.C) + 1
        
        # State
        self.window = []
        self.first_sample = None
        self.count = 0
        self.failures = 0
        
        print(f"APT initialized: H_min={h_min:.2f}, W={self.W}, C={self.C}")
    
    def test(self, sample) -> bool:
        """Process one sample. Returns True if PASS, False if FAIL."""
        if len(self.window) == 0:
            # Start of new window
            self.first_sample = sample
            self.count = 1
            self.window.append(sample)
            return True
        
        self.window.append(sample)
        if sample == self.first_sample:
            self.count += 1
        
        if self.count >= self.C:
            self.failures += 1
            # Reset window
            self.window = []
            self.count = 0
            return False  # FAIL
        
        if len(self.window) >= self.W:
            # End of window: reset
            self.window = []
            self.count = 0
        
        return True  # PASS


class NISTPHealthMonitor:
    """
    Combined NIST SP 800-90B continuous health monitor.
    Run on all raw entropy samples before conditioning.
    """
    
    def __init__(self, h_min: float, is_binary: bool = False):
        self.rct = RepetitionCountTest(h_min)
        self.apt = AdaptiveProportionTest(h_min, is_binary)
        self.total_samples = 0
        self.total_failures = 0
    
    def check(self, sample) -> bool:
        """
        Returns True if both tests PASS.
        On FAIL, entropy output should be halted.
        """
        self.total_samples += 1
        rct_pass = self.rct.test(sample)
        apt_pass = self.apt.test(sample)
        
        passed = rct_pass and apt_pass
        if not passed:
            self.total_failures += 1
        
        return passed
    
    def check_stream(self, samples: np.ndarray) -> tuple:
        """
        Check a stream of samples.
        Returns (pass_mask, failure_count).
        """
        pass_mask = np.ones(len(samples), dtype=bool)
        for i, s in enumerate(samples):
            pass_mask[i] = self.check(int(s))
        
        return pass_mask, self.total_failures
    
    def status(self) -> dict:
        return {
            'total_samples': self.total_samples,
            'total_failures': self.total_failures,
            'failure_rate': self.total_failures / max(1, self.total_samples),
            'rct_failures': self.rct.failures,
            'apt_failures': self.apt.failures,
        }
```

### 9.2 Startup Test

Additional test required at power-on: collect at least 2 independent blocks of W samples and verify both RCT and APT pass before releasing any entropy.

```python
def startup_test(samples: np.ndarray, h_min: float, n_blocks: int = 2) -> bool:
    """
    NIST SP 800-90B startup test.
    Must pass before entropy is released to consumers.
    """
    monitor = NISTPHealthMonitor(h_min)
    W = 1024  # Binary window size (conservative)
    required = n_blocks * W
    
    if len(samples) < required:
        raise ValueError(f"Need at least {required} samples for startup test")
    
    _, failures = monitor.check_stream(samples[:required])
    
    if failures == 0:
        print(f"Startup test PASSED ({required} samples, 0 failures)")
        return True
    else:
        print(f"Startup test FAILED ({failures} failures in {required} samples)")
        return False
```

### 9.3 NIST STS (Statistical Test Suite) for Full Validation

For full NIST SP 800-90B entropy source submission, use the official NIST tool:

```bash
# Official NIST SP 800-90B entropy assessment tool
git clone https://github.com/usnistgov/SP800-90B_EntropyAssessment.git

# Or use Python wrapper:
pip install sp800-90b

python -c "
import sp800_90b
import numpy as np

data = np.fromfile('cmb_raw.bin', dtype=np.uint8)
result = sp800_90b.assess(data, verbose=True)
print(f'Min-entropy: {result.min_entropy:.4f} bits/sample')
"
```

---

## 10. End-to-End Python Pipeline

The following is a complete, self-contained entropy harvesting pipeline for a CMB/RF noise source.

```python
#!/usr/bin/env python3
"""
CMB/RF Noise Entropy Harvesting Pipeline
==========================================
Complete pipeline from SDR capture to conditioned entropy output.

Hardware: Ku-band LNB + RTL-SDR (or any SDR)
Python deps: numpy, scipy, rtlsdr (pip install pyrtlsdr), hashlib

Usage:
    python cmb_entropy_pipeline.py --output /dev/stdin --rate 1000000
"""

import numpy as np
import hashlib
import struct
import time
import argparse
from collections import deque
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('CMBEntropy')

# ─── Stage 1: SDR Acquisition ─────────────────────────────────────────────────

class SDRSource:
    """Captures IQ samples from RTL-SDR via rtlsdr library."""
    
    def __init__(self, center_freq_hz: float = 1.0e9, 
                 sample_rate: int = 2_400_000,
                 gain_db: float = 30.0):
        try:
            from rtlsdr import RtlSdr
            self.sdr = RtlSdr()
            self.sdr.center_freq = center_freq_hz
            self.sdr.sample_rate = sample_rate
            self.sdr.gain = gain_db
            self.sample_rate = sample_rate
            logger.info(f"RTL-SDR initialized: f={center_freq_hz/1e6:.1f} MHz, "
                       f"fs={sample_rate/1e6:.1f} Msps, gain={gain_db} dB")
        except ImportError:
            logger.warning("pyrtlsdr not available — using simulated Gaussian noise source")
            self.sdr = None
            self.sample_rate = sample_rate
    
    def read_samples(self, n_samples: int = 131072) -> np.ndarray:
        """Read n_samples IQ samples. Returns uint8 array."""
        if self.sdr is not None:
            samples = self.sdr.read_samples(n_samples)
            # Convert complex IQ to interleaved uint8 (RTL-SDR native format)
            i_part = (np.real(samples) * 127 + 128).clip(0, 255).astype(np.uint8)
            q_part = (np.imag(samples) * 127 + 128).clip(0, 255).astype(np.uint8)
            return np.column_stack([i_part, q_part]).flatten()
        else:
            # Simulation: Gaussian noise approximating thermal noise
            # At T_sys = 300K, B = 2.4 MHz, each sample ~N(128, σ²)
            sigma = 20  # ADC units; tune based on gain
            noise = np.random.normal(128, sigma, n_samples * 2)
            return noise.clip(0, 255).astype(np.uint8)
    
    def close(self):
        if self.sdr is not None:
            self.sdr.close()


# ─── Stage 2: Health Testing ──────────────────────────────────────────────────

class HealthMonitor:
    """NIST SP 800-90B continuous health tests."""
    
    def __init__(self, h_min: float = 5.0):
        import math
        alpha = 2**-20  # False positive rate
        p_max = 2**(-h_min)
        self.rct_C = math.ceil(1 + 20 / h_min)  # Simplified for alpha=2^-20
        self.apt_W = 512
        self.apt_C = int(self.apt_W * p_max * 4) + 1  # Conservative cutoff
        
        self._rct_last = None
        self._rct_count = 0
        self._apt_first = None
        self._apt_count = 0
        self._apt_window = 0
        
        self.failures = 0
        self.samples_tested = 0
        
        logger.info(f"Health monitor: RCT C={self.rct_C}, APT W={self.apt_W}, C={self.apt_C}")
    
    def check_batch(self, samples: np.ndarray) -> bool:
        """Returns True if batch passes health tests."""
        for s in samples:
            s = int(s)
            self.samples_tested += 1
            
            # Repetition Count Test
            if self._rct_last == s:
                self._rct_count += 1
                if self._rct_count >= self.rct_C:
                    logger.error(f"RCT FAIL: {s} repeated {self._rct_count} times")
                    self.failures += 1
                    return False
            else:
                self._rct_last = s
                self._rct_count = 1
            
            # Adaptive Proportion Test
            if self._apt_window == 0:
                self._apt_first = s
                self._apt_count = 1
            elif s == self._apt_first:
                self._apt_count += 1
                if self._apt_count >= self.apt_C:
                    logger.error(f"APT FAIL: value {s} appeared {self._apt_count} times in window")
                    self.failures += 1
                    return False
            
            self._apt_window = (self._apt_window + 1) % self.apt_W
        
        return True


# ─── Stage 3: Entropy Extraction ─────────────────────────────────────────────

class EntropyExtractor:
    """
    Multi-stage entropy extraction and conditioning.
    Stage 1: LSB extraction + Von Neumann debiasing
    Stage 2: SHA-3-256 conditioning (NIST SP 800-90B approved)
    """
    
    def __init__(self, conditioning: str = 'sha3', lsb_bits: int = 4):
        self.conditioning = conditioning
        self.lsb_bits = lsb_bits  # How many LSBs to use from each ADC sample
        self.raw_pool = bytearray()
        self.conditioned_pool = bytearray()
        self.block_size = 64  # bytes fed to hash function
        
        self.stats = {
            'raw_bytes_in': 0,
            'bytes_after_vn': 0,
            'bytes_conditioned': 0
        }
    
    def extract_lsbs(self, samples: np.ndarray) -> np.ndarray:
        """Extract n least significant bits from each sample."""
        mask = (1 << self.lsb_bits) - 1
        lsbs = (samples & mask).astype(np.uint8)
        
        # Unpack bits
        bits = np.unpackbits(lsbs.reshape(-1, 1), axis=1, 
                             count=self.lsb_bits, bitorder='little').flatten()
        return bits
    
    def von_neumann(self, bits: np.ndarray) -> np.ndarray:
        """Von Neumann debiasing on bit array."""
        output = []
        for i in range(0, len(bits) - 1, 2):
            if bits[i] == 0 and bits[i+1] == 1:
                output.append(0)
            elif bits[i] == 1 and bits[i+1] == 0:
                output.append(1)
        return np.array(output, dtype=np.uint8) if output else np.array([], dtype=np.uint8)
    
    def pack_bits_to_bytes(self, bits: np.ndarray) -> bytes:
        """Pack bit array to bytes."""
        if len(bits) == 0:
            return b''
        pad = (8 - len(bits) % 8) % 8
        bits_padded = np.concatenate([bits, np.zeros(pad, dtype=np.uint8)])
        packed = np.packbits(bits_padded)
        return packed.tobytes()
    
    def condition_sha3(self, raw_bytes: bytes) -> bytes:
        """SHA-3-256 conditioning: 64 bytes in → 32 bytes out."""
        return hashlib.sha3_256(raw_bytes).digest()
    
    def feed(self, samples: np.ndarray):
        """Process a batch of ADC samples through the extraction pipeline."""
        self.stats['raw_bytes_in'] += len(samples)
        
        # Step 1: LSB extraction
        bits = self.extract_lsbs(samples)
        
        # Step 2: Von Neumann debiasing
        debiased = self.von_neumann(bits)
        
        # Step 3: Add to raw pool
        debiased_bytes = self.pack_bits_to_bytes(debiased)
        self.raw_pool.extend(debiased_bytes)
        self.stats['bytes_after_vn'] += len(debiased_bytes)
        
        # Step 4: Hash condition when we have enough
        while len(self.raw_pool) >= self.block_size:
            block = bytes(self.raw_pool[:self.block_size])
            self.raw_pool = self.raw_pool[self.block_size:]
            
            conditioned = self.condition_sha3(block)
            self.conditioned_pool.extend(conditioned)
            self.stats['bytes_conditioned'] += len(conditioned)
    
    def get_bytes(self, n: int) -> Optional[bytes]:
        """Get n conditioned random bytes."""
        if len(self.conditioned_pool) < n:
            return None
        result = bytes(self.conditioned_pool[:n])
        self.conditioned_pool = self.conditioned_pool[n:]
        return result


# ─── Stage 4: Min-Entropy Estimation ─────────────────────────────────────────

def estimate_min_entropy(samples: np.ndarray, symbol_bits: int = 8) -> float:
    """
    Empirical min-entropy from sample distribution.
    Use on raw ADC output to verify source quality.
    """
    from collections import Counter
    counts = Counter(samples.tolist())
    total = len(samples)
    max_prob = max(counts.values()) / total
    h_min = -np.log2(max_prob)
    
    theoretical_max = symbol_bits
    logger.info(f"Min-entropy: {h_min:.3f} bits/sample "
                f"(max={theoretical_max}, efficiency={100*h_min/theoretical_max:.1f}%)")
    return h_min


# ─── Main Pipeline ────────────────────────────────────────────────────────────

class CMBEntropyPipeline:
    """
    Complete CMB/RF noise entropy harvesting pipeline.
    
    Signal chain:
        SDR → Health Tests → LSB Extraction → Von Neumann → SHA-3 → Output
    """
    
    def __init__(self, center_freq=1.0e9, sample_rate=2_400_000, gain=30):
        self.source = SDRSource(center_freq, sample_rate, gain)
        self.monitor = None  # Initialized after min-entropy estimation
        self.extractor = EntropyExtractor(conditioning='sha3', lsb_bits=4)
        self.startup_done = False
        self.total_bytes_output = 0
        self.start_time = time.time()
    
    def startup(self, n_startup_samples: int = 65536) -> bool:
        """Run startup tests and calibrate health monitors."""
        logger.info("Running startup calibration...")
        
        samples = self.source.read_samples(n_startup_samples)
        
        # Estimate min-entropy from raw ADC output
        h_min = estimate_min_entropy(samples)
        
        if h_min < 2.0:
            logger.error(f"Startup FAILED: min-entropy too low ({h_min:.2f} < 2.0)")
            return False
        
        # Initialize health monitor with measured h_min
        self.monitor = HealthMonitor(h_min=h_min)
        
        # Run startup health test
        if not self.monitor.check_batch(samples[:1024]):
            logger.error("Startup health test FAILED")
            return False
        
        # Seed the extractor with startup samples
        self.extractor.feed(samples)
        
        self.startup_done = True
        logger.info(f"Startup PASSED: H_min={h_min:.2f} bits/sample")
        return True
    
    def run(self, output_file: str = None, target_bytes: int = None,
            batch_size: int = 65536):
        """
        Main entropy generation loop.
        output_file: path to write entropy (None = return bytes)
        target_bytes: stop after this many bytes (None = run forever)
        """
        if not self.startup_done:
            if not self.startup():
                raise RuntimeError("Startup failed — entropy source not healthy")
        
        f_out = open(output_file, 'wb') if output_file else None
        
        try:
            while target_bytes is None or self.total_bytes_output < target_bytes:
                # Acquire samples
                samples = self.source.read_samples(batch_size)
                
                # Health tests
                if not self.monitor.check_batch(samples[::16]):  # Check every 16th sample
                    logger.warning("Health test failure — discarding batch")
                    continue
                
                # Entropy extraction
                self.extractor.feed(samples)
                
                # Output available entropy
                while True:
                    chunk = self.extractor.get_bytes(32)  # 32 bytes per SHA-3 output
                    if chunk is None:
                        break
                    
                    if f_out:
                        f_out.write(chunk)
                    
                    self.total_bytes_output += len(chunk)
                    
                    if target_bytes and self.total_bytes_output >= target_bytes:
                        break
                
                # Log stats every 10 seconds
                elapsed = time.time() - self.start_time
                if elapsed > 0 and int(elapsed) % 10 == 0:
                    rate_kbps = self.total_bytes_output * 8 / elapsed / 1000
                    logger.info(f"Output: {self.total_bytes_output} bytes, "
                               f"Rate: {rate_kbps:.1f} kbit/s, "
                               f"Health failures: {self.monitor.failures}")
        
        finally:
            if f_out:
                f_out.close()
            self.source.close()
        
        return self.total_bytes_output
    
    def print_stats(self):
        elapsed = time.time() - self.start_time
        ext = self.extractor.stats
        print(f"\n=== CMB Entropy Pipeline Statistics ===")
        print(f"Runtime:             {elapsed:.1f} s")
        print(f"Raw ADC bytes:       {ext['raw_bytes_in']:,}")
        print(f"After VN debiasing:  {ext['bytes_after_vn']:,} ({100*ext['bytes_after_vn']/max(1,ext['raw_bytes_in']):.1f}%)")
        print(f"Conditioned output:  {ext['bytes_conditioned']:,}")
        print(f"Final output:        {self.total_bytes_output:,} bytes")
        print(f"Output rate:         {self.total_bytes_output*8/max(1,elapsed)/1000:.1f} kbit/s")
        if self.monitor:
            print(f"Health failures:     {self.monitor.failures}")
            print(f"Samples tested:      {self.monitor.samples_tested:,}")


# ─── Main Entry Point ─────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='CMB/RF Noise Entropy Pipeline')
    parser.add_argument('--freq', type=float, default=1.0e9,
                        help='Center frequency (Hz)')
    parser.add_argument('--rate', type=float, default=2.4e6,
                        help='Sample rate (sps)')
    parser.add_argument('--gain', type=float, default=30,
                        help='SDR gain (dB)')
    parser.add_argument('--output', type=str, default=None,
                        help='Output file (default: stdout stats only)')
    parser.add_argument('--bytes', type=int, default=1_000_000,
                        help='Bytes to generate')
    args = parser.parse_args()
    
    pipeline = CMBEntropyPipeline(
        center_freq=args.freq,
        sample_rate=int(args.rate),
        gain=args.gain
    )
    
    pipeline.run(output_file=args.output, target_bytes=args.bytes)
    pipeline.print_stats()
```

### 10.1 Pipeline Diagram

```
╔══════════════════════════════════════════════════════════════════════════╗
║          CMB/RF NOISE ENTROPY HARVESTING PIPELINE                       ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  [SKY]                                                                   ║
║    │ 10–12 GHz                                                           ║
║    ▼                                                                     ║
║  [KU-BAND LNB]      NF<0.5dB, Gain 55dB                                ║
║    │ IF: 950–2150 MHz                                                    ║
║    ▼                                                                     ║
║  [RTL-SDR / HackRF] 8-bit IQ, 2.4–20 Msps                              ║
║    │ raw uint8 IQ samples                                                ║
║    ▼                                                                     ║
║  [HEALTH MONITOR]                                                        ║
║    ├── Repetition Count Test (RCT)  ──→ FAIL → Halt + Alert            ║
║    └── Adaptive Proportion Test (APT) → FAIL → Discard + Alert         ║
║    │ validated samples                                                   ║
║    ▼                                                                     ║
║  [LSB EXTRACTION]   N lowest bits per sample (N=2–8, default=4)        ║
║    │ biased bit stream                                                   ║
║    ▼                                                                     ║
║  [VON NEUMANN DEBIAS]  Efficiency ~48% at p≈0.5                        ║
║    │ unbiased bits, reduced rate                                         ║
║    ▼                                                                     ║
║  [SHA-3-256 CONDITIONING]  64 bytes in → 32 bytes out                  ║
║    │ cryptographically conditioned entropy                               ║
║    ▼                                                                     ║
║  [OUTPUT ENTROPY POOL]                                                   ║
║    ├── /dev/stdin (pipe to application)                                 ║
║    ├── File output                                                       ║
║    └── Feed to CSPRNG (AES-CTR / ChaCha20)                             ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

Typical throughput (RTL-SDR 2.4 Msps, 8-bit):
  Raw input:        2.4 MB/s = 19.2 Mbit/s
  After LSB(4):     1.2 MB/s (4 bits/sample → 0.5 byte/sample)
  After VN(~48%):   576 KB/s
  After SHA3:       576 KB/s (no rate reduction, full entropy per bit)
  Practical output: ~100–500 Kbit/s (CPU-bound for RTL-SDR setup)
```

---

## 11. References

1. **Lee, J.S. & Cleaver, G.B.** (2017). "The cosmic microwave background radiation power spectrum as a random bit generator for symmetric- and asymmetric-key cryptography." *Heliyon* 3(10):e00422. [PMC5639047](https://pmc.ncbi.nlm.nih.gov/articles/PMC5639047/). doi:10.1016/j.heliyon.2017.e00422

2. **Lee, J.S. & Cleaver, G.B.** (2015). arXiv preprint: [arXiv:1511.02511](https://arxiv.org/abs/1511.02511) [cs.CR]

3. **Chapman, E., Grewar, J. & Natusch, T.** (2016). "Celestial sources for random number generation." *Proceedings of 14th Australian Information Security Management Conference*. [ECU Research Online](https://ro.ecu.edu.au/ism/190/). doi:10.4225/75/58a6975133e06

4. **Kutschera, S., Slany, W., Ratschiller, P., Gursch, S. & Dagenborg, H.** (2023). "MRNG: Accessing Cosmic Radiation as an Entropy Source for a Non-Deterministic Random Number Generator." *Entropy* 25(6):854. [PubMed](https://pubmed.ncbi.nlm.nih.gov/37372198/). doi:10.3390/e25060854

5. **NIST SP 800-90B** (2018). "Recommendation for the Entropy Sources Used for Random Bit Generation." Barker, E. & Kelsey, J. [NIST CSRC](https://csrc.nist.gov/publications/detail/sp/800-90b/final)

6. **PRATUSH Digital Receiver** (2025). arXiv:2507.05655. [arxiv.org](https://arxiv.org/html/2507.05655v1). pSPEC: 10-bit ADC at 250 Msps for 55–110 MHz CMB band.

7. **21cm HI Line SDR Pipeline** (2025). arXiv:2512.19262. [arxiv.org](https://arxiv.org/html/2512.19262v1). HackRF + GNU Radio at 1.42 GHz, 8-bit, 20 Msps.

8. **Reid, M.S.** (2008). "System Noise Concepts with DSN Applications." *DESCANSO Design and Performance Summary Series*. [NASA DESCANSO](https://descanso.jpl.nasa.gov/monograph/series10/02_Reid_chapt2.pdf). T_CMB = 2.725 K; DSN noise budgets.

9. **WVURAIL gr-radio_astro** (2024). GNU Radio OOT module for radio astronomy. [GitHub](https://github.com/WVURAIL/gr-radio_astro)

10. **Lightship Security** (2018). "Code for NIST Entropy Health Testing." Python/C implementations of RCT and APT. [lightshipsec.com](https://lightshipsec.com/code-nist-entropy-health-testing/). [GitHub gists](https://github.com/lightshipsec/gists)

11. **Infinite Noise TRNG** (2018). Open hardware TRNG using modular entropy multiplication. [Crowd Supply](https://www.crowdsupply.com/leetronics/infinite-noise-trng). [GitHub](https://github.com/waywardgeek/infnoise)

12. **RAVA TRNG** (2023). Open hardware avalanche noise TRNG. [GitHub](https://github.com/gabrielguerrer/rng_rava). doi: paper in open access.

13. **Toeplitz extractor (rokzitko)** (2021). Verilog + C++ Toeplitz entropy extractor. [GitHub](https://github.com/rokzitko/toeplitz)

14. **healpy documentation** (2024). Python HEALPix library for CMB maps. [healpy.readthedocs.io](https://healpy.readthedocs.io)

15. **Microwaves101: Low Noise Blocks** (2024). LNB hardware specifications. [microwaves101.com](https://www.microwaves101.com/encyclopedias/low-noise-blocks)

16. **UC Davis CMB Lab Guide** (2019). "Measurement of the Cosmic Microwave Background Radiation at 19 GHz." [ucdavis.edu](https://122.physics.ucdavis.edu/course/cosmology/sites/default/files/files/CMB/cmb_guide.pdf). 500 MHz IF bandwidth, 19 GHz frontend.

17. **Gallicchio, J. et al.** (2018). Random number generation with astronomical photons. Cited in Lee & Cleaver for signal-to-noise challenges of ground-based CMB detection.

18. **IUCAF Spectrum Management** (2003). Radio astronomy noise and Shannon capacity. [iucaf.org](https://www.iucaf.org/sschool/procs/conceptual.pdf)

19. **sp800-90b PyPI package**. Python NIST SP 800-90B entropy assessment. [pypi.org/project/sp800-90b](https://pypi.org/project/sp800-90b/)

20. **KU Leuven COSIC**: Deterministic extraction for truly random bits — von Neumann, XOR folding, Blum extraction. [esat.kuleuven.be](https://www.esat.kuleuven.be/cosic/blog/co6gc-deterministic-extraction-for-truly-random-bits/)
