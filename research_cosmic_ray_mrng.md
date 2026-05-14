# Cosmic Ray Mobile Random Number Generation (MRNG): Research Summary

**Compiled:** 2025 | **Purpose:** Cross-comparison with CMB-based RNG

---

## 1. Overview

Cosmic ray-based Mobile Random Number Generation (MRNG) exploits the fact that smartphone CMOS camera sensors — designed for photon detection — respond equally well to any ionizing radiation, including muons from cosmic ray air showers. When the camera lens is covered and the sensor is operated in darkness, particle strikes appear as brief, spatially localized bright-pixel events against an otherwise dark background. The timing, position, and intensity of these events are fundamentally stochastic and serve as an entropy source for a True Random Number Generator (TRNG).

The key insight driving all projects in this space: the aggregate silicon area of the world's smartphone cameras dwarfs that of any purpose-built particle physics detector array.

---

## 2. Key Academic Papers

### 2.1 MRNG: Accessing Cosmic Radiation as an Entropy Source (2023) — **Primary Reference**

| Field | Detail |
|---|---|
| **Authors** | Stefan Kutschera, Wolfgang Slany, Patrick Ratschiller, Sarina Gursch, Håvard Dagenborg |
| **Institution** | Graz University of Technology (Austria) / University of Tromsø (Norway) |
| **Published** | *Entropy*, Vol. 25, No. 6, Art. 854 — 26 May 2023 |
| **DOI** | [10.3390/e25060854](https://www.mdpi.com/1099-4300/25/6/854) |
| **Open Access** | [PMC10297075](https://pmc.ncbi.nlm.nih.gov/articles/PMC10297075/) |

**Summary:** First paper to successfully extract and statistically validate a random bit sequence from cosmic ray events captured on a common smartphone. Built on the CREDO Android app (extended with custom bit-extraction algorithm). Devices: Samsung Galaxy A32 (SM-A320FL, 640×480 px images), Samsung Galaxy A50 (SM-A505FN, 1920×1080), Xiaomi Mi A1, and others. Experiment ran at sea level (35 m, Arctic Circle, Tromsø, Norway) for 18.05 days across 8 devices.

**Predecessor Paper (2022):**
- Kutschera, Zugaj, Slany. "Appraisal of a Random Bit Generator Utilizing Smartphone Sensors as Entropy Source." IEEE ICECCME 2022. DOI: [10.1109/ICECCME55909.2022.9987848](https://ieeexplore.ieee.org/document/9987848/)
- Initial cosmic radiation detection attempt failed; pivoted to audio/video sensors. Recommended muon detection as future work.

---

### 2.2 Muon-Ra: Quantum Random Number Generation from Cosmic Rays (2020)

| Field | Detail |
|---|---|
| **Authors** | Homer Gamil, Pranav Mehta, Eduardo Chielle, Antonio Di Giovanni, Muhammad Nabeel, Francesco Arneodo, Michail Maniatakos |
| **Institution** | NYU Abu Dhabi Center for Cyber Security |
| **Published** | IEEE IOLTS 2020 — July 2020 |
| **DOI** | [10.1109/iolts50870.2020.9159728](https://ieeexplore.ieee.org/document/9159728/) |

**Summary:** First hardware TRNG based on dedicated muon detection using Silicon Photomultipliers (SiPMs) + plastic scintillators. Measures inter-muon timing intervals and converts them to bits. Passed both NIST SP 800-22 and Dieharder test suites. Uses passive entropy source (no power needed for the detector); designed for integration into computer hardware.

---

### 2.3 DECO: Distributed Electronic Cosmic-ray Observatory (2014–present)

| Field | Detail |
|---|---|
| **PI** | Justin Vandenbroucke, University of Wisconsin–Madison (WIPAC) |
| **arXiv** | [1708.01281](https://arxiv.org/abs/1708.01281) [astro-ph.IM] — ICRC 2017 |
| **Website** | [wipac.wisc.edu/deco](https://wipac.wisc.edu/deco) |
| **App** | Android (public); iOS (beta) |

**Summary:** First widely deployed smartphone cosmic-ray detector app. Detections reported from all 7 continents. Primary focus is physics outreach/education, not RNG. Provides the most detailed characterization of detection rates and event morphology (tracks, spots, worms) across phone models.

---

### 2.4 CRAYFIS: Cosmic Rays Found in Smartphones (2014–present)

| Field | Detail |
|---|---|
| **Authors** | Daniel Whiteson (UC Irvine), Michael Mulhearn (UC Davis), et al. |
| **arXiv** | [1410.2895](https://arxiv.org/abs/1410.2895) [astro-ph.IM] — Oct 2014 |
| **Muon Trigger Paper** | [1709.08605](https://arxiv.org/abs/1709.08605) [cs.CV] — Sep 2017 |
| **Recent Grant** | Julian Schwinger Foundation (2025) — [UCI News](https://ps.uci.edu/news/3365/) |
| **App** | Android + iOS (invite/beta) |

**Summary:** Targets Ultra-High Energy Cosmic Rays (UHECR, >10¹⁸ eV) by networking millions of phones. Focuses on large-area air shower detection rather than per-device RNG. Runs only when phone is charging and idle. Network of 1 million phones at 1000/km² density is target.

---

### 2.5 CREDO: Cosmic-Ray Extremely Distributed Observatory (2019–present)

| Field | Detail |
|---|---|
| **Coordination** | IFJ PAN / Cracow University of Technology (Poland) |
| **arXiv** | [1908.04139](https://real.mtak.hu/160751/1/1908.04139.pdf) — 2019 |
| **Website** | [credo.science](https://credo.science) |
| **App** | Android (Google Play); CREDO Detector |
| **Scale (2019)** | >7,500 users, >2.9M images stored, ~958 device-years of observation time |
| **Scale (2025)** | ~11,900 users, 42 institutions, >10M smartphone detections |

**Summary:** Combines citizen-science smartphones with professional arrays. Primary aim is detecting coordinated cosmic-ray ensembles. The app serves as the detection backend that the MRNG paper (Kutschera 2023) was built upon.

---

### 2.6 SORAMAME (2024–present)

| Field | Detail |
|---|---|
| **Institution** | Kanagawa University, Japan |
| **Conference** | ICRC 2025, [PoS(ICRC2025)1255](https://pos.sissa.it/501/1255/pdf) |
| **App (iOS)** | [App Store](https://apps.apple.com/us/app/cosmic-ray-detector-soramame/id6444093470) |
| **Website** | [soramame.n.kanagawa-u.ac.jp](https://soramame.n.kanagawa-u.ac.jp/en/) |

**Summary:** Real-time smartphone detector with live event visualization (ring display). Tested on commercial flights and across geomagnetic latitudes.

---

### 2.7 Camera Dark Noise QRNG (2014)

| Field | Detail |
|---|---|
| **Authors** | Bruno Sanguinetti, Anthony Martin, Hugo Zbinden, Nicolas Gisin |
| **Institution** | University of Geneva |
| **Published** | *Physical Review X*, Vol. 4, Art. 031056 — Sept 2014 |
| **DOI** | [10.1103/PhysRevX.4.031056](https://link.aps.org/doi/10.1103/PhysRevX.4.031056) |

**Summary:** Uses quantum shot noise from low-light CMOS pixels (illuminated by dim LED) to generate random bits. Nokia N9 mobile phone achieved extraction of ~3 bits per pixel. This approach differs from cosmic-ray MRNG (uses light, not particles); relevant as a closely related CMOS-based TRNG.

---

## 3. How MRNG Works: Technical Mechanism

### 3.1 Physical Detection Principle

Cosmic ray primary particles (mainly protons from supernovae, active galactic nuclei) strike Earth's upper atmosphere at energies up to 10²⁰ eV, producing cascading particle showers. By sea level, the dominant secondary particles are **muons** (~98% of all cosmic ray particles at ground level). These are minimum-ionizing particles with:
- Sea-level flux: ~1 muon/cm²/minute (~167 muons/cm²/hour)
- Mean energy: ~4 GeV at sea level
- Penetration: through walls, roofs, and phone casings

When a muon passes through a smartphone CMOS sensor's silicon depletion layer (~26.6 µm measured by DECO for typical sensors), it ionizes silicon atoms along its path, generating electron-hole pairs. These charges are collected and read out as bright pixels — typically 1–20 pixels forming tracks (straight lines, near-perpendicular incidence), spots (blobs, near-normal incidence), or worms (curved paths from low-energy electrons from radioactive decay in nearby materials).

### 3.2 Sensor Setup

1. **Cover the lens** with multiple layers of black electrical tape (or lens cap) to block all visible light
2. **Calibrate** the sensor's noise floor (run app for ≥3 hours on first launch to set adaptive threshold)
3. **Capture frames** at maximum exposure time allowed by the OS (typically ~50 ms per frame in DECO; 1–2 seconds in some configurations)
4. **Two-level trigger** system: low-resolution scan for any pixels above threshold T_low; if found, high-resolution check for pixels above T_high in the same region
5. **Filter hot pixels**: pixels that repeatedly fire at the same coordinates are flagged as defective hardware pixels (hot pixels) and excluded — this is the critical discrimination step

### 3.3 MRNG Bit Extraction (Kutschera 2023)

Four extraction methods (P1–P4), used in combination:

| Method | Description | Bits per event |
|---|---|---|
| **P1 Time** | Last 5 binary digits of Unix timestamp (ms) modulo — captures arrival time randomness | 5 bits |
| **P2 Position** | (X mod 2) + (Y mod 2) — parity of pixel coordinates | 2 bits |
| **P3 Color** | (R mod 2 + G mod 2 + B mod 2) mod 2 for pixels above threshold | 1 bit |
| **P4 Outlier** | Same as P3, but only for pixels whose local distance from previous pixel > average × multiplier | 1 bit |

**Passing combinations** (NIST-validated): **MRNG-P124** (cleaned events, P1+P2+P4) and **MRNG-RP124** (all raw detections, P1+P2+P4).  
**Failing combinations**: P1234, P123 (all methods together introduce bias from hot-pixel noise contamination).

The P3 method (color parity) fails when used with P1/P2 because color correlations across adjacent pixels in the Bayer mosaic introduce non-randomness.

### 3.4 Hot Pixel vs. Cosmic Ray Discrimination

| Signal Type | Characteristics |
|---|---|
| **Hot pixel** | Repeats at *exact same coordinates* across multiple frames; treated as hardware defect |
| **Cosmic ray muon** | Random position per event; straight track, 1–20 pixels in length |
| **Low-energy electron (worm)** | Curved path; from radioactive decay in phone materials — still useful entropy |
| **Spot** | 1–5 pixel dot; near-normal incidence muon or Compton-scattered electron |

The MRNG paper found: of 5,567 initial uncleaned detections, 3,551 (64%) were hot pixels sharing the same position. After filtering, 414 genuine cosmic-ray events remained.

---

## 4. Apps and Implementations

| App | Platform | Type | Open/Closed | URL | Status |
|---|---|---|---|---|---|
| **DECO** | Android, iOS (beta) | Citizen science + detection | Open data | [wipac.wisc.edu/deco](https://wipac.wisc.edu/deco) | Active |
| **CREDO Detector** | Android | Citizen science network | Open source (MIT) | [credo.science](https://credo.science) | Active |
| **SORAMAME** | iOS + web | Real-time visualization | — | [App Store](https://apps.apple.com/us/app/cosmic-ray-detector-soramame/id6444093470) | Active |
| **CRAYFIS** | Android + iOS | UHECR network | Closed (research) | [crayfis.io](http://crayfis.io) | Beta/invite |
| **Radioactivity Counter** | iOS + Android | Radiation dosimetry | Commercial | App Store / Play | Active ($4.99) |
| **MRNG prototype** | Android | RNG (research) | Not released | Built on CREDO | Research only |

The Kutschera 2023 MRNG prototype is not publicly distributed as a standalone app; it is an extension of the CREDO Detector app.

---

## 5. Entropy Rates and Detection Statistics

### 5.1 Core Rate Calculations (from DECO / Vandenbroucke)

The theoretical maximum per single phone at sea level:
- Muon flux: ~1 muon/cm²/minute
- Typical sensor area: ~16 mm² = 0.16 cm²
- Expected muons through sensor: 0.16 muons/min × 60 min × 24 = **~230 muons/day**
- Camera live-time fraction: ~5% (50 ms exposure per 1 s cycle)
- Effective detections during live-time: 230 × 0.05 = **~12 muons/day per phone** (theoretical upper bound before efficiency factors)

### 5.2 Measured Detection Rates

| Source | Sensor / Device | Method | Detection Rate | Notes |
|---|---|---|---|---|
| Kutschera 2023 (MRNG) | 8 Samsung/Xiaomi phones combined | CREDO app | **~1 event / 62.8 min** per device (cleaned) | 414 events / 8 devices / 18 days; Tromsø, Norway, 35 m ASL |
| Kutschera 2023 (raw) | 8 devices | CREDO app | ~1 event / 4.7 min per device (uncleaned) | Includes hot pixels |
| DECO (Vandenbroucke) | Various phones | DECO app | **"Several events per 24 hours"** per phone | Sea level, standard conditions |
| DECO (Vandenbroucke) | Various phones | DECO app | ~12 muons/day theoretical maximum | With 5% livetime |
| CREDO database | Mixed smartphones | CREDO app | **~1 event/hour** expected per device | Standard trigger threshold |
| Hachaj 2023 (RPi cam 1.3) | Raspberry Pi cam v1.3, 10.3 mm² | Custom algorithm | **0.182 muons/h** | 456 hours; sea level |
| Hachaj 2023 (RPi cam 2.0) | Raspberry Pi cam v2.0, 10.2 mm² | Custom algorithm | **0.740 muons/h** | 288 hours; sea level |
| SORAMAME (iPhone 13 Pro) | iPhone 13 Pro | SORAMAME app | **1.94 events/10 min** at ground | Haneda Airport, ground level |
| SORAMAME (iPhone 13 Pro) | iPhone 13 Pro | SORAMAME app | **5.93 events/10 min** at 10 km | In-flight at cruising altitude; ×3.24 increase |

### 5.3 Bits per Event and Throughput

From the MRNG paper (Kutschera 2023):

| Variant | Total Bits Generated | 414 Events, 18 days | Approx. bit rate |
|---|---|---|---|
| MRNG-P124 (passing) | 12.052 bits | From 414 cleaned events | ~0.00047 bits/min = **0.028 bits/hour** |
| MRNG-RP124 (passing) | 126.363 bits | From 5,567 raw events | ~0.0048 bits/min = **0.29 bits/hour** |

> **Key limitation:** The MRNG throughput is extremely low — approximately **0.028 bits/hour** from a single phone using cleaned events. Even using all 8 devices, this yields only ~0.22 bits/hour total from cleaned cosmic rays. The raw detection stream (which includes hot pixels filtered statistically) yields ~2.3 bits/hour across 8 devices, but is only valid if the P4 (outlier) extraction method is used without P3.

**Approximate bits-per-event**: 
- P124 (cleaned): 12.052 bits ÷ 414 events ≈ **0.029 bits/event**  
- RP124 (raw): 126.363 bits ÷ 5,567 events ≈ **0.023 bits/event**

These are the bits that survive statistical cleaning; significantly more raw bits are generated per event (P1 alone would give ~7 bits), but correlation reduces the effective entropy.

### 5.4 Altitude and Latitude Dependence

| Condition | Effect on Detection Rate | Source |
|---|---|---|
| Sea level (baseline) | 1 muon/cm²/min reference flux | Standard physics |
| +1,500 m altitude | ~2× increase | MRNG paper note |
| 8,000 ft (~2,400 m, mountain towns) | ~2× sea level | DECO data |
| 30,000 ft (cruising altitude) | ~3–10× sea level | DECO / SORAMAME |
| Airplane flight (10,000 m) | **3.24× ground** (iPhone 13 Pro) | SORAMAME 2025 |
| Higher geomagnetic latitude | Up to **5× equatorial rate** | SORAMAME flight data |
| Inside buildings vs. outside | No significant difference | Muons penetrate all structures |
| Near radioactive source (Am-241) | Detectable increase above cosmic background | SORAMAME Experiment 2 |

The latitude effect is due to **geomagnetic cutoff rigidity**: near the poles, Earth's magnetic field offers less shielding, allowing lower-energy cosmic ray primaries to reach the atmosphere and produce more secondary particles.

### 5.5 Phone Model Variation (Sensor Size)

| Phone / Sensor Format | Sensor Area | Expected Muons/day |
|---|---|---|
| Galaxy Nexus, Nexus 4 (1/4.0") | 7.68 mm² | ~9 muons/day |
| Nokia Lumia 720 (1/3.6") | 12.00 mm² | ~14 muons/day |
| iPhone 5, Nexus 5 (1/3.2") | 15.50 mm² | ~18 muons/day |
| iPhone 5S, iPhone 6 (1/3.0") | 17.30 mm² | ~20 muons/day |

These figures assume theoretical 5% livetime and ~100% efficiency; actual detected rates are lower. Depletion layer thickness (measured at 26.6 ± 1.4 µm for one phone in DECO) also affects detection efficiency.

**Critical software note:** Newer Android versions (≥5.0) and modern phones increasingly apply hardware noise-filtering and image post-processing at the driver level that can remove high-frequency pixel events — including genuine muon hits. Some phones become essentially unusable as detectors due to on-chip noise suppression. This is described in Hachaj 2023 as "the greatest difficulty to be overcome."

---

## 6. Statistical Validation Results

### 6.1 MRNG (Kutschera 2023) — NIST SP 800-22 Results

Because the bit sequence is extremely short (only 414 cleaned events → 12 bits per passing variant with 94 streams of 128 bits), only 6 of the 15 NIST SP 800-22 tests could be applied. Full 15-test battery requires n ≥ 1,000,000 bits minimum.

**Tests applied:** Frequency, Block Frequency, Cumulative Sums (forward + reverse), Runs, Longest Run, Approximate Entropy.

| MRNG Variant | Tests Passed / Applied | Overall Result |
|---|---|---|
| MRNG-P1234 | 0 / 6 | **FAIL** |
| MRNG-P123 | 0 / 6 | **FAIL** |
| **MRNG-P124** | **6 / 6** | **PASS** |
| MRNG-RP1234 | 0 / 6 | **FAIL** |
| MRNG-RP123 | 0 / 6 | **FAIL** |
| **MRNG-RP124** | **6 / 6** | **PASS** |

The failure of P3 (color parity) when combined with position and time is attributed to Bayer mosaic color correlations and residual hot-pixel contamination in the color channels.

No Dieharder or TestU01 testing was attempted (insufficient bit count).

### 6.2 Muon-Ra (Gamil et al. 2020) — Dedicated Hardware RNG

Uses SiPM + plastic scintillator (not smartphone camera). Tests run:
- ✅ **NIST SP 800-22**: Passed
- ✅ **Dieharder**: Passed

No TestU01 data reported in available abstract. Throughput not disclosed in publicly accessible abstract; hardware operates at muon detection rates (~1 muon/cm²/min for ~25 cm² detector face = ~25 muons/min = potentially ~several hundred bits/min depending on bits-per-interval encoding).

### 6.3 Kutschera Precursor (2022) — Failed Cosmic Ray Approach

The 2022 precursor paper attempted cosmic radiation detection on smartphones but stated: "our initial intention of using cosmic radiation failed" — successfully extracted randomness from audio/video sensors instead. 15/15 NIST SP 800-22 tests passed for audio/video entropy.

### 6.4 Camera Dark Noise QRNG (Sanguinetti 2014) — Related Approach

Using quantum shot noise (not cosmic rays):
- Nokia N9 mobile phone + dim LED illumination
- ~3 bits extracted per pixel per frame
- Not tested against NIST SP 800-22 in standard way, but described as quantum-certified

### 6.5 Radioactive Decay TRNG (Ruschen 2017) — Comparison Baseline

Geiger tube + Thorium source (37 days of data, 35×10⁶ events):

| Test | Result | Optimum |
|---|---|---|
| Entropy | 1 bit/bit | 1 |
| Serial Correlation Coefficient | 1.6×10⁻⁵ | 0 |
| Runs test p-value | 92.51% | 100% |
| χ² test p-value | 16.65% | 100% |
| Spectral test p-value | 66.73% | 100% |
| 0s/1s distribution | 50.00/49.99% | 50/50% |

---

## 7. Cost and Practical Limitations

### 7.1 Hardware Cost

| Approach | Hardware Cost | Power |
|---|---|---|
| Smartphone MRNG (cosmic ray) | **~$0** (uses existing phone) | Phone charging power (~5–10 W) |
| Dedicated SiPM+scintillator (Muon-Ra) | ~$100–500 (SiPM + scintillator + MCU) | Low (passive detector + microcontroller) |
| Geiger counter TRNG | ~$50–200 (Geiger tube + RPi) | ~5 W |
| HotBits (Cs-137 Geiger) | N/A (server-side, retired Jan 2023) | Server power |
| Camera dark noise QRNG | **~$0** (uses phone camera with LED) | Minimal |
| Hardware QRNG chips (ID Quantique etc.) | $1,000–$10,000 | Low |

### 7.2 Battery and Processing Overhead

- **CRAYFIS**: Designed to run only while phone is plugged in and idle; user specifically cannot interact during collection.
- **DECO**: No explicit battery figures in papers; runs continuously. Community reports recommend using a dedicated old phone.
- **CREDO**: "Run the app overnight" instruction implies significant power drain.
- **MRNG experiment**: Devices were permanently powered (wall outlet). Battery drain during active use is significant — essentially continuous camera streaming.
- **CPU overhead**: Frame analysis takes up to 1 second per frame in DECO; modern phones may use ISP hardware to pre-filter, which can destroy cosmic ray signals.

### 7.3 Detection Rate Summary (Practical Limitations)

| Limitation | Detail |
|---|---|
| **Extremely low throughput** | ~0.03 bits/hour per phone at sea level (cleaned events). Cryptographic key generation (e.g., 256-bit key) requires approximately **850 phone-hours of continuous collection**. |
| **Only useful as entropy seed** | Not viable as primary continuous entropy stream; suitable only for seeding a CSPRNG or as an occasional entropy injection |
| **Hot pixel contamination** | ~64% of raw detections are hot pixels, not cosmic rays. Robust filtering required. |
| **Sensor model dependency** | Many modern phones apply irreversible in-camera processing that destroys particle tracks. Must test specific models. Older phones (≤Android 4.4) may have better access to raw sensor data. |
| **Android fragmentation** | Exposure time varies wildly by Android version; versions <5.0 often limited to very short exposures |
| **Calibration required** | Cold start requires ≥3 hours of calibration before the adaptive threshold is reliable |
| **Platform limitations** | iOS imposes strict camera API restrictions making RAW frame access difficult; most implementations are Android-only |
| **Geomagnetic/geographic variation** | Detection rate at equatorial sea level significantly lower than polar regions or high altitudes |

---

## 8. Comparison Tables

### 8.1 Entropy Sources: Cosmic Ray MRNG vs. Other Physical RNGs

| Approach | Entropy Source | Entropy Rate | NIST 800-22 | Dieharder | TestU01 | Cost (hardware) | Portability | Notes |
|---|---|---|---|---|---|---|---|---|
| **Cosmic ray MRNG (smartphone)** | Muon ionization in CMOS sensor | ~0.03 bits/hr/phone (cleaned); ~0.3 bits/hr (raw) | 6/6 tests passed (limited sample) | Not tested | Not tested | $0 (existing phone) | Excellent | Graz Univ. 2023 |
| **Muon-Ra (SiPM+scintillator)** | Muon inter-arrival timing | ~100s of bits/min (25 cm² detector) | ✅ Pass (full suite) | ✅ Pass | Not reported | ~$200–$500 | Poor (bulky) | NYU Abu Dhabi 2020 |
| **Radioactive decay TRNG (Geiger)** | Beta/gamma decay timing | ~11 bits/s (1 decay/90 ms) | Partial tests pass | Not tested | Not tested | ~$50–200 | Limited (source needed) | CVUT 2017, Thorium source |
| **HotBits (Cs-137 + Geiger)** | Radioactive decay timing | ~100 bytes/s = **800 bits/s** | Not publicly reported | Not tested | Not tested | N/A (retired 2023) | N/A | Fourmilab; server-based; retired |
| **Camera dark noise QRNG (Nokia N9)** | Quantum shot noise from LED | ~Mbits/s (millions of pixels) | Described as passing | Not tested | Not tested | $0 (phone + dim LED) | Excellent | Geneva 2014; needs light source |
| **Camera dark noise TRNG (Park 2015)** | CMOS dark noise | **~2.4 Mbit/s** | ✅ Pass (full suite) | Via SP 800-90B | — | $0 (existing phone) | Excellent | Uses phone camera, no light |
| **CMB-based RNG** | Cosmic microwave background photons | Very slow (telescope obs. cycles) | Argued compatible with FIPS 140-2 | — | — | $10,000+ (radio telescope) | None | Theoretical; Heliyon 2017 |
| **Intel RDSEED (CPU)** | Thermal noise + entropy accumulator | Gbits/s | ✅ | ✅ | ✅ | $0 (in modern CPUs) | Excellent | Hardware TRNG; widely deployed |
| **Hardware QRNG (ID Quantique)** | Vacuum fluctuations / photon splitting | Gbits/s | ✅ | ✅ | ✅ | $1,000–$10,000 | Poor | Gold standard |

### 8.2 Smartphone Cosmic Ray Detector Apps Comparison

| App | Institution | Platform | RNG-focused | Detection Rate (ground) | Altitude data | Open Source |
|---|---|---|---|---|---|---|
| **DECO** | Univ. Wisconsin | Android / iOS β | No | ~12 muons/phone/day (theoretical) | Yes | Data open |
| **CREDO Detector** | IFJ PAN Kraków | Android | No | ~1 event/hr/device | No | Yes (MIT) |
| **SORAMAME** | Kanagawa Univ. | iOS + web | No | ~1.94 events/10 min (iPhone 13 Pro, ground) | Yes (3.24× at 10 km) | No |
| **CRAYFIS** | UC Irvine / UC Davis | Android / iOS (β) | No | — (UHECR focus) | No | No |
| **MRNG prototype** | Graz Univ. Tech. | Android | **Yes** | ~1 event/62.8 min/device (cleaned) | No | No |
| **Radioactivity Counter** | Commercial | iOS + Android | No | — | No | No |

### 8.3 Statistical Test Coverage

| Paper / System | Bit Volume Tested | Tests 1-15 NIST 800-22 | Dieharder | TestU01 |
|---|---|---|---|---|
| MRNG-P124 (Kutschera 2023) | ~12 bits (94×128) | 6/15 applicable; all 6 passed | Not tested | Not tested |
| Muon-Ra (Gamil 2020) | Not disclosed | Full suite passed | Full suite passed | Not reported |
| Radioactive decay TRNG (Ruschen 2017) | 35×10⁶ events | Subset (runs, chi², spectral) | Not tested | Not tested |
| Camera dark noise (Park) | Large (millions) | Full 15/15 passed | Via SP 800-90B | — |
| Camera dark noise (Kutschera 2022 precursor) | 15 tests | 15/15 passed | Not tested | Not tested |

### 8.4 Key Metrics Summary

| Metric | Cosmic Ray MRNG | Dark Noise CMOS QRNG | Geiger TRNG | Intel RDSEED |
|---|---|---|---|---|
| **Entropy rate** | ~0.03–0.3 bits/hr | ~2.4 Mbit/s | ~11 bits/s | Gbit/s |
| **Latency to first bit** | Minutes to hours | Milliseconds | Seconds | Nanoseconds |
| **Throughput** | Impractical for cryptography alone | High | Moderate | Very high |
| **True randomness** | Yes (particle physics) | Yes (quantum shot noise) | Yes (quantum decay) | Partial (thermal entropy) |
| **Cost** | Free (existing phone) | Free (phone + LED) | $50–200 | Free (in CPU) |
| **Portability** | Excellent | Excellent | Limited | Excellent |
| **Unpredictability guarantee** | Strong (spatiotemporal) | Strong (quantum) | Strong (quantum) | High |
| **NIST 800-22 full pass** | Partial (6/15, limited sample) | Yes (with sufficient data) | Partial | Yes |

---

## 9. Published Concerns and Limitations

### 9.1 Low Event Rates and Long Collection Times

The most fundamental limitation of smartphone cosmic ray MRNG is throughput. At sea level:
- 1 phone × 24 hours → ~12 theoretical muon hits during camera exposure
- After hot-pixel filtering: likely 2–5 clean events per phone per day
- At ~0.03 bits per event (P124 method): ~0.1–0.15 bits/day per phone

For a 256-bit symmetric key, a single phone would require **~4–7 years of continuous operation** at sea level. Even with 8 phones simultaneously (as in the Kutschera experiment), this falls to ~200–350 days. This renders cosmic-ray-only MRNG impractical as the sole entropy source for cryptographic key generation.

**Implication for practical use:** Cosmic ray events are best understood as *occasional high-quality entropy injections* into a larger entropy pool, not as a primary bit stream.

### 9.2 Sensor Noise vs. Cosmic Ray Discrimination

Three types of false positives must be filtered:

| Noise Type | Source | Mitigation |
|---|---|---|
| Hot pixels | Permanently defective CMOS pixels | Position tracking — reject any pixel firing >N times |
| Thermal dark current spikes | Temperature-dependent electron generation | Adaptive threshold calibration over baseline |
| Light leaks | Imperfect tape/cap sealing | Reject frames with too many bright pixels (saturation check) |

The CREDO algorithm uses: max pixel > 80 (calibration minimum) or > 3× average noise level; MRNG uses: threshold epsilon for per-channel rejection + 2-pixel max per image (not 3, for conservatism).

### 9.3 Android Camera API Issues

Modern Android and iOS impose significant constraints:
- Many phones apply **ISP (Image Signal Processor) noise reduction** at the hardware level before data reaches the API, effectively erasing particle tracks
- Exposure time control varies by API level and phone model; Android <5 often locks to very short exposures
- No standard RAW format guarantee — JPEG/YUV compression can destroy single-pixel events
- Some manufacturers lock camera gain, preventing low-light sensitivity optimization

### 9.4 Statistical Testing Limitations

The MRNG paper acknowledges that with only 414 cleaned events yielding 12 bits (in 94 streams of 128 bits), they could not run the full 15-test NIST SP 800-22 battery (requires n ≥ 1,000,000 bits). This is a fundamental constraint: gathering enough cosmic ray events for rigorous statistical validation of the RNG is itself a multi-year exercise.

### 9.5 Correlation Between Events

The P3 method (color parity) fails because adjacent pixels in a Bayer mosaic have correlated color responses, and the demosaicing pipeline introduces systematic color correlations even in low-light frames. The successful P124 method avoids color channels entirely, relying only on timing (P1), position parity (P2), and outlier intensity (P4).

---

## 10. Other Particle/Radiation RNG Approaches

### 10.1 HotBits (Fourmilab, 1996–2022)

- **Source:** Caesium-137 → Barium-137 beta decay detected by Geiger-Müller tube
- **Rate:** ~100 bytes/second = 800 bits/s
- **Validation:** 7.999975 bits/byte entropy measured by `ent` tool; serial correlation ≈ 0
- **Method:** Von Neumann debiasing — compare pairs of inter-decay intervals (T1 vs. T2); output 0 if T1 > T2, 1 if T2 > T1, discard if equal
- **Retirement:** Radioactive hardware retired 2023-01-01; replaced by Intel RDSEED
- **Website:** [fourmilab.ch/hotbits](https://www.fourmilab.ch/hotbits/)

### 10.2 Radioactive Decay TRNG (Geiger + Raspberry Pi)

- **Source:** Thorium-232 decay (ThO₂ gas mantle)
- **Rate:** 1 bit per decay event; average 90 ms/event = **~11 bits/second**
- **Tests:** Entropy = 1 bit/bit; SCC = 1.6×10⁻⁵; runs test 92.51%; chi² 16.65%; spectral 66.73%
- **Hardware:** Voltcraft Z1A Geiger tube (windowless), Raspberry Pi 1B
- **Cost:** Low; roughly $50–100 for tube + RPi
- **Concern:** Geiger tubes have finite lifespans (~10⁸ counts); with background radiation only (~20 CPM), tube may last 10 years; with active source at 2,500 CPM, tube wears out in 1 day

### 10.3 Muon-Ra (SiPM + Scintillator TRNG)

- **Source:** Cosmic ray muon inter-arrival timing
- **Hardware:** Silicon Photomultiplier (SiPM) + plastic scintillator + MCU
- **Rate:** Not disclosed; SiPM detectors with ~25 cm² area at sea level see ~25 muons/minute theoretically. Encoding time intervals likely yields 10–100+ bits/min
- **Tests:** Full NIST SP 800-22 ✅; Full Dieharder ✅
- **Power:** Low (passive SiPM; detector is passive, readout electronics consume ~mW)
- **Designed for** embedded system integration (hardware module)
- **Cost:** Prototype-level; SiPMs ~$20–100 each, scintillator ~$50–200, MCU ~$10

### 10.4 COSMOCAT (Muon Cryptography, Tanaka 2023)

- **Concept:** Two remote detectors share common muon detection events as a shared random key
- **Rate:** ~20 Hz agreed detections; >10 Mbps data transmission rate in principle
- **Limitation:** Only ~20% coincidence success rate with GPS-based synchronization
- **Hardware:** 1 m² plastic scintillator + PMT (not portable)

### 10.5 CMB-Based RNG

- **Source:** Cosmic Microwave Background radiation power spectrum
- **Rate:** Observation-limited (minutes to hours per measurement on a telescope)
- **Status:** Theoretical framework only; argued compatible with FIPS 140-2 (Heliyon 2017, [PMC5639047](https://pmc.ncbi.nlm.nih.gov/articles/PMC5639047/))
- **Hardware cost:** $10,000–$millions (radio telescope needed)
- **Key concern:** CMB is a static, well-characterized spectrum — the same "randomness" is available to any observer simultaneously. True unpredictability comes from detector noise and measurement process, not the CMB signal itself. One Reddit physicist's summary: "CMB is incredibly uniform. You would get the same pseudorandom numbers over and over again."
- **Comparison with MRNG:** CMB-RNG is theoretically motivated but practically inaccessible; MRNG is practically accessible (free, existing hardware) but extremely low-throughput.

### 10.6 Camera Dark Noise QRNG (Park / Sanguinetti approaches)

- **Source:** Quantum shot noise from thermal dark current in CMOS sensor pixels
- **No cosmic ray or radioactive source needed** — entirely inherent to silicon electronics
- **Rate (Park):** **~2.4 Mbit/s** — uses Hankel matrix + universal hash function on dark frames
- **Tests (Park):** Full NIST SP 800-22 ✅; NIST SP 800-90B entropy assessment ✅
- **Rate (Sanguinetti/Nokia N9):** ~3 bits per pixel extracted; millions of pixels → potentially Mbits/s
- **Key difference from cosmic-ray MRNG:** Relies on persistent dark current noise (always present), not rare particle events. Much higher throughput. Not astronomically-derived.

---

## 11. Consolidated Comparison: MRNG vs. CMB-RNG vs. Alternatives

### 11.1 High-Level Comparison

| Dimension | Cosmic Ray MRNG | CMB-based RNG | Dark Noise CMOS QRNG | Geiger TRNG | Intel RDSEED |
|---|---|---|---|---|---|
| **Physical source** | Cosmic ray muons (secondary particles from hadronic cascades) | Primordial microwave photons from Big Bang | Thermal electron noise in silicon | Radioactive nuclear decay | Thermal noise (silicon) |
| **Randomness origin** | Quantum (particle physics) — stochastic arrival times and positions | Cosmological fluctuations + quantum detector noise | Quantum shot noise | Quantum decay — unpredictable | Thermal noise (not purely quantum) |
| **Entropy rate** | ~0.03 bits/hr (phone, sea level) | Impractical (telescope obs.) | ~2.4 Mbit/s | ~11 bits/s | Gbit/s |
| **Latency** | Hours to days | Hours to days | Milliseconds | Seconds–minutes | Nanoseconds |
| **Hardware cost** | $0 | $10,000+ | $0 (+ LED) | $50–200 | $0 |
| **Portability** | Excellent | None | Excellent | Limited | Excellent |
| **Validation depth** | Partial (6/15 NIST tests, small sample) | Theoretical only | Full NIST + SP 800-90B | Partial statistical | Full |
| **Practical for crypto** | No (as sole source) | No | Yes | Marginal | Yes |
| **Cost per bit** | Free but time-intensive | Very expensive | Essentially free | Low | Free |
| **Cryptographic robustness** | High quality per-bit when passing tests | Unknown | High | High | High |

### 11.2 Where Cosmic Ray MRNG Excels

1. **No additional hardware**: Any existing Android smartphone with camera access works as a detector
2. **Provenance**: Each bit is traceable to a physical quantum event (particle interaction)  
3. **Impossible to manipulate remotely**: An adversary cannot predict or influence cosmic ray arrival
4. **Good for seeding**: Even 1–2 clean cosmic ray events per day provide excellent, high-entropy seed material
5. **Educational and transparent**: Physical mechanism is well-understood and auditable

### 11.3 Where Cosmic Ray MRNG Falls Short

1. **Throughput** is many orders of magnitude below any practical cryptographic need
2. **No full-suite statistical validation** due to insufficient event count
3. **Android camera API fragmentation** means not all phones work
4. **Altitude/latitude dependency** means entropy rate varies unpredictably by location
5. **Not suitable as a standalone CSPRNG** — must be combined with other entropy sources

---

## 12. Summary and Recommendations

**For academic/research use:** The Kutschera 2023 MRNG paper establishes proof-of-concept that smartphone-based cosmic ray detection *can* produce statistically valid random bits. NIST SP 800-22 tests (6 applicable tests) pass. The limitation is sample size, not quality.

**For cryptographic applications:** Cosmic ray MRNG at ~0.03 bits/hour is not viable as a primary entropy source. It is best deployed as a **high-quality entropy injection mechanism** — adding cosmic ray events to a system entropy pool (/dev/random equivalent) whenever they occur. Combined with camera dark noise (Park approach, ~2.4 Mbit/s) or CPU hardware RNG, the cosmic ray events provide provably physical entropy.

**Comparison with CMB RNG:** Both cosmic ray MRNG and CMB-RNG draw entropy from astrophysical phenomena, but cosmic ray MRNG is vastly more practical — requiring no specialized hardware. CMB-RNG remains theoretical and faces the concern that the CMB spectrum is static and observable by all parties simultaneously, limiting its uniqueness as a private entropy source.

**Best practical implementation path:** Use CREDO or DECO app on a dedicated old Android phone (≤Android 7.0 for better RAW camera access) left charging overnight, feeding detected event timestamps and positions into a CSPRNG seed pool alongside standard entropy sources.

---

## 13. References

1. Kutschera S, Slany W, Ratschiller P, Gursch S, Dagenborg H. "MRNG: Accessing Cosmic Radiation as an Entropy Source for a Non-Deterministic Random Number Generator." *Entropy* 2023, 25(6), 854. https://doi.org/10.3390/e25060854 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10297075/

2. Kutschera S, Zugaj W, Slany W. "Appraisal of a Random Bit Generator Utilizing Smartphone Sensors as Entropy Source." IEEE ICECCME 2022. https://doi.org/10.1109/ICECCME55909.2022.9987848

3. Gamil H, Mehta P, Chielle E, et al. "Muon-Ra: Quantum random number generation from cosmic rays." IEEE IOLTS 2020. https://doi.org/10.1109/iolts50870.2020.9159728

4. Meehan M, Bravo S, Campos F, et al. "The particle detector in your pocket: The Distributed Electronic Cosmic-ray Observatory." arXiv:1708.01281 [astro-ph.IM]. https://arxiv.org/abs/1708.01281

5. Whiteson D, Mulhearn M, Shimmin C, et al. "Observing Ultra-High Energy Cosmic Rays with Smartphones." arXiv:1410.2895 [astro-ph.IM]. https://arxiv.org/abs/1410.2895

6. Homola P et al. "Cosmic-Ray Extremely Distributed Observatory." arXiv:1908.04139. https://real.mtak.hu/160751/1/1908.04139.pdf

7. Takano et al. "SORAMAME: Development of a Smartphone-Based Radiation Detection App." PoS(ICRC2025)1255. https://pos.sissa.it/501/1255/pdf

8. Sanguinetti B, Martin A, Zbinden H, Gisin N. "Quantum Random Number Generation on a Mobile Phone." *Physical Review X* 2014, 4, 031056. https://doi.org/10.1103/PhysRevX.4.031056

9. Hachaj T, Piekarczyk M. "The Practice of Detecting Potential Cosmic Rays Using CMOS Cameras." *Sensors* 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC10220736/

10. Ruschen T et al. "Generation of True Random Numbers based on Radioactive Decay." Prague Poster 2017. https://poster.fel.cvut.cz/poster2017/proceedings/Poster_2017/Section_EI/EI_040_Ruschen.pdf

11. Walker J. "HotBits: Genuine Random Numbers." Fourmilab (retired 2023). https://www.fourmilab.ch/hotbits/

12. Vandenbroucke J. DECO ICRC 2025 Presentation. CERN Indico. https://indico.cern.ch/event/1258933/contributions/6475918/attachments/3106398/5506424/vandenbroucke_250718_icrc_deco_v2.pdf

13. Lampton M. "CMB Radiation Power Spectrum as a Random Bit Generator." *Heliyon* 2017. https://pmc.ncbi.nlm.nih.gov/articles/PMC5639047/

14. Herrero-Collantes M, Garcia-Escartin JC. "Quantum random number generators." *Reviews of Modern Physics* 2017, 89, 015004. https://link.aps.org/doi/10.1103/RevModPhys.89.015004

15. DECO project website: https://wipac.wisc.edu/deco

16. CREDO project website: https://credo.science

17. SORAMAME project website: https://soramame.n.kanagawa-u.ac.jp/en/
