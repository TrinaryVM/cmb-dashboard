# CMB Hardware Research: Practical Setups for Detecting Cosmic Microwave Background Radiation as an Entropy Source

## Executive Summary

The Cosmic Microwave Background (CMB) is a 2.725 K blackbody radiation field peaking at ~160 GHz (per-frequency Planck peak) or ~283 GHz (per-wavelength Wien peak). It is the most isotropic, spectrally stable, and cosmologically fundamental noise source accessible to a ground-based receiver — making it a theoretically ideal entropy source. The central challenge: every practical receiver has a noise temperature 10–100× higher than 2.725 K, so the CMB contributes only a small fraction of total system noise. Statistical extraction techniques, differential radiometry, and long integration times are required to isolate the CMB component.

Key conclusions:
- **Direct real-time CMB isolation is not feasible with consumer SDR dongles** operating alone. The CMB is ~2.725 K; typical SDR-based system noise temperatures are 500–3000 K equivalent.
- **The CMB can be extracted statistically** as a component of total sky noise using sky-dip (radiometric) techniques with a calibrated system, as demonstrated in university physics labs.
- **For entropy/RNG purposes**, the CMB does not need to be isolated in real time — the raw broadband noise output of a microwave receiver pointed at cold sky contains a guaranteed CMB component whose fluctuations are fundamentally quantum/cosmological in origin.
- **Best affordable frequency window**: 10–20 GHz. 19 GHz is a proven university-lab frequency; 11–12 GHz Ku-band commercial LNBs are cheapest. Below ~4 GHz, galactic synchrotron emission dominates; above ~30 GHz, atmospheric water vapor absorption increases.

---

## 1. Physics Background

### CMB Spectrum and Detectable Frequencies

| Parameter | Value |
|-----------|-------|
| CMB temperature | 2.725 K |
| Planck peak (per Hz) | ~160 GHz |
| Wien peak (per wavelength) | ~283 GHz |
| Rayleigh-Jeans regime (ν ≪ 57 GHz) | Power ∝ ν² T |
| Ground detection window | 1–30 GHz (atmospheric transparency) |
| Preferred amateur frequencies | 10–20 GHz (low RFI, commercial LNBs) |

At microwave frequencies (1–30 GHz), the CMB is in the Rayleigh-Jeans regime. Brightness temperature is frequency-independent and equals 2.725 K across this band. This means a receiver at 4 GHz, 12 GHz, or 19 GHz all see the same 2.725 K from the CMB — the choice of frequency is driven by available hardware, atmospheric opacity, and RFI environment.

### Why 10–20 GHz?

- **Below ~1 GHz**: Galactic synchrotron radiation (brightness temperature ~ thousands of K toward the galactic plane) overwhelms the CMB.
- **1–4 GHz**: Synchrotron still significant; heavy RFI (cellular, WiFi, GPS).
- **4–10 GHz (C-band)**: Synchrotron dropping; good window. C-band LNBs available with 15–30 K noise temperature.
- **10–20 GHz (Ku/Ka-band)**: Synchrotron negligible; commercial satellite LNBs cheaply available; preferred for amateur CMB work. Used by UC Davis and Columbia University physics labs.
- **>30 GHz**: Atmospheric water vapor and oxygen absorption become significant; hardware costs increase sharply.

### The Rayleigh-Jeans Approximation

At frequency ν, brightness temperature T_B, the received noise power is:

```
P = k · T_B · B
```

where k = 1.38 × 10⁻²³ J/K (Boltzmann constant), B = bandwidth in Hz.

For CMB at 19 GHz in B = 500 MHz bandwidth:
```
P_CMB = 1.38e-23 × 2.725 × 500e6 = 1.88e-14 W = 18.8 fW
```

This is the actual received CMB power — an extraordinarily small signal.

---

## 2. The Core SNR Challenge

### Noise Temperature Hierarchy

The total system noise temperature is the sum of all contributors:

```
T_sys = T_CMB + T_atm + T_spillover + T_receiver
```

| Component | Typical Value (zenith, dry conditions) | Notes |
|-----------|----------------------------------------|-------|
| CMB | 2.725 K | The signal of interest |
| Atmosphere (zenith, 10–20 GHz) | 2–15 K | Varies with humidity, elevation |
| Galactic background (high latitude) | 0.5–5 K at 10 GHz | Decreases with frequency |
| Ground spillover (typical dish) | 5–20 K | Highly dependent on antenna design |
| LNB/receiver (consumer Ku-band) | 40–70 K (NF 0.5–0.8 dB) | Dominates completely |
| RTL-SDR dongle alone | 500–3000 K (NF 5–12 dB) | Far too noisy |

**The CMB contributes roughly 2.7/T_sys of total noise power.** With a consumer Ku-band LNB (T_sys ≈ 60–80 K total), the CMB represents ~3–4% of total noise power. With an RTL-SDR alone at 1 GHz (T_sys ≈ 1000 K), it is 0.27%.

### SNR Calculation

For a total-power radiometer, the minimum detectable temperature change (radiometric resolution) is given by the **radiometer equation**:

```
ΔT_min = T_sys / √(B × τ)
```

where:
- T_sys = system noise temperature (K)
- B = pre-detection bandwidth (Hz)  
- τ = post-detection integration time (s)

**Example: Ku-band LNB amateur setup**

| Parameter | Value |
|-----------|-------|
| T_sys | 70 K (2.725 K CMB + 10 K atm + 57 K LNB) |
| Bandwidth B | 500 MHz (typical LNB noise bandwidth) |
| Integration time τ | 100 s |
| ΔT_min (total power) | 70 / √(500e6 × 100) = **9.9 mK** |
| CMB signal detectable? | Yes — 2.725 K >> 9.9 mK |

The CMB is not individually detectable in a single short measurement, but over long integration, its contribution to sky brightness temperature (vs. ground/hot load reference) is measurable via **sky-dip calibration**.

**Dicke switching doubles ΔT_min but provides gain stability:**

```
ΔT_min (Dicke) = 2 × T_sys / √(B × τ)
```

For the same parameters: **19.8 mK** — still far better than the 2.725 K CMB signal.

### Why CMB is Still Accessible Despite Low SNR

1. **Sky dip method**: Measure sky at multiple zenith angles. Atmosphere scales as sec(θ) but CMB is isotropic. Extrapolating to zero airmass (sec θ = 0) gives T_CMB directly.
2. **Differential measurement**: CMB contributes 2.725 K to sky temperature vs. ~2 K for a cold sky reference pointed to deep space. The difference is detectable.
3. **Statistical extraction**: Even if the CMB cannot be isolated in any single sample, its Gaussian fluctuations are embedded in the output and contribute genuine quantum entropy.

---

## 3. Antenna Options

### 3.1 Horn Antennas

Horn antennas are preferred for CMB work because of their low sidelobe response (minimizing ground thermal pickup), well-defined beam, and predictable efficiency.

#### Commercial and Semi-Commercial Options

| Type | Frequency Range | Gain | Approx. Cost | Notes |
|------|----------------|------|--------------|-------|
| Pyramidal horn (aluminum sheet, DIY) | 1–4 GHz | 15–20 dBi | $50–$200 materials | Harvard/CFA design; student-buildable |
| Potter horn (corrugated mode transformer) | 10–30 GHz | 20–25 dBi | $500–$2000 (surplus) | Ultra-low sidelobes; used at UC Davis 19 GHz CMB lab |
| Smooth-walled conical horn | 4–18 GHz | 15–22 dBi | $200–$800 (surplus/eBay) | Simpler than corrugated; higher sidelobes |
| Corrugated horn (3D-printed + conductive filament) | Ka-band 28 GHz | ~20 dBi | $100–$300 materials | PMC Scientific Reports 2023; good sidelobe suppression |
| Double-ridged waveguide horn (commercial, e.g., ETS-Lindgren) | 1–18 GHz | 5–14 dBi | $400–$6000 | Broadband; used in EMC testing; wideband but lower gain |
| Standard gain horn (EMC shop, e.g., SGHA2.6G) | 1.7–2.6 GHz | 15 dBi | ~$320–$3200 (new/refurb) | Fixed narrow band; better suited for single-frequency CMB work |

**DIY Cardboard/Foil Horn (< $100)**: University of the Pacific students built a working 1.4 GHz radio telescope from cardboard, foil, a low-cost RF amplifier, and a Raspberry Pi for under $100. This approach demonstrates low-cost horn construction feasibility, though noise performance is limited by construction tolerances.

**Harvard/CFA 21 cm Horn**: Aluminum sheet-metal riveted pyramidal horn, 75 cm × 59 cm aperture, ~20 dBi gain, built entirely by students for under $300. This is the gold standard for affordable single-frequency horn radio telescopes.

#### Key Horn Design Considerations for CMB

- **Sidelobes**: Must be < −20 dB to prevent ground thermal pickup (ground ≈ 290 K, sky ≈ 5–15 K). Potter/corrugated horns achieve < −30 dB.
- **Ground shield**: Even with a horn, the antenna should point above 20° elevation to prevent direct ground pickup.
- **Waveguide interface**: Most horns at 10+ GHz use waveguide (WR-75 for 10–15 GHz, WR-51 for 15–22 GHz), requiring a matched LNB or waveguide-to-coax transition.

### 3.2 Satellite Dish Conversions

Parabolic dishes with satellite LNBs are the most cost-effective route to a microwave radiometer.

| Dish Type | Diameter | Gain (at 12 GHz) | Approx. Cost | Notes |
|-----------|----------|------------------|--------------|-------|
| DirecTV 18″ offset dish | 45 cm | ~28 dBi | $10–$40 (surplus) | Common; offset feed reduces ground pickup |
| Standard Ku-band offset dish | 60–90 cm | 31–35 dBi | $20–$80 | Common surplus; excellent for solar/lunar noise |
| C-band prime focus dish (TVRO) | 1.8–3.0 m | 38–44 dBi | $100–$500 | Lower frequency; needs C-band LNB; better sensitivity |
| WiFi parabolic grid dish (2.4 GHz) | 60–100 cm | ~18–22 dBi | $30–$60 | Used for hydrogen line by RTL-SDR.com; repurposable |
| Three Hills Observatory 750×850 mm Ku dish | 75 cm equiv. | ~31 dBi | Recycled/surplus | Detected sun, moon, attempted Tau A at 12 GHz |

**Offset dish vs. prime focus**: Offset dishes (most modern Ku-band satellite dishes) have better ground sidelobe rejection because the dish edge doesn't intercept the feed's radiation pattern. Prime-focus dishes (older C-band TVRO) are more susceptible to ground noise but offer larger aperture.

**Dish gain vs. CMB detection**: Higher gain improves angular resolution but does NOT increase total CMB power received per solid angle — because the CMB fills the entire sky uniformly. Gain matters for **reducing ground spillover** (seeing less hot ground per sky solid angle), not for increasing CMB signal level.

### 3.3 Patch Antennas

Patch antennas are generally **not suitable** for CMB detection because:
- Very wide beam (hemisphere coverage) maximizes ground thermal pickup
- Low gain (2–6 dBi) means the receiver dominates entirely
- Narrow bandwidth in standard designs

**Exception**: Patch antenna arrays with phased beamforming could in principle work, but complexity and cost exceed dish+LNB approaches at amateur budget levels.

---

## 4. Receiver/LNB Options

### 4.1 Commercial Satellite LNBs

LNBs (Low Noise Block downconverters) are ideal first-stage amplifiers because they have the LNA directly at the waveguide/feed with no cable loss before amplification. This is the critical point — Friis's formula shows noise contribution of subsequent stages is divided by the first-stage gain.

#### Ku-Band LNBs (~10.7–12.75 GHz input, ~950–2150 MHz IF output)

| Product | Noise Figure | Noise Temp | Gain | LO Stability | Approx. Cost | Notes |
|---------|-------------|------------|------|--------------|--------------|-------|
| Generic Ku-band LNB (various) | 0.1–0.2 dB (claimed) | 7–15 K (claimed) | 50–65 dB | ±1–5 MHz | $5–$15 | Claims are often optimistic; real NF ~0.5–1 dB |
| Generic Ku-band LNB (realistic) | 0.5–1.0 dB | 35–75 K | 50–65 dB | ±1–5 MHz | $5–$15 | Practical performance; typical for CMB amateur work |
| Bullseye 10 kHz BE01 TCXO LNB | 0.5 dB | ~35 K | 50–66 dB | ±10 kHz (23°C), ±30 kHz (−20–60°C) | $20–$30 | Ultra-stable LO; ideal for narrowband applications |
| Avenger KSC321S-2 | ~0.7–1.0 dB | ~50–75 K | ~55 dB | ±1 MHz | $10–$20 | Popular for amateur radio astronomy |
| Norsat 1007B (professional) | 0.7 dB | ~51 K | 65 dB | ±1 kHz (OCXO) | $200–$400 | Professional grade; OCXO LO |

**Ku-band LNB IF output note**: These LNBs downconvert 10.7–12.75 GHz to 950–2150 MHz IF, which is within range of RTL-SDR dongles (24–1766 MHz) and other SDRs. This is the standard amateur approach.

**Noise figure conversion**: NF (dB) to noise temperature T_noise = 290 × (10^(NF/10) − 1)

| NF (dB) | Noise Temperature (K) |
|---------|-----------------------|
| 0.1 | 6.7 K |
| 0.5 | 35 K |
| 0.8 | 59 K |
| 1.0 | 75 K |
| 2.0 | 170 K |
| 3.0 | 289 K |
| 5.0 | 627 K |
| 10.0 | 2610 K |

#### C-Band LNBs (~3.4–4.2 GHz input, ~950–1750 MHz IF output)

C-band LNBs traditionally have **lower noise temperatures** than Ku-band because of more mature LNA technology at lower frequencies:

| Product | Noise Temperature | Gain | Approx. Cost | Notes |
|---------|-------------------|------|--------------|-------|
| Norsat 8225R C-band LNB | 25 K | 62 dB | $125–$220 | Professional; DRO LO; ±250 kHz stability |
| XMW C-band INT LNB | 30 K | 62 dB | $50–$150 | Phase noise −78 dBc at 1 kHz |
| Generic C-band LNBs | 15–30 K | 55–65 dB | $10–$40 (surplus) | Typical TVRO C-band; good for radio astronomy |
| Agilis ACA series C-band LNB | 15–20 K | 55–65 dB | $200–$500 | Premium professional grade |

**C-band advantage for CMB**: With T_receiver ≈ 20–25 K, the CMB (2.725 K) represents ~10% of total receiver noise — substantially better than Ku-band (CMB ≈ 4% of total noise). C-band requires a larger dish (1.2 m minimum for reasonable gain) and more RFI management.

### 4.2 Dedicated Radiometer Receivers

Professional CMB detection requires cryogenically cooled HEMT (High Electron Mobility Transistor) amplifiers:

| Technology | Noise Temperature | Cooling | Approx. Cost | Notes |
|------------|------------------|---------|--------------|-------|
| Room-temp HEMT LNA (Ku-band) | 40–70 K | None | $50–$300 | Consumer LNB; practical for amateurs |
| Room-temp HEMT LNA (Ka-band, 30 GHz) | 80–150 K | None | $200–$1000 | Higher NF at higher frequency |
| Cooled HEMT (20 K physical temp) | 5–15 K | Closed-cycle cryocooler | $5000–$50000 | Research/professional only |
| SIS (Superconductor-Insulator-Superconductor) | ~1 K (quantum limited) | <0.3 K He | $50000+ | Used by Planck, ALMA; amateur-inaccessible |
| Transition Edge Sensor (TES) bolometer | Sub-Kelvin NEP | <0.3 K He | $50000+ | CMB polarization missions |

**Practical conclusion for amateurs**: Consumer Ku-band or C-band LNBs with noise temperatures of 25–70 K are the practical starting point. The CMB at 2.725 K is below receiver noise, but this does not preclude CMB extraction via calibration and sky-dip methods.

### 4.3 SDR Backends

Once the LNB downconverts to IF (950–2150 MHz), any SDR receiver can digitize the signal:

| Device | Frequency Range | Sample Rate | Bit Depth | NF | Approx. Cost | Notes |
|--------|----------------|-------------|-----------|-----|--------------|-------|
| RTL-SDR Blog V3 | 24–1766 MHz | 2.4 MSPS | 8-bit | 3–4 dB (500–1500 K) | $35–$45 | Adequate for LNB IF; NF irrelevant if LNB gain ≥ 50 dB |
| RTL-SDR Blog V4 | 24–1766 MHz | 2.4 MSPS | 8-bit | ~3 dB | $40–$50 | Updated tuner; similar performance |
| Nooelec NESDR SMArTee XTR | 25–1750 MHz | 3.2 MSPS | 8-bit | ~3.5 dB | $30–$40 | Built-in bias tee for powering LNAs |
| HackRF One | 1 MHz–6 GHz | 20 MSPS | 8-bit | ~8–15 dB (very high NF) | $340–$370 (official) | Half-duplex; wide range; high NF makes it poor choice without external LNA |
| Airspy R2 | 24–1800 MHz | 10 MSPS | 12-bit | ~3.5 dB | ~$170 | Better dynamic range than RTL-SDR |
| KrakenSDR | 24–1766 MHz | 2.56 MSPS × 5 | 8-bit | ~3 dB | $499 | 5-channel coherent RTL-SDR; overkill for CMB but enables correlation radiometry |
| KerberosSDR | 24–1766 MHz | 2.4 MSPS × 4 | 8-bit | ~3 dB | ~$150–$200 | 4-channel; discontinued; predecessor to KrakenSDR |

**RTL-SDR + LNB cascade noise figure calculation** (Friis formula):

When LNB (G₁ = 10^(55/10) ≈ 316228, NF₁ = 0.7 dB = T₁ = 51 K) precedes RTL-SDR (NF₂ = 3.5 dB = T₂ = 627 K):

```
T_sys_total = T₁ + T₂/G₁ = 51 + 627/316228 = 51 + 0.002 ≈ 51 K
```

**The RTL-SDR's noise figure becomes completely irrelevant** after a high-gain LNB. The LNB dominates the system noise figure entirely, which is why consumer SDR dongles work perfectly as IF digitizers in this architecture.

### 4.4 LNAs for Lower Frequencies (< 2 GHz)

For hydrogen line (1.42 GHz) or lower-frequency work where satellite LNBs don't apply:

| Device | Center Frequency | NF | Gain | Cost | Notes |
|--------|-----------------|-----|------|------|-------|
| Nooelec SAWbird+ H1 | 1.42 GHz | ~0.8 dB | 40 dB | ~$45 | Hydrogen line; narrow 65 MHz BPF; not for CMB extraction |
| Nooelec SAWbird+ H1 Barebones | 1.42 GHz | ~1.05 dB | 40 dB | ~$45 | With 50Ω reference switch for calibration |
| Nooelec LANA (wideband) | 50 MHz–4 GHz | ~0.6 dB | 19 dB | ~$20 | Wideband; useful for general preamp |
| RTL-SDR Blog Wideband LNA | 50 MHz–2 GHz | ~0.5 dB | ~20 dB | ~$19 | Broadband LNA for general use |
| GPIO Labs Hydrogen Line LNA | 1.42 GHz | ~0.5 dB | ~20 dB | ~$50 | Filtered; similar to SAWbird |

**Note on SAWbird H1 for CMB**: The SAWbird H1 at 1.42 GHz is optimized for the hydrogen emission line — a specific spectral feature — not broadband CMB detection. Its narrow 65 MHz bandpass filter limits total power integration from CMB broadband noise. It is useful for radio astronomy broadly but not optimized for CMB radiometry.

---

## 5. Radiometer Designs

### 5.1 Total Power Radiometer

The simplest design: antenna → LNA/LNB → bandpass filter → square-law detector → integrator → output.

**Pros**: Simple; maximum bandwidth utilization; best raw sensitivity per unit time
**Cons**: Extremely sensitive to gain variations in amplifier chain. A 0.1% gain fluctuation in a 60 K system = 60 mK error. At integration times > 1–10 s, gain drift typically dominates over radiometric noise.

**Practical sensitivity limit**: Gain stability, not bandwidth. Requires frequent calibration (warm/cold loads).

**UC Davis 19 GHz CMB Lab (total power design)**:
- System noise temperature: ~60–80 K
- Bandwidth: 500 MHz (1.0–1.5 GHz IF BPF)
- Integration: 1 s per sample; 20 s per angle during sky dips
- Achieved sensitivity: ~10–20 mK per integration
- CMB detected at 2.725 K via sky-dip + atmospheric subtraction

### 5.2 Dicke Switching Radiometer

The Dicke radiometer, invented by Robert Dicke in 1946, switches the receiver input between the antenna and a reference load at 10–1000 Hz. The output is synchronously detected (lock-in amplifier equivalent).

**Block diagram**: Antenna → Dicke switch → LNA → detector → sync detector → integrator

**Key advantage**: Gain variations slower than the switching frequency cancel out. Makes the radiometer insensitive to slow drift, only sensitive to antenna-reference temperature difference.

**Resolution formula**:

```
ΔT_Dicke = 2 × T_sys / √(B × τ)  [reference noise = antenna noise]
```

When antenna and reference temperatures differ by ΔT_ref:

```
ΔT_Dicke = 2 × T_sys / √(B × τ) + (ΔG/G) × |T_antenna − T_reference|
```

**To minimize**: Set reference load temperature ≈ antenna temperature. For CMB work, a liquid nitrogen (77 K) cold load is ideal (closer to ~5–15 K sky temperature than 290 K room temperature).

**OH2AUE Amateur Dicke Radiometer (example)**:
- Frequency: 12 GHz (Ku-band)
- Dish: 28 cm offset parabolic
- Noise figure: 2.5 dB (105 K)
- Reference: 290 K room temperature load
- Resolution achieved: 7.8 mK (with room-temp terminations)
- With 40 K reference and 20 s integration: calculated 2.9 mK
- Detected: Sun, Moon, attempted Crab Nebula
- Switching: Orthomode transducer + ferotor (electromagnetic polarization switch) at 20–25 Hz

### 5.3 Noise-Adding Radiometer / Balanced Dicke

A variant where the reference noise is actively adjusted to match antenna noise, keeping the system at balance. The required noise injection power is the measurement. This eliminates the gain-variation term entirely but requires a calibrated noise source.

### 5.4 Correlation Radiometer

Uses two receivers connected to the same antenna (or two feeds) and cross-correlates their outputs. Receiver self-noise (uncorrelated between the two channels) cancels; sky signal (correlated) is preserved.

```
ΔT_correlation = T_sys / √(2 × B × τ)  [with identical uncorrelated receiver noise]
```

**Advantage**: Immune to gain fluctuations in each individual receiver; receiver noise doesn't limit sensitivity (theoretically). Used in CMB polarization experiments.

**Amateur implementation**: The KrakenSDR (5-channel coherent RTL-SDR, $499) could implement correlation radiometry if two channels see the same sky patch. Requires coherent sampling and careful cross-correlation software.

### 5.5 Integration Time Requirements

Using the radiometer equation ΔT = T_sys / √(B × τ):

| Setup | T_sys | B | τ for ΔT = 0.1 K | τ for ΔT = 10 mK |
|-------|-------|---|------------------|-------------------|
| Ku LNB + RTL-SDR (total power) | 55 K | 500 MHz | 0.12 s | 121 s |
| C-band LNB (Norsat 25K) | 30 K | 200 MHz | 0.45 s | 45 s |
| Consumer LNB + sky spillover | 80 K | 500 MHz | 0.26 s | 256 s |
| Dicke switched (same Ku LNB) | 55 K (Dicke ×2) | 500 MHz | 0.48 s | 484 s |

**Practical caveat**: These are thermal noise limits. Gain stability typically limits actual sensitivity to ~20–50 mK for uncooled consumer LNBs without frequent recalibration. With cold/warm load calibration every 5–15 minutes, 10–30 mK total accuracy is achievable.

---

## 6. Specific Affordable Hardware

### 6.1 Complete Amateur CMB Detection Systems (By Budget)

#### Tier 1: Under $200 — Proof-of-Concept (Sun/Moon Noise Demonstration)

| Component | Product | Cost |
|-----------|---------|------|
| Dish | 18″ DirecTV offset dish (surplus/eBay) | $10–$30 |
| LNB | Generic Ku-band LNB (universal single output) | $10–$20 |
| LNB power injector (bias tee) | Mini-circuits ZFBT-4R2GW or similar | $5–$15 |
| SDR | RTL-SDR Blog V3 | $35–$45 |
| Software | GNU Radio or SDR# (free) | $0 |
| Coax + adapters | F-to-SMA adapter + coax | $5–$15 |
| **Total** | | **~$65–$125** |

**Capability**: Detect sun (easily), moon (just visible), measure cold sky vs. hot ground thermal contrast (~5 K vs. 273 K). Cannot directly isolate CMB but validates system thermometry. Equivalent to Three Hills Observatory 12 GHz setup.

#### Tier 2: $300–$700 — Amateur CMB Temperature Measurement

| Component | Product | Cost |
|-----------|---------|------|
| Dish | 60–90 cm Ku-band offset dish | $20–$80 |
| LNB | Bullseye BE01 TCXO LNB (0.5 dB NF, ±10 kHz stability) | $20–$30 |
| LNB power supply | 12V/18V bias tee or power injector | $10–$20 |
| SDR | RTL-SDR Blog V4 + dipole kit | $50 |
| Cold calibration load | Eccosorb absorber + small Styrofoam cooler + LN₂ (~$5/L) | $30–$80 |
| Warm load | Eccosorb absorber at room temperature | $10–$20 |
| Temperature sensors | Analog thermistors + ADC board | $10–$30 |
| Raspberry Pi (data acquisition) | Raspberry Pi 4 | $50–$80 |
| Software | GNU Radio (free); custom Python scripts | $0 |
| **Total** | | **~$200–$370** |

**Capability**: Sky-dip measurements; atmospheric subtraction; CMB temperature measurement accuracy ±1–3 K (limited by calibration and gain stability). Comparable to university teaching labs.

#### Tier 3: $700–$2000 — Serious Radiometry

| Component | Product | Cost |
|-----------|---------|------|
| Dish | 1.2–1.8 m C-band or Ku-band dish with motorized mount | $100–$400 |
| LNB | Norsat 8225R C-band LNB (25 K noise temperature) | $125–$220 |
| Dicke switch | PIN diode switch (Mini-Circuits ZFSWA2-63DR+) | $50–$100 |
| Backend SDR | Airspy R2 (12-bit ADC) | $170 |
| Calibration | Eccosorb + LN₂ Dewar ($100 for 10L size, ~$600 full size) | $100–$600 |
| LNA post-Dicke | Mini-Circuits ZX60-P33ULN+ (wideband LNA) | $30–$60 |
| Bandpass filter | Custom or Mini-Circuits component | $20–$100 |
| Data acquisition | PC + Python/GNU Radio | $200–$500 |
| **Total** | | **~$800–$2000** |

**Capability**: Dicke switching for gain stability; C-band reduces receiver noise dominance; CMB temperature measurement accuracy ±0.3–1 K; able to measure variation across sky (pointing away from galactic plane vs. toward it).

### 6.2 Specific Product Details

#### RTL-SDR Blog V3/V4
- **Frequency**: 24–1766 MHz
- **Sample rate**: 2.4 MSPS (stable), 3.2 MSPS (with some packet loss)
- **ADC bit depth**: 8-bit IQ
- **NF**: 3–4 dB (500–1000 K noise temperature) — **irrelevant with LNB preamp**
- **Bias tee**: Built-in (4.5V, 180 mA max) — powers SAWbird LNAs but NOT satellite LNBs (need 11.5–19V)
- **Cost**: V3 $35–45; V4 $40–50 (RTL-SDR.com official store)
- **CMB use**: Excellent IF digitizer after LNB downconversion. Use GNU Radio for power spectral density integration.

#### HackRF One
- **Frequency**: 1 MHz–6 GHz
- **Sample rate**: up to 20 MSPS
- **ADC bit depth**: 8-bit IQ
- **NF**: 8–15 dB (very high — ~2600–10000 K noise temperature)
- **Cost**: ~$340–$370 (Great Scott Gadgets official); $100–$200 for clones (lower reliability)
- **CMB use**: Theoretically could receive Ku-band IF directly but NF is catastrophic. **Must use external LNB**. Better for its transmit capability than receive sensitivity. The RTL-SDR V3 is a better pure receiver for CMB work despite lower frequency range — if combined with an LNB, both perform similarly since LNB dominates NF.

#### Nooelec SAWbird+ H1
- **Center frequency**: 1420 MHz (hydrogen line)
- **Passband**: ~65 MHz (1385–1455 MHz)
- **Gain**: ≥40 dB
- **NF**: ~0.8 dB (≈58 K noise temperature)
- **Cost**: ~$45 (Nooelec store)
- **CMB use**: Not directly useful for CMB — too narrowband and wrong frequency concept. At 1.42 GHz, galactic synchrotron noise is significant. The hydrogen emission line signal itself is a spectral feature, not broadband CMB. However, the LNA chain design teaches key principles.

#### Bullseye TCXO LNB (BE01)
- **Input frequency**: 10.489–12.750 GHz
- **LO frequencies**: 9.750 / 10.600 GHz
- **IF output**: 739–2150 MHz
- **LO stability**: ±10 kHz (23°C), ±30 kHz (full outdoor temp range) — exceptional for a consumer LNB
- **Noise figure**: 0.5 dB (≈35 K noise temperature)
- **Gain**: 50–66 dB
- **Cost**: $20–$30 (RTL-SDR.com store, Elektor ~€25)
- **CMB use**: Best value Ku-band LNB for amateur radio astronomy. The frequency stability matters for narrowband work (QO-100 satellite); for CMB (broadband power detection), any stable LNB works, but the Bullseye's LO stability reduces local oscillator noise contamination in the IF band.

#### KrakenSDR
- **Channels**: 5-channel coherent RTL-SDR
- **Frequency**: 24–1766 MHz per channel
- **Sample rate**: 2.56 MSPS per channel
- **Cost**: $499 (Crowd Supply)
- **CMB use**: Enables correlation radiometry (cross-correlate 2+ channels on same sky signal). With 5 Bullseye LNBs on the same dish, coherent averaging reduces receiver noise contribution. Complex setup; primarily designed for direction finding.

### 6.3 RTL-SDR Limitations at Microwave Frequencies

The RTL-SDR dongle directly receives up to ~1766 MHz — it **cannot** directly receive Ku-band (10–12 GHz) or CMB frequencies. The solution chain:

```
CMB (10.7–12.75 GHz) → Dish/Horn → LNB (downconverts to 950–2150 MHz) → RTL-SDR (digitizes IF)
```

At this IF frequency, the RTL-SDR works perfectly. Its ADC quantization noise (8-bit) is not a limiting factor because the LNB provides 50–65 dB of gain, making the signal well above quantization thresholds.

**Actual RTL-SDR NF contribution**: After an LNB with 55 dB gain (factor 316,000) and 51 K noise temperature:

```
T_SDR_referred_to_input = T_SDR_noise / G_LNB = 1000 K / 316000 = 0.003 K
```

Negligible. The RTL-SDR becomes an ideal detector behind any high-gain LNB.

---

## 7. DIY and Amateur Projects

### 7.1 UC Davis Physics Department CMB Lab (Educational Reference)

**Status**: Operational university teaching experiment  
**Frequency**: 19 GHz  
**Hardware**: Potter horn antenna (19 GHz), custom 19 GHz LNB (Irish satellite TV receiver, 50–60 dB gain), HP 8481D power sensor + HP E4418B power meter, LabJack U3-HV DAQ, Lakeshore 218 temperature monitor  
**Calibration**: Cold load (Eccosorb in LN₂ at 77 K) + warm load (Eccosorb at 290 K); calibrate before each sky-dip run  
**Method**: Sky-dip at multiple zenith angles (0–70°); plot T_θ vs. sec(θ); extrapolate to zero airmass for T_CMB  
**Results**: Students routinely measure T_CMB to ±0.5–1 K accuracy  
**Cost to replicate**: ~$2000–$5000 for the complete setup including 19 GHz Potter horn; the LNB alone was described as "available at reasonable cost"

**Key insight from UC Davis**: 19 GHz is preferred because (1) low RFI in northern sky in the US, (2) convenient commercial LNB available for Irish satellite TV in this band, (3) simpler to build a low-sidelobe horn at 19 GHz than at 10 GHz (horn physical size scales with wavelength), (4) atmosphere is mostly transparent at 19 GHz.

### 7.2 Columbia University CMB Lab

**Status**: University physics teaching lab  
**Equipment**: Horn antenna (~15 cm diameter), radiometer, Newlett Packard 436A Power Meter, Eccosorb calibration loads, laptop with BasicReadout.py  
**Method**: Same sky-dip technique, calibration with LN₂ cold load  
**Reference**: CMB manual.pdf (Columbia University physics department)

### 7.3 Three Hills Observatory Ku-Band Radio Astronomy (Amateur)

**Status**: Amateur amateur experiment, 2007+  
**Hardware**: Ku-band analogue satellite TV setup; 750×850 mm offset elliptical dish; satellite finder (wideband, >1 GHz bandwidth)  
**Detections**: Cold sky zenith (~5 K equivalent), hot ground (273 K), solar transit (strong), lunar transit (2–3% of solar signal), attempted Tau A (Crab Nebula, inconclusive due to variability)  
**Cost**: Minimal — recycled consumer satellite TV equipment  
**CMB relevance**: Cold sky reading of ~5 K at zenith is consistent with CMB + atmosphere + spillover. The experiment demonstrates that consumer Ku-band equipment can measure sky brightness temperatures at kelvin-scale resolution.  
**Reference**: [Three Hills Observatory](http://www.threehillsobservatory.co.uk/astro/radio_astronomy/radio_astronomy_1.htm)

### 7.4 OH2AUE Amateur Dicke Radiometer (Finland)

**Status**: Detailed technical amateur project  
**Hardware**: 28 cm offset parabolic dish; 12 GHz front end (2.5 dB NF); ferotor (electromagnetic polarization switch for Dicke switching at 20–25 Hz); satellite TV tuner for IF downconversion; homebrew power meter (DC–11 GHz); various dish sizes tested up to 6.4 m  
**Achieved sensitivity**: 7.8 mK with 290 K reference load; calculated 2.9 mK with 40 K reference and 20 s integration  
**Detections**: Sun, Moon reliably; strong radio sources (Cas A, Tau A, Cyg A) with larger dish  
**Cost**: ~$600 for LN₂ Dewar (Finland), surplus dish and LNB equipment  
**Key insight**: With appropriate Dicke switching, amateur setups can achieve <10 mK sensitivity — sufficient to detect the CMB contribution to sky temperature (when combined with proper calibration and sky-dip)  
**Reference**: [OH2AUE Dicke Radiometer Article](https://73.fi/oh2aue/dicke_uk.htm)

### 7.5 RTL-SDR + WiFi Dish Hydrogen Line Detection

**Status**: Widely replicated; RTL-SDR.com standard tutorial  
**Hardware**: 100×60 cm WiFi parabolic grid dish (~$50), Nooelec SAWbird+ H1 LNA ($45), RTL-SDR Blog V3 ($35)  
**Frequency**: 1.42 GHz hydrogen line  
**Total cost**: ~$130  
**Detection**: Galactic hydrogen emission line clearly detected in 30 s integration; galactic plane structure mapped by Earth rotation drift scan  
**CMB relevance**: This is hydrogen line emission work, not CMB. However, the same architecture (dish + LNA + SDR) is directly applicable to CMB at higher frequencies with LNB substituted for SAWbird.

### 7.6 CCERA (Canadian Centre for Experimental Radio Astronomy)

**Status**: Amateur-professional hybrid project  
**Hardware**: Multiple dishes including 6.5–6.8 GHz RF band downconverted to 825 MHz IF, then RTL-SDR  
**Work**: Sky maps at 21 cm; moon temperature measurements at Ku-band; various microwave radiometry experiments  
**Reference**: [CCERA](https://www.ccera.ca)

---

## 8. CMB as Entropy/RNG Source

### 8.1 The Physical Basis

The CMB has two properties making it an attractive entropy source:

1. **Quantum origin**: CMB photons were created at recombination (~380,000 years after Big Bang) and their arrival times and energies follow quantum statistics (Poisson photon counting noise + Bose-Einstein fluctuations).

2. **Cosmological origin**: CMB temperature anisotropies (primordial fluctuations of 10⁻⁵ K amplitude) trace quantum density fluctuations in the early universe — fundamentally unpredictable and unreproducible.

Both contributions are in principle indistinguishable from the perspective of a ground-based receiver, but both generate genuine quantum entropy.

### 8.2 The SNR Challenge for Entropy Extraction

The difficulty: a receiver pointed at cold sky is dominated by its own noise temperature (T_sys >> T_CMB = 2.725 K). The output of a practical receiver is:

```
V_out = G × (T_CMB + T_atm + T_spillover + T_receiver) × k × B
```

The CMB contributes only ~3–5% of the total power (for T_sys ≈ 60 K). **For entropy purposes, this is actually fine** — here's why:

1. **All thermal noise is fundamentally quantum**: The receiver noise temperature itself arises from Johnson-Nyquist (thermal) noise, which is quantum mechanical in origin (zero-point fluctuations). Every wideband noise source is a source of genuine physical entropy.

2. **The CMB component adds cosmological entropy**: The 2.7 K component embedded in the total system noise contributes photon shot noise that originates from outside the Earth — genuinely external, uncorrelated with any local process.

3. **Statistical extraction is possible**: Over long integration, the sky-dip technique can confirm that the 2.725 K component is present and contributing. Even if you can't isolate a single CMB photon event, the aggregate noise sample captures CMB entropy in proportion to T_CMB/T_sys.

### 8.3 Published Approaches to CMB-Based RNG

**Lee & Cleaver (2017)** — "The CMB power spectrum as a random bit generator for symmetric- and asymmetric-key cryptography" ([Heliyon/PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5639047/)):

- CMB temperature anisotropy fluctuations extracted via pseudo-C_l power spectrum analysis
- Demonstrated conformance to FIPS 140-2 cryptographic standard
- Ground-based detection feasible: "a terrestrial radio telescope would suffice"
- Challenges: low ground-based SNR; large number of received photons are noise (not CMB-origin)
- Future small telescopes (1 m) viable as detector technology improves
- Applicable to symmetric (Vernam cipher / one-time pad) and asymmetric cryptography

**Gallicchio et al. (2018)** — Used CMB photons from opposite sky patches to generate random settings in Bell inequality tests, demonstrating CMB as a source of space-like separated randomness:
- CMB photons serve as truly independent random bits, uncorrelated with local hidden variables
- Ground-based detection with ~0.1% CMB photon fraction among noise photons still yields valid settings
- Published in Physical Review Letters 118, 140402 (2017)

**Celestial Sources for RNG (Soo et al., 2016)** — Used data from radio telescope (6.5–6.8 GHz band, C-band LNB, RTL-SDR backend) as RNG seed material:
- Described as: "available at the output of a radio telescope consists of the combination of system noise, a 2.73 K component from CMB, noise power from the celestial source, and interference"
- Passed SHA-256 deskewing and standard randomness tests
- Demonstrated that telescope noise (including CMB component) can serve as cryptographic seed

### 8.4 Practical Entropy Extraction Architecture

For a ground-based CMB-as-RNG system:

```
Horn/Dish (10–20 GHz) 
    → LNB (Ku-band, 0.5 dB NF, 50–65 dB gain)
    → Coax to indoor unit
    → RTL-SDR (digitizes IF noise)
    → GNU Radio: compute power spectral density or raw IQ samples
    → Post-processing: extract noise samples at Nyquist rate (2.4 MHz sample rate → 2.4M samples/sec)
    → Von Neumann debiaser or SHA-256 conditioner
    → Entropy pool (suitable for /dev/random seeding or DRBG input)
```

**Entropy rate estimate**: 
- SDR sample rate: 2.4 MSPS
- IQ samples: 8-bit I + 8-bit Q = 16 bits per sample
- Raw bit rate: 38.4 Mbps
- After Von Neumann whitening (removes bias, ~50% efficiency): ~19 Mbps
- After conservative entropy estimation (measured min-entropy of thermal noise is typically 2–5 bits per 8-bit sample in practice): 5–10 Mbps

**Min-entropy of thermal noise**: For an 8-bit ADC digitizing Gaussian thermal noise at optimal gain (noise fills ~3–4 ADC bit range), the min-entropy per sample is typically 6–7 bits. After conditioning: a 10–20 Mbps entropy stream is readily achievable.

### 8.5 Differential Technique for CMB Component Isolation

For entropy applications specifically claiming CMB origin (not just thermal noise), one approach:

1. **Two-position switching**: Alternate antenna between cold sky (CMB + atmosphere + LNB noise) and a 77 K cold load (LNB noise + cold load). The difference signal contains the sky minus cold load contribution: (T_CMB + T_atm − T_cold_load) ≈ (2.7 + 10 − 77) ≈ −64 K. This difference is dominated by the cold load level, not CMB.

2. **Sky dip correlation**: Simultaneously sample at multiple elevation angles. Correlated patterns across angles are atmospheric; uncorrelated residual at zenith angle extrapolation contains CMB. This proves CMB presence but is slow (minutes per measurement cycle), not suitable for high-throughput RNG.

3. **Accept the mixture**: The most practical approach for RNG: accept that the raw receiver noise output contains the CMB component as a guaranteed contributor, use the ensemble of thermal noise (LNB Johnson noise + CMB + atmosphere) as the entropy source, and defend its cryptographic quality on the grounds that thermal noise is quantum mechanical and non-repeatable regardless of the CMB fraction.

**Published defense of this approach** (Lee & Cleaver): "The quantum degeneracy ensures that ground-based CMB detectors are valid for pure cryptography; a malicious eavesdropper cannot bias the bitstream via local effects."

---

## 9. Key Practical Challenges and Mitigations

| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| Receiver noise (T_sys >> 2.725 K) | CMB is 3–5% of total system noise | Accept mixture for entropy; use sky-dip for CMB temperature measurement |
| Gain instability | Total-power radiometer drifts on 1–100 s timescale | Dicke switching; frequent warm/cold load calibration |
| Atmospheric noise | T_atm = 2–15 K at zenith (10–20 GHz), varies with humidity | Sky-dip to measure and subtract; observe at zenith during low-humidity conditions |
| Ground spillover | 273 K ground >> 2.725 K CMB | Low-sidelobe horn (Potter or corrugated); elevation > 20°; minimize dish edge scattering |
| RFI (interference) | Man-made signals contaminate sky noise | Ku-band (10–12 GHz) is relatively clean; avoid satellite-occupied frequencies; observe between sat transponders |
| LO instability | LNB local oscillator drift creates frequency uncertainty | Bullseye TCXO LNB (±10 kHz); external GPSDO reference for best stability |
| Atmospheric absorption | Water vapor absorbs at 22.2 GHz, oxygen at 60 GHz | Observe at 10–20 GHz; prefer dry, low-humidity conditions |
| Temperature-induced gain changes | LNB electronics gain drifts with temperature | Thermal equilibration (2+ hours); Lakeshore/PT100 temperature monitoring; shade the LNB |
| 8-bit ADC quantization | RTL-SDR ADC limits dynamic range | Set LNB gain to fill ~50–70% of ADC range; 8-bit provides ~48 dB dynamic range |

---

## 10. Recommended Build Paths

### Path A: Entropy/RNG Source (Simplest)

**Goal**: Generate entropy from sky thermal noise (including CMB component); do not need to isolate CMB precisely.

**Hardware**:
1. 60–90 cm Ku-band offset dish (surplus, ~$20–$60)
2. Generic Ku-band universal LNB ($10–$20) or Bullseye BE01 ($25–$30) for better stability
3. LNB power injector (11.5–19V, ~$10)
4. RTL-SDR Blog V4 ($40–$50)
5. Raspberry Pi 4 ($50–$80) or any Linux PC

**Software**: GNU Radio script to read IQ samples → Von Neumann whitening → entropy pool. Can be piped to `/dev/random` or used as DRBG seed.

**Total cost**: ~$130–$220

**Entropy quality**: Genuine thermal noise (quantum Johnson noise + CMB) at 2.4 MSPS, providing a continuous entropy stream. CMB fraction of ~3–5% of total power ensures cosmological component is always present.

### Path B: CMB Temperature Measurement + Entropy

**Goal**: Demonstrate CMB detection AND use as entropy source.

**Hardware**:
1. 90 cm C-band or 1.2 m Ku-band dish with motorized mount ($80–$200)
2. Norsat 8225R C-band LNB ($125) or Bullseye Ku-band LNB ($30)
3. Dicke switch (PIN diode switch + ferotor or PIN switch at 10–100 Hz) (~$50–$200)
4. RTL-SDR Blog V4 or Airspy R2 ($40–$170)
5. Cold calibration load: Eccosorb absorber + LN₂ cooler ($50–$200)
6. Raspberry Pi + temperature sensors ($60–$100)

**Software**: Python sky-dip analysis script (measure at multiple elevations, fit T_θ vs. sec θ, extrapolate to T_CMB); entropy generation from raw IQ samples.

**Total cost**: ~$500–$1000

**CMB measurement accuracy**: ±1–3 K with careful calibration; sky-dip technique demonstrated to work in university labs with similar equipment.

### Path C: Academic-Quality CMB Detection

**Goal**: Measure T_CMB to ±0.3 K and demonstrate CMB origin of entropy.

**Hardware**:
1. Potter horn or corrugated horn at 19 GHz (surplus or machined) ($200–$2000)
2. 19 GHz LNB (Irish satellite TV receiver or custom) (~$100–$500)
3. 19 GHz bandpass filter (500 MHz wide) ($50–$200)
4. HP power meter (HP 8481D + HP E4418B) [used/surplus] ($200–$800)
5. Cold (LN₂, 77 K) and warm (room temp) calibration loads with Eccosorb ($100–$400)
6. Lakeshore or similar precision temperature monitor ($200–$1000)
7. Data acquisition (LabJack U3-HV or similar, $100) + PC

**Software**: UC Davis CMB lab Python scripts (open-source); sky-dip analysis.

**Total cost**: ~$1000–$5000

**CMB measurement**: T_CMB measured to ±0.3–0.5 K, confirming signal at 2.725 K from sky; atmospheric subtraction validated; all noise components characterized.

---

## 11. Sources and References

- [UC Davis Physics CMB Lab Guide (19 GHz)](https://122.physics.ucdavis.edu/course/cosmology/sites/default/files/files/CMB/cmb_guide.pdf) — primary technical reference for total-power CMB radiometer design and sky-dip technique
- [Columbia University CMB Lab Manual](http://www.columbia.edu/~mm21/exp_files/CMB%20manual.pdf) — parallel university CMB measurement procedure
- [OH2AUE Amateur Dicke Radiometer Article](https://73.fi/oh2aue/dicke_uk.htm) — detailed homebrew Dicke radiometer design, amateur results including solar, lunar, extragalactic source detections
- [Lee & Cleaver, Heliyon (2017) — CMB as Random Bit Generator](https://pmc.ncbi.nlm.nih.gov/articles/PMC5639047/) — peer-reviewed analysis of CMB power spectrum as FIPS-140-2 compliant RNG
- [RTL-SDR.com Hydrogen Line Radio Astronomy Tutorial](https://www.rtl-sdr.com/cheap-and-easy-hydrogen-line-radio-astronomy-with-a-rtl-sdr-wifi-parabolic-grid-dish-lna-and-sdrsharp/) — practical SDR radio astronomy setup reference
- [Three Hills Observatory Ku-Band Experiments](http://www.threehillsobservatory.co.uk/astro/radio_astronomy/radio_astronomy_1.htm) — amateur Ku-band dish thermal noise measurement
- [RTL-SDR.com Bullseye LNB information](https://www.rtl-sdr.com/qo-100-bullseye-tcxo-ultra-stable-lnb-now-available-in-our-store-for-29-95-with-free-shipping/) — product details and community experience
- [Norsat 8225R C-band LNB specifications](https://www.iktechcorp.com/vsat-satellite-products/norsat-8225r-8225rf-8225rn-ku-band-pll-lnb-8000r-series-price-cost.html) — 25K noise temperature professional C-band LNB
- [Nooelec SAWbird+ H1 LNA product page](https://www.nooelec.com/store/sawbird-h1.html) — LNA specifications for 1.42 GHz radio astronomy
- [HackRF One specifications](https://greatscottgadgets.com/hackrf/one/) — 1 MHz–6 GHz SDR specifications
- [KrakenSDR Crowd Supply page](https://www.crowdsupply.com/krakenrf/krakensdr) — 5-channel coherent SDR for correlation radiometry
- [3D-printed corrugated horn antenna paper (PMC Scientific Reports, 2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10752902/) — low-cost 3D-printed Ka-band corrugated horn
- [Harvard/CFA 21 cm Horn Antenna Design](https://lweb.cfa.harvard.edu/~npatel/hornAntennaAASposterPDF2.pdf) — $300 student-built horn antenna
- [UC Davis Radiometers Teaching Document](https://122.physics.ucdavis.edu/course/cosmology/sites/default/files/files/CMB/Radiometers.pdf) — radiometer equation and sensitivity derivation
- [Microwaves101 Radiometric Receivers](https://www.microwaves101.com/encyclopedias/radiometric-receivers) — Dicke radiometer design reference
- [AB9IL.net RTL-SDR Sensitivity](https://www.ab9il.net/software-defined-radio/RTL-SDRV3SensitivityMeasurements.html) — RTL-SDR V3 noise figure and sensitivity discussion
- [Celestial Sources for RNG (Soo et al., 2016)](https://ro.ecu.edu.au/context/ism/article/1190/viewcontent/ID_4_AISM_2016_CELESTIAL_SOURCES_FOR_RANDOM_NUMBER_GENERATION.pdf) — radio telescope noise including CMB as cryptographic RNG seed
- [MRNG: Cosmic Radiation as Entropy Source (PubMed, 2023)](https://pubmed.ncbi.nlm.nih.gov/37372198/) — cosmic ray (muon) based RNG; related methodology
- [Satsig.net Antenna Noise Temperature](https://www.satsig.net/antnoise.htm) — satellite dish noise temperature reference
- [Marine Satellite Systems LNB noise temperature reference](http://www.marinesatellitesystems.com/index.php?page_id=888) — NF to noise temperature conversion reference

---

## Appendix: Quick Reference

### Noise Figure to Noise Temperature Conversion

```
T_noise (K) = 290 × (10^(NF_dB / 10) − 1)
```

| NF (dB) | T_noise (K) | Typical component |
|---------|-----------|--------------------|
| 0.1 | 6.7 | Cryogenic HEMT |
| 0.5 | 35 | Best Ku-band LNBs |
| 0.8 | 59 | Standard Ku-band LNB |
| 1.0 | 75 | Average consumer LNB |
| 2.5 | 226 | 12 GHz amateur LNB (OH2AUE) |
| 3.5 | 374 | RTL-SDR dongle |
| 5.0 | 627 | Poor consumer SDR |
| 10.0 | 2610 | HackRF One (receive) |

### Radiometer Equation Quick Calculator

```
ΔT_min = T_sys / √(B × τ)          [total power]
ΔT_min = 2 × T_sys / √(B × τ)     [Dicke switching]
```

Example: T_sys = 55 K, B = 200 MHz, τ = 1000 s → ΔT_min = 55 / √(200×10⁶ × 1000) = **3.9 mK**

### CMB Fraction of Total System Noise

| T_sys | CMB fraction | Notes |
|-------|-------------|-------|
| 55 K (Ku LNB, good setup) | 5.0% | Amateur CMB detection feasible |
| 30 K (C-band LNB, Norsat) | 9.1% | Better CMB/noise ratio |
| 80 K (consumer LNB + spillover) | 3.4% | Typical amateur setup |
| 1000 K (RTL-SDR alone, no LNB) | 0.27% | Too dominated by receiver noise |
| 20 K (cooled HEMT) | 13.6% | Research-grade; CMB clearly significant |
| 5 K (cryogenic LNA) | 54.5% | Approaching CMB-limited |
