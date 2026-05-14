# TrinaryVM: Quantum-Certified Entropy Generation for PQC

Welcome to the central repository for **TrinaryVM's** research into high-assurance entropy generation. The overarching goal of this project is to investigate and implement quantum-certified randomness derived from cosmological phenomena—specifically the Cosmic Microwave Background (CMB) and cosmic ray muons—for use in Post-Quantum Cryptography (PQC) and integration into the TrinaryVM architecture.

## Mission Statement

*"High-assurance entropy generation using Cosmic Microwave Background (CMB) radiation. Investigating quantum-certified randomness for Post-Quantum Cryptography (PQC) and TrinaryVM integration."*

As cryptographic standards migrate toward Post-Quantum Cryptography (PQC) (e.g., ML-KEM/Kyber, ML-DSA/Dilithium), the demand for high-assurance, physically verified True Random Number Generators (TRNGs) is paramount. This repository houses our foundational research into harnessing astrophysical noise floors and particle showers as unforgeable, quantum-mechanical entropy sources to seed secure PQC key generation.

## Research Domains

Our current research is divided into four distinct tracks, documented in the following research papers:

### 1. [CMB Hardware Research](research_cmb_hardware.md)
**Focus:** Practical setups for detecting Cosmic Microwave Background radiation as an entropy source.
- Details the physical basis of harvesting the 2.725 K blackbody radiation remnant from the Big Bang.
- Analyzes budget and research-grade hardware configurations (SDRs, Ku-band satellite LNBs, LNAs).
- Identifies the optimal 10–20 GHz frequency window for ground-based cosmological entropy harvesting.

### 2. [CMB Signal Processing Pipeline](research_cmb_signal_processing.md)
**Focus:** Entropy extraction from noisy RF signals and digitizer outputs.
- Explores DSP techniques to decompose thermal noise, atmospheric emission, and the CMB signal.
- Implements entropy extraction methods, including Von Neumann debiasing, Toeplitz hashing, and SHA-256/SHA-3 conditioning.
- Provides Python reference architectures using GNU Radio and Numpy to estimate min-entropy (NIST SP 800-90B).

### 3. [Cosmic Ray Mobile RNG (MRNG)](research_cosmic_ray_mrng.md)
**Focus:** Utilizing common CMOS sensors (e.g., smartphones) to detect cosmic ray muons.
- Explores an alternative cosmological entropy source: ionizing radiation from cosmic ray air showers striking silicon.
- Analyzes throughput limitations (~0.03 bits/hour per device) and discrimination algorithms for filtering out hot pixels.
- Concludes that cosmic rays are ideal as a high-quality supplementary "entropy injection" rather than a standalone primary stream.

### 4. [Cryptography Integration & Validation](research_crypto_validation.md)
**Focus:** Injecting harvested entropy into modern cryptographic stacks and PQC libraries.
- Details the architecture for feeding hardware entropy into the Linux kernel pool (`/dev/random`) and OpenSSL's DRBG.
- Explores NIST SP 800-90A compliant DRBGs (HMAC_DRBG, CTR_DRBG).
- Demonstrates end-to-end integration with `liboqs` for generating quantum-resistant keys using custom CMB TRNG callbacks.
- Outlines the validation methodology using NIST SP 800-22, Dieharder, and TestU01.

## The TrinaryVM Dashboard

The repository also includes the **CMB Dashboard** (located in the [`dashboard/`](dashboard) directory), a React-based web interface built with Vite and Recharts. The dashboard serves as a visualization and monitoring tool for our entropy generation pipelines, featuring interactive modules such as:
- Muon Simulators and Entropy Pool Monitors
- Radiometer Sensitivity and Friis Transmission Calculators
- Interactive Documentation Viewing

## Contributing & Next Steps

This repository is actively maintained as we transition from theoretical research and hardware prototyping into direct integration with the TrinaryVM execution environment. Our next milestones include refining the Toeplitz extractor implementations on FPGA and finalizing the liboqs hardware RNG bindings.
