# Hardware RNG Entropy Integration with Cryptography Libraries & Entropy Validation

> **Scope:** CMB-based and cosmic-ray-based hardware TRNGs → cryptography library integration → entropy validation methodology  
> **Last updated:** 2025  
> **Key standards:** NIST SP 800-22, SP 800-90A/B, FIPS 140-2

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Part 1 — Cryptography Library Integration](#part-1--cryptography-library-integration)
   - 1.1 [Python Cryptography Libraries](#11-python-cryptography-libraries)
   - 1.2 [Post-Quantum Cryptography Libraries](#12-post-quantum-cryptography-libraries)
   - 1.3 [Linux Kernel Entropy Pool](#13-linux-kernel-entropy-pool)
   - 1.4 [NIST SP 800-90A DRBG](#14-nist-sp-800-90a-drbg)
   - 1.5 [OpenSSL RAND_add()](#15-openssl-rand_add)
   - 1.6 [End-to-End Integration: SDR → CSPRNG → PQC Key Generation](#16-end-to-end-integration-sdr--csprng--pqc-key-generation)
3. [Part 2 — Entropy Validation](#part-2--entropy-validation)
   - 2.1 [NIST SP 800-22: Statistical Test Suite](#21-nist-sp-800-22-statistical-test-suite)
   - 2.2 [NIST SP 800-90B: Entropy Estimation](#22-nist-sp-800-90b-entropy-estimation)
   - 2.3 [Dieharder](#23-dieharder)
   - 2.4 [TestU01 (SmallCrush / Crush / BigCrush)](#24-testu01-smallcrush--crush--bigcrush)
   - 2.5 [ent (Fourmilab)](#25-ent-fourmilab)
   - 2.6 [PractRand](#26-practrand)
   - 2.7 [Typical Hardware RNG Test Results](#27-typical-hardware-rng-test-results)
4. [Validation Pipeline](#validation-pipeline)
5. [Security Considerations](#security-considerations)
6. [References](#references)

---

## Architecture Overview

The canonical pipeline for a CMB/cosmic-ray entropy source feeding a PQC key-generation routine:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Physical Entropy Source                                              │
│  (SDR/Bolometer for CMB, smartphone CMOS for cosmic rays,            │
│   radioactive decay counter, thermal noise ADC)                       │
└────────────────────────┬─────────────────────────────────────────────┘
                         │  raw ADC samples / photon arrival times
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Conditioning / Whitening                                             │
│  (von Neumann debiasing, SHA-3 extractor, or AES-CBC-MAC)            │
│  → Output: min-entropy ≥ 0.75 bits/bit (NIST 90B requirement)        │
└────────────────────────┬─────────────────────────────────────────────┘
                         │  conditioned entropy bytes
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Entropy Injection                                                    │
│  • Linux: RNDADDENTROPY ioctl → /dev/random pool                     │
│  • OpenSSL: RAND_add(buf, len, entropy_estimate)                     │
│  • Direct: os.urandom monkey-patch or custom DRBG seed               │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CSPRNG / DRBG Layer                                                  │
│  (NIST CTR_DRBG or HMAC_DRBG per SP 800-90A, or ChaCha20-DRBG)      │
└────────────────────────┬─────────────────────────────────────────────┘
                         │  cryptographic random bytes
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  PQC Key Generation                                                   │
│  (ML-KEM / Kyber, ML-DSA / Dilithium via liboqs)                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Part 1 — Cryptography Library Integration

### 1.1 Python Cryptography Libraries

#### Design principle

All major Python crypto libraries delegate randomness to the OS entropy pool (`/dev/urandom` on Linux, `CryptGenRandom` on Windows). The correct strategy for injecting hardware entropy is therefore to **feed the OS pool first**, not to bypass the library's RNG.

| Library | Random source | Custom entropy injection |
|---------|--------------|--------------------------|
| `secrets` | `os.urandom()` → `/dev/urandom` | Feed OS pool via rngd/ioctl |
| `hashlib` / `hmac` | Deterministic; no RNG | N/A |
| `cryptography` (pyca) | `os.urandom()` | Feed OS pool; or wrap backend |
| `PyCryptodome` | `os.urandom()` (POSIX) | Feed OS pool |
| `ssl` / `OpenSSL` binding | OpenSSL DRBG | `RAND_add` via ctypes |

#### `secrets` module

Python's `secrets` module (3.6+) is a thin wrapper over `os.urandom()`. There is no published API to inject custom entropy directly. The recommended approach is to pre-feed the kernel pool.

```python
import secrets
import os

# --- Direct usage (reads from OS pool which you have already seeded) ---
key_32_bytes = secrets.token_bytes(32)   # 256-bit key
hex_token    = secrets.token_hex(64)     # 512-bit hex string

# --- Monkey-patching os.urandom to XOR in hardware entropy (advanced) ---
# WARNING: This bypasses the OS CSPRNG. Use only if you are certain
# your hardware source is of equal or greater quality.
import ctypes, ctypes.util

_real_urandom = os.urandom

def make_hardware_augmented_urandom(hardware_source_fn):
    """
    Returns a urandom replacement that XORs hardware bytes into each call.
    hardware_source_fn(n) must return exactly n bytes from your TRNG.
    XOR of independent sources has entropy >= max(H_src1, H_src2).
    """
    def augmented_urandom(n):
        os_bytes  = _real_urandom(n)
        hw_bytes  = hardware_source_fn(n)
        return bytes(a ^ b for a, b in zip(os_bytes, hw_bytes))
    return augmented_urandom

# Example: reading from a serial-attached SDR or /dev/hwrng
def read_hardware_entropy(n):
    with open('/dev/hwrng', 'rb') as f:
        return f.read(n)

os.urandom = make_hardware_augmented_urandom(read_hardware_entropy)

# Now secrets.token_bytes() and pyca/cryptography also benefit
from cryptography.hazmat.primitives.asymmetric import ec
private_key = ec.generate_private_key(ec.SECP256R1())
```

#### `cryptography` (pyca) library

The pyca `cryptography` library generates keys through OpenSSL or a native backend. All calls ultimately use `os.urandom()`. For ML-KEM / RSA key generation with hardware entropy:

```python
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import os

# --- Option A: Pre-seed the OS pool (preferred) ---
# See Section 1.3 for rngd / RNDADDENTROPY

# --- Option B: XOR-augment os.urandom (as shown above) ---

# --- Generating cryptographic keys after pool is seeded ---
# RSA-4096
rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=4096)

# Ed25519 (uses 32 bytes of randomness)
ed_key = Ed25519PrivateKey.generate()

# ECDH on P-384
ec_key = ec.generate_private_key(ec.SECP384R1())
```

#### `PyCryptodome`

PyCryptodome's `Crypto.Random.get_random_bytes()` reads from `/dev/urandom` on POSIX via `Crypto/Random/OSRNG/posix.py`. There is no public API for custom entropy injection; feed the OS pool.

```python
from Crypto.Random import get_random_bytes
from Crypto.PublicKey import RSA, ECC

# After seeding the OS pool with your hardware source:
key_bytes = get_random_bytes(32)          # 256 random bytes
rsa_key   = RSA.generate(4096)           # RSA-4096 keypair
ecc_key   = ECC.generate(curve='P-384') # ECC keypair
```

> **PyCryptodome note:** The old `PyCrypto` (pre-PyCryptodome) used the Fortuna PRNG on top of `/dev/urandom`, which was vulnerable to fork-safety issues (CVE-2013-1445). PyCryptodome removed Fortuna and delegates directly to the OS pool.

---

### 1.2 Post-Quantum Cryptography Libraries

#### liboqs (Open Quantum Safe)

liboqs is the reference implementation of NIST-standardized PQC algorithms (ML-KEM / Kyber, ML-DSA / Dilithium, SPHINCS+, etc.). It exposes a dedicated RNG API that **can accept a custom callback**.

**C API:**
```c
#include <oqs/oqs.h>
#include <oqs/rand.h>

/* Custom TRNG callback signature */
typedef void (*algorithm_t)(uint8_t *random_array, size_t bytes_to_read);

/* Register your hardware TRNG */
void OQS_randombytes_custom_algorithm(algorithm_t algorithm);

/* After registration, ALL liboqs calls use your callback */
/* Restore to system default */
void OQS_randombytes_nist_kat_init_256bit(const uint8_t *seed, const uint8_t *personalization_string);
```

**Complete example — injecting CMB/cosmic-ray entropy into Kyber key generation:**

```c
#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <oqs/oqs.h>

/* --- Hardware entropy callback ---------------------------------------- */
/* Reads from a hardware device (SDR output pipe, /dev/hwrng, serial port) */
static int hw_fd = -1;

static void cosmic_trng_callback(uint8_t *buf, size_t len) {
    ssize_t remaining = (ssize_t)len;
    uint8_t *ptr = buf;
    while (remaining > 0) {
        ssize_t r = read(hw_fd, ptr, remaining);
        if (r <= 0) {
            /* Fallback to /dev/urandom on read error */
            int ufd = open("/dev/urandom", O_RDONLY);
            read(ufd, ptr, remaining);
            close(ufd);
            break;
        }
        ptr      += r;
        remaining -= r;
    }
}

int main(void) {
    OQS_STATUS rc;

    /* Open hardware entropy source (replace with your device path) */
    hw_fd = open("/dev/hwrng", O_RDONLY);
    if (hw_fd < 0) hw_fd = open("/dev/urandom", O_RDONLY); /* fallback */

    /* Register custom TRNG with liboqs */
    OQS_randombytes_custom_algorithm(cosmic_trng_callback);

    /* Initialize ML-KEM-768 (Kyber768) */
    OQS_KEM *kem = OQS_KEM_new(OQS_KEM_alg_ml_kem_768);

    uint8_t *public_key  = malloc(kem->length_public_key);
    uint8_t *secret_key  = malloc(kem->length_secret_key);
    uint8_t *ciphertext  = malloc(kem->length_ciphertext);
    uint8_t *shared_sec  = malloc(kem->length_shared_secret);

    /* Key generation uses cosmic_trng_callback internally */
    rc = OQS_KEM_keypair(kem, public_key, secret_key);
    printf("ML-KEM-768 keypair generated: %s\n",
           rc == OQS_SUCCESS ? "OK" : "FAIL");

    /* Encapsulation (recipient) */
    uint8_t *shared_sec2 = malloc(kem->length_shared_secret);
    rc = OQS_KEM_encaps(kem, ciphertext, shared_sec2, public_key);

    /* Decapsulation (sender) */
    rc = OQS_KEM_decaps(kem, shared_sec, ciphertext, secret_key);

    OQS_KEM_free(kem);
    close(hw_fd);
    return 0;
}
```

**Python binding (liboqs-python):**

```python
import oqs
import os

# liboqs-python uses liboqs underneath; it reads from os.urandom by default.
# To inject hardware entropy, augment os.urandom (see Section 1.1)
# OR pre-seed the OS pool (Section 1.3).

with oqs.KeyEncapsulation("ML-KEM-768") as kem:
    public_key = kem.generate_keypair()
    ciphertext, shared_secret_enc = kem.encap_secret(public_key)
    shared_secret_dec = kem.decap_secret(ciphertext)
    print(f"Kyber768 shared secret match: {shared_secret_enc == shared_secret_dec}")

# ML-DSA (Dilithium) signature
with oqs.Signature("ML-DSA-65") as signer:
    pub = signer.generate_keypair()
    message = b"CMB entropy signed message"
    sig = signer.sign(message)
    valid = signer.verify(message, sig, pub)
    print(f"Dilithium65 signature valid: {valid}")
```

#### Build-time option for custom-only RNG

When building liboqs with CMake, you can enforce that **only** a custom callback is used (disabling all fallbacks):

```bash
cmake -DOQS_USE_OPENSSL=OFF \
      -DOQS_USE_PTHREADS=ON \
      -DOQS_DIST_BUILD=ON \
      ..
# Then OQS_randombytes_custom_algorithm() is the sole randomness source.
```

> **Warning from liboqs:** "We DO NOT currently recommend relying on this library in a production environment." It is research/prototyping software. For production PQC, use a FIPS-validated module.

#### CRYSTALS-Kyber / Dilithium reference implementations

The standalone pq-crystals implementations (not via liboqs) call `randombytes()`, which you can override at link time:

```c
/* Override the weak default randombytes in ref/randombytes.c */
#include <stdint.h>
#include <stddef.h>

/* Your implementation replaces the default */
void randombytes(uint8_t *buf, size_t xlen) {
    /* Read from your hardware entropy device */
    read_hardware_entropy(buf, xlen);
}
```

---

### 1.3 Linux Kernel Entropy Pool

#### How the pool works (Linux 5.17+)

Modern Linux (≥5.17) uses a ChaCha20-based DRBG (LRNG) as the kernel CSPRNG. Both `/dev/random` and `/dev/urandom` now draw from the same pool and **do not block** once the CRNG is initialized (≥ 256 bits of seeded entropy). The pool accumulates entropy from hardware interrupts, disk I/O timing, network activity, and hardware RNG drivers (TPM, RDRAND).

```
┌─────────────────────────────────────────────────────────┐
│  Kernel Entropy Pool (ChaCha20-DRBG since kernel 5.17)  │
├──────────┬──────────────┬───────────┬────────────────────┤
│ IRQ      │ Disk timing  │ RDRAND    │ add_hwgenerator_   │
│ jitter   │ / net events │ / RDSEED  │ randomness() API   │
└──────────┴──────────────┴───────────┴────────────────────┘
        ↓                          ↑
   /dev/random               rngd / HAVEGE /
   /dev/urandom              your custom driver
```

#### Method A: rngd (rng-tools)

Feed a hardware device into the kernel pool via the `rngd` daemon:

```bash
# Install
sudo apt-get install rng-tools         # Debian/Ubuntu
sudo yum install rng-tools             # RHEL/CentOS

# Feed /dev/hwrng (default hardware RNG device)
sudo rngd -r /dev/hwrng -o /dev/random --fill-watermark=2048 --foreground

# For a serial/USB-attached SDR TRNG output (e.g., from rtl_fm piped to FIFO)
mkfifo /tmp/entropy_pipe
rtl_fm -f 1420406000 -s 2.4M /tmp/entropy_pipe &  # Tune to CMB-rich sky
sudo rngd -r /tmp/entropy_pipe -o /dev/random --foreground

# Check entropy level
cat /proc/sys/kernel/random/entropy_avail
```

#### Method B: RNDADDENTROPY ioctl (direct injection)

Requires `CAP_SYS_ADMIN`. This is the most direct method and increments the kernel's entropy count:

```c
#include <linux/random.h>
#include <sys/ioctl.h>
#include <fcntl.h>
#include <string.h>
#include <stdio.h>

#define ENTROPY_BUF_BYTES 256

/* Kernel structure for RNDADDENTROPY */
struct rand_pool_info_padded {
    int entropy_count;   /* bits of entropy */
    int buf_size;        /* bytes of data */
    unsigned char buf[ENTROPY_BUF_BYTES];
};

int inject_entropy(const unsigned char *data, int data_bytes, int entropy_bits) {
    int fd = open("/dev/random", O_WRONLY);
    if (fd < 0) { perror("open"); return -1; }

    struct rand_pool_info_padded pool;
    pool.entropy_count = entropy_bits;   /* e.g., 2048 for 256 bytes of full-entropy */
    pool.buf_size      = data_bytes;
    memcpy(pool.buf, data, data_bytes);

    int ret = ioctl(fd, RNDADDENTROPY, &pool);
    close(fd);
    return ret;
}

/* Usage */
int main(void) {
    unsigned char hw_entropy[ENTROPY_BUF_BYTES];
    
    /* Read from your hardware source (CMB radiometer, cosmic ray detector) */
    int src = open("/dev/hwrng", O_RDONLY);
    read(src, hw_entropy, sizeof(hw_entropy));
    close(src);

    /* Inject: claim 8 bits/byte for a high-quality TRNG */
    int rc = inject_entropy(hw_entropy, sizeof(hw_entropy), sizeof(hw_entropy) * 8);
    printf("RNDADDENTROPY: %s\n", rc == 0 ? "OK" : "failed");
    return 0;
}
```

**Python wrapper:**

```python
import os
import struct
import fcntl
import ctypes

RNDADDENTROPY = 0x40085203  # From linux/random.h (x86_64)

def inject_entropy_linux(hw_bytes: bytes, entropy_bits: int) -> None:
    """
    Inject hardware entropy bytes into the Linux kernel pool.
    Requires CAP_SYS_ADMIN (run as root or with appropriate capability).
    
    Args:
        hw_bytes:     Raw bytes from hardware TRNG
        entropy_bits: Your entropy estimate (0..len*8). 
                      Use len*8 only for a verified, unbiased TRNG.
    """
    # struct rand_pool_info { int entropy_count; int buf_size; u32 buf[]; }
    buf_len = len(hw_bytes)
    fmt     = f'ii{buf_len}s'
    pool    = struct.pack(fmt, entropy_bits, buf_len, hw_bytes)
    
    with open('/dev/random', 'wb') as f:
        fcntl.ioctl(f.fileno(), RNDADDENTROPY, pool)

# Example: inject 256 bytes from a CMB/SDR source with 8 bits/byte entropy
def read_cmb_entropy(n: int) -> bytes:
    """Read n bytes from a pre-processed CMB radiometer output."""
    with open('/dev/hwrng', 'rb') as f:   # replace with your device
        return f.read(n)

hw = read_cmb_entropy(256)
inject_entropy_linux(hw, entropy_bits=len(hw) * 8)  # claim full entropy
```

#### Method C: HAVEGE / haveged

HAVEGE exploits processor timing volatility (branch predictor state, cache behavior, pipeline jitter) as an entropy source. Useful on embedded/virtual systems:

```bash
sudo apt-get install haveged
sudo systemctl enable --now haveged

# Monitor: HAVEGE feeds the pool every 60 seconds regardless of entropy level
# (since kernel 5.4, the HAVEGE algorithm is built into the kernel itself)
```

> **Note (Linux ≥ 5.4):** The kernel includes the HAVEGE-inspired jitter entropy mechanism natively. Running `haveged` still adds entropy diversity.

---

### 1.4 NIST SP 800-90A DRBG

NIST SP 800-90A defines three DRBGs suitable for seeding from hardware TRNGs:

| DRBG | Based on | Security strength | Notes |
|------|---------|-------------------|-------|
| `Hash_DRBG` | SHA-256/SHA-512 | 128/256-bit | Security proof exists; slightly complex |
| `HMAC_DRBG` | HMAC-SHA-256/512 | 128/256-bit | Best security proof; recommended |
| `CTR_DRBG` | AES-128/256 in CTR | 128/256-bit | Fastest; used by Intel RDRAND |

**Hash_DRBG seeding with hardware entropy (Python):**

```python
import hashlib
import hmac
import os
import struct

class HMAC_DRBG:
    """
    NIST SP 800-90A Rev 1 compliant HMAC_DRBG using HMAC-SHA-256.
    Security strength: 256 bits.
    """
    HASH_ALG  = 'sha256'
    OUTLEN    = 32   # SHA-256 output bytes
    SEEDLEN   = 55   # NIST SP 800-90A Table 2: seedlen for SHA-256 = 440 bits = 55 bytes

    def __init__(self, entropy_input: bytes, nonce: bytes,
                 personalization_string: bytes = b''):
        """
        Args:
            entropy_input: Must have min-entropy >= security_strength (256 bits = 32 bytes).
                           Source: your hardware TRNG.
            nonce:         At least security_strength/2 bits = 16 bytes of fresh entropy.
            personalization_string: Optional, up to seedlen bytes.
        """
        assert len(entropy_input) >= 32, "Need at least 256 bits of entropy"
        self.K = b'\x00' * self.OUTLEN
        self.V = b'\x01' * self.OUTLEN
        self.reseed_counter = 1
        
        seed_material = entropy_input + nonce + personalization_string
        self._update(seed_material)

    def _update(self, provided_data: bytes = b''):
        data = provided_data if provided_data else b''
        
        self.K = hmac.new(self.K, self.V + b'\x00' + data, self.HASH_ALG).digest()
        self.V = hmac.new(self.K, self.V, self.HASH_ALG).digest()
        
        if data:
            self.K = hmac.new(self.K, self.V + b'\x01' + data, self.HASH_ALG).digest()
            self.V = hmac.new(self.K, self.V, self.HASH_ALG).digest()

    def reseed(self, entropy_input: bytes, additional_input: bytes = b''):
        """Reseed with fresh hardware entropy."""
        assert len(entropy_input) >= 32
        seed_material = entropy_input + additional_input
        self._update(seed_material)
        self.reseed_counter = 1

    def generate(self, num_bytes: int, additional_input: bytes = b'') -> bytes:
        """Generate num_bytes of random output."""
        assert self.reseed_counter <= 10000, "Reseed required"
        
        if additional_input:
            self._update(additional_input)
        
        output = b''
        while len(output) < num_bytes:
            self.V = hmac.new(self.K, self.V, self.HASH_ALG).digest()
            output += self.V
        
        self._update(additional_input)
        self.reseed_counter += 1
        return output[:num_bytes]


def read_hardware_entropy(n: int) -> bytes:
    """
    Read n bytes from your hardware TRNG.
    Replace with CMB radiometer, cosmic ray detector, or SDR output.
    For testing, /dev/hwrng or /dev/urandom can be used.
    """
    with open('/dev/hwrng', 'rb') as f:
        return f.read(n)

# --- Instantiate the DRBG with hardware entropy ---
entropy_input = read_hardware_entropy(48)    # 384-bit entropy input (> 256-bit security)
nonce         = read_hardware_entropy(16)    # 128-bit nonce
personalization = b'CMB-TRNG-2025-v1'       # application-specific label

drbg = HMAC_DRBG(entropy_input, nonce, personalization)

# --- Generate 32 bytes for a PQC key seed ---
pqc_seed_bytes = drbg.generate(32)
print(f"HMAC_DRBG output: {pqc_seed_bytes.hex()}")

# --- Periodic reseed from hardware ---
fresh_entropy = read_hardware_entropy(48)
drbg.reseed(fresh_entropy)
```

**CTR_DRBG implementation (uses AES-256, faster):**

```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os

class CTR_DRBG:
    """
    NIST SP 800-90A CTR_DRBG with AES-256 and derivation function.
    Security strength: 256 bits.  Max output between reseeds: 2^48 bytes.
    """
    KEY_LEN    = 32  # AES-256
    BLOCK_LEN  = 16  # AES block size
    SEED_LEN   = 48  # keylen + blocklen

    def __init__(self, entropy: bytes, nonce: bytes = b'', personalization: bytes = b''):
        assert len(entropy) >= self.KEY_LEN
        self.key     = b'\x00' * self.KEY_LEN
        self.V       = b'\x00' * self.BLOCK_LEN
        self.counter = 1
        seed = entropy + nonce + personalization
        self._update(seed[:self.SEED_LEN] if len(seed) >= self.SEED_LEN else seed.ljust(self.SEED_LEN, b'\x00'))

    def _block_encrypt(self, data: bytes) -> bytes:
        cipher = Cipher(algorithms.AES(self.key), modes.ECB(), backend=default_backend())
        enc = cipher.encryptor()
        return enc.update(data) + enc.finalize()

    def _update(self, provided_data: bytes):
        temp = b''
        V_int = int.from_bytes(self.V, 'big')
        while len(temp) < self.SEED_LEN:
            V_int  = (V_int + 1) & ((1 << 128) - 1)
            temp  += self._block_encrypt(V_int.to_bytes(16, 'big'))
        temp = temp[:self.SEED_LEN]
        xored = bytes(a ^ b for a, b in zip(temp, provided_data.ljust(self.SEED_LEN, b'\x00')))
        self.key = xored[:self.KEY_LEN]
        self.V   = xored[self.KEY_LEN:]

    def generate(self, num_bytes: int) -> bytes:
        assert self.counter <= (1 << 48)
        output = b''
        V_int  = int.from_bytes(self.V, 'big')
        while len(output) < num_bytes:
            V_int  = (V_int + 1) & ((1 << 128) - 1)
            output += self._block_encrypt(V_int.to_bytes(16, 'big'))
        self.V = V_int.to_bytes(16, 'big')
        self._update(b'\x00' * self.SEED_LEN)
        self.counter += 1
        return output[:num_bytes]

    def reseed(self, entropy: bytes):
        self._update(entropy[:self.SEED_LEN].ljust(self.SEED_LEN, b'\x00'))
        self.counter = 1
```

---

### 1.5 OpenSSL RAND_add()

OpenSSL maintains an internal DRBG (based on HMAC_DRBG since OpenSSL 1.1.1). `RAND_add()` mixes external entropy into its internal state.

**Prototype:**
```c
void RAND_add(const void *buf, int num, double randomness);
/* randomness: estimated entropy in bytes (0.0 .. num) */
```

**C example:**
```c
#include <openssl/rand.h>
#include <string.h>

void feed_hardware_entropy_to_openssl(void) {
    unsigned char hw_entropy[256];
    
    /* Read from hardware source */
    int fd = open("/dev/hwrng", O_RDONLY);
    read(fd, hw_entropy, sizeof(hw_entropy));
    close(fd);

    /* Mix in with entropy claim of 256 bytes (full quality) */
    RAND_add(hw_entropy, sizeof(hw_entropy), (double)sizeof(hw_entropy));
    
    /* Verify seeded state */
    if (RAND_status() != 1) {
        fprintf(stderr, "OpenSSL RAND not sufficiently seeded\n");
    }
    
    /* Now generate random bytes */
    unsigned char random_output[32];
    RAND_bytes(random_output, sizeof(random_output));
}
```

**Python ctypes wrapper:**
```python
import ctypes
import ctypes.util
import os

# Load OpenSSL shared library
libssl_name = ctypes.util.find_library('ssl')
libcrypto   = ctypes.CDLL(ctypes.util.find_library('crypto'))

# Declare RAND_add signature
libcrypto.RAND_add.restype  = None
libcrypto.RAND_add.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_double]
libcrypto.RAND_status.restype  = ctypes.c_int
libcrypto.RAND_status.argtypes = []

def openssl_add_entropy(hw_bytes: bytes, entropy_bits: float = None) -> None:
    """
    Mix hardware entropy bytes into OpenSSL's internal DRBG.
    
    Args:
        hw_bytes:     Entropy bytes from hardware TRNG
        entropy_bits: Estimated entropy in bits. Defaults to full (len*8).
                      Under FIPS mode, this is treated as 'additional data'
                      only, not a trusted reseed.
    """
    if entropy_bits is None:
        entropy_bits = len(hw_bytes) * 8
    
    entropy_bytes = entropy_bits / 8.0   # RAND_add takes bytes, not bits
    buf = ctypes.create_string_buffer(hw_bytes)
    libcrypto.RAND_add(buf, len(hw_bytes), entropy_bytes)

def read_hardware_entropy(n: int) -> bytes:
    with open('/dev/hwrng', 'rb') as f:
        return f.read(n)

# Feed hardware entropy
hw = read_hardware_entropy(256)
openssl_add_entropy(hw, entropy_bits=256 * 8)  # claim 8 bits/byte

# Verify
if libcrypto.RAND_status() == 1:
    print("OpenSSL RAND seeded successfully")
```

> **FIPS mode warning:** In OpenSSL FIPS mode (`--enable-fips`), `RAND_add()` data is treated as **additional input** only, not as a trusted entropy source. The DRBG will not reseed from application-provided data. Use the OS entropy pool (Section 1.3) in FIPS environments.

---

### 1.6 End-to-End Integration: SDR → CSPRNG → PQC Key Generation

This section provides a complete Python pipeline reading entropy from an SDR (Software Defined Radio) tuned to a CMB-rich frequency or atmospheric noise, conditioning it, and using it for ML-KEM-768 key generation.

```python
"""
CMB/Atmospheric noise SDR → Conditioned entropy → HMAC_DRBG → ML-KEM-768

Requirements:
  - pyrtlsdr  (pip install pyrtlsdr)
  - numpy
  - liboqs-python (pip install liboqs)
  - cryptography (pip install cryptography)

Hardware: RTL-SDR (≈$25) or better SDR tuned to 1.42 GHz (hydrogen line / CMB)
"""

import numpy as np
import hashlib
import hmac as hmac_module
import struct
import fcntl
import os
import threading
import queue
from typing import Iterator

# ─── Configuration ──────────────────────────────────────────────────────────
SDR_FREQ_HZ     = 1_420_406_000   # 21cm hydrogen line (near CMB spectral peak)
SDR_SAMPLE_RATE = 2_400_000       # 2.4 Msps
SDR_GAIN        = 40.0            # dB
ENTROPY_QUEUE_DEPTH = 100         # buffered 32-byte blocks
RNDADDENTROPY   = 0x40085203      # Linux ioctl (x86_64)

# ─── Step 1: SDR Entropy Acquisition ────────────────────────────────────────

class SDREntropySource:
    """
    Reads IQ samples from RTL-SDR, extracts entropy from least-significant bits
    of the magnitude, and applies SHA-3 extraction to produce conditioned bytes.
    
    For CMB: tune to 1.42 GHz. The thermal noise floor of the receiver provides
    true randomness from quantum fluctuations. CMB contributes ~2.7 K thermal 
    noise on top of receiver noise (~50–100 K system temperature).
    
    For cosmic rays: use a CMOS camera sensor in a dark box and read the dark
    noise; cosmic ray muons create bright pixel clusters detectable as events.
    """
    
    def __init__(self, freq=SDR_FREQ_HZ, sample_rate=SDR_SAMPLE_RATE, gain=SDR_GAIN):
        self.freq        = freq
        self.sample_rate = sample_rate
        self.gain        = gain
        self._queue      = queue.Queue(maxsize=ENTROPY_QUEUE_DEPTH)
        self._stop_evt   = threading.Event()
        self._thread     = None

    def _sdr_reader_thread(self):
        """Background thread that reads from SDR and conditions entropy."""
        try:
            from rtlsdr import RtlSdr
            sdr = RtlSdr()
            sdr.sample_rate = self.sample_rate
            sdr.center_freq = self.freq
            sdr.gain        = self.gain

            while not self._stop_evt.is_set():
                # Read 256K IQ samples (complex64)
                samples = sdr.read_samples(256 * 1024)
                
                # Extract LSBs from magnitude (thermal noise dominated)
                magnitudes = np.abs(samples)
                raw_bits   = (magnitudes * 256).astype(np.uint8)
                
                # Von Neumann debiasing (removes first-order bias)
                debiased = self._von_neumann_debias(raw_bits)
                
                # SHA-3 extraction: 32 bytes per 256-byte input block
                for i in range(0, len(debiased) - 256, 256):
                    block    = bytes(debiased[i:i+256])
                    conditioned = hashlib.sha3_256(block).digest()
                    if not self._queue.full():
                        self._queue.put(conditioned)

            sdr.close()
        except Exception as e:
            # Fallback: use /dev/urandom if SDR unavailable
            print(f"SDR unavailable ({e}), falling back to /dev/urandom")
            while not self._stop_evt.is_set():
                block = os.urandom(32)
                if not self._queue.full():
                    self._queue.put(block)

    @staticmethod
    def _von_neumann_debias(byte_array: np.ndarray) -> list:
        """
        Von Neumann unbiasing: examine consecutive bit pairs.
        01 → output 0; 10 → output 1; 00 or 11 → discard.
        Removes first-order bias at the cost of ~50% throughput.
        """
        bits = np.unpackbits(byte_array)
        output = []
        for i in range(0, len(bits) - 1, 2):
            if bits[i] == 0 and bits[i+1] == 1:
                output.append(0)
            elif bits[i] == 1 and bits[i+1] == 0:
                output.append(1)
            # else: discard correlated pair
        return np.packbits(output).tolist() if output else []

    def start(self):
        self._thread = threading.Thread(target=self._sdr_reader_thread, daemon=True)
        self._thread.start()

    def stop(self):
        self._stop_evt.set()

    def read_bytes(self, n: int) -> bytes:
        """Block until n bytes of conditioned hardware entropy are available."""
        result = b''
        while len(result) < n:
            chunk = self._queue.get(timeout=30)   # 30s timeout
            result += chunk
        return result[:n]


# ─── Step 2: Feed kernel pool ────────────────────────────────────────────────

def inject_to_kernel_pool(entropy_bytes: bytes) -> None:
    """Inject entropy into Linux kernel pool via RNDADDENTROPY ioctl."""
    buf_len = len(entropy_bytes)
    # claim 8 bits/byte for SHA-3 conditioned output
    pool    = struct.pack(f'ii{buf_len}s', buf_len * 8, buf_len, entropy_bytes)
    try:
        with open('/dev/random', 'wb') as f:
            fcntl.ioctl(f.fileno(), RNDADDENTROPY, pool)
    except PermissionError:
        pass  # Non-root: skip ioctl, pool still receives data via write


# ─── Step 3: HMAC_DRBG seeded from hardware ──────────────────────────────────

class HMAC_DRBG:
    """Minimal NIST SP 800-90A HMAC_DRBG (HMAC-SHA-256, 256-bit security)."""
    
    def __init__(self, entropy: bytes, nonce: bytes, personalization: bytes = b''):
        assert len(entropy) >= 32
        self.K = b'\x00' * 32
        self.V = b'\x01' * 32
        self._update(entropy + nonce + personalization)
        self.reseed_ctr = 1

    def _hmac(self, key: bytes, *data: bytes) -> bytes:
        msg = b''.join(data)
        return hmac_module.new(key, msg, 'sha256').digest()

    def _update(self, data: bytes = b''):
        self.K = self._hmac(self.K, self.V, b'\x00', data)
        self.V = self._hmac(self.K, self.V)
        if data:
            self.K = self._hmac(self.K, self.V, b'\x01', data)
            self.V = self._hmac(self.K, self.V)

    def generate(self, num_bytes: int) -> bytes:
        assert self.reseed_ctr <= 10_000, "DRBG reseed required"
        out = b''
        while len(out) < num_bytes:
            self.V = self._hmac(self.K, self.V)
            out   += self.V
        self._update()
        self.reseed_ctr += 1
        return out[:num_bytes]

    def reseed(self, entropy: bytes):
        assert len(entropy) >= 32
        self._update(entropy)
        self.reseed_ctr = 1


# ─── Step 4: PQC Key Generation ──────────────────────────────────────────────

def generate_pqc_keypair_from_hardware_trng():
    """
    Full pipeline: SDR → SHA-3 conditioned → HMAC_DRBG → ML-KEM-768 keypair.
    """
    print("[1] Starting SDR entropy source...")
    sdr = SDREntropySource(freq=SDR_FREQ_HZ)
    sdr.start()

    print("[2] Collecting 96 bytes of conditioned entropy...")
    entropy_input    = sdr.read_bytes(48)   # 384-bit entropy
    nonce            = sdr.read_bytes(16)   # 128-bit nonce
    personalization  = b'ML-KEM-768-CMB-TRNG-v1'

    print("[3] Seeding HMAC_DRBG...")
    drbg = HMAC_DRBG(entropy_input, nonce, personalization)

    print("[4] Injecting to kernel pool...")
    inject_to_kernel_pool(sdr.read_bytes(256))

    print("[5] Generating ML-KEM-768 keypair...")
    # Monkey-patch os.urandom with DRBG output for the duration of key generation
    _real_urandom = os.urandom
    os.urandom = lambda n: drbg.generate(n)
    
    try:
        import oqs
        with oqs.KeyEncapsulation("ML-KEM-768") as kem:
            public_key = kem.generate_keypair()
            ciphertext, shared_secret = kem.encap_secret(public_key)
            print(f"  Public key size: {len(public_key)} bytes")
            print(f"  Secret key OK, shared secret: {shared_secret.hex()[:32]}...")
            return public_key, shared_secret
    finally:
        os.urandom = _real_urandom  # Restore
        sdr.stop()


# ─── Step 5: Continuous entropy harvesting daemon ────────────────────────────

class EntropyHarvestingDaemon:
    """
    Background daemon that continuously harvests hardware entropy
    and replenishes the OS pool via rngd or ioctl.
    """
    
    def __init__(self, hw_source, reseed_interval_bytes=4096):
        self.hw_source          = hw_source
        self.reseed_interval    = reseed_interval_bytes
        self._stop              = threading.Event()

    def run(self):
        while not self._stop.is_set():
            try:
                entropy = self.hw_source.read_bytes(self.reseed_interval)
                inject_to_kernel_pool(entropy)
                # Also feed OpenSSL
                try:
                    import ctypes, ctypes.util
                    libcrypto = ctypes.CDLL(ctypes.util.find_library('crypto'))
                    buf = ctypes.create_string_buffer(entropy)
                    libcrypto.RAND_add(buf, len(entropy), float(len(entropy)))
                except Exception:
                    pass
            except Exception as e:
                print(f"Entropy harvest error: {e}")

    def start(self):
        t = threading.Thread(target=self.run, daemon=True)
        t.start()

    def stop(self):
        self._stop.set()
```

---

## Part 2 — Entropy Validation

### 2.1 NIST SP 800-22: Statistical Test Suite

SP 800-22 Rev 1a (April 2010) defines 15 statistical hypothesis tests for binary sequences. It is the **industry standard** for validating TRNG output quality.

**Setup:**
```bash
# Download and build NIST STS 2.1.2
wget https://csrc.nist.gov/CSRC/media/Projects/Random-Bit-Generation/documents/sts-2.1.2.zip
unzip sts-2.1.2.zip && cd sts-2.1.2
make

# Generate 10 MB of test data from your hardware source
dd if=/dev/hwrng of=/tmp/trng_test.bin bs=1M count=10

# Run all 15 tests
./assess 1000000  # 1M bits per sequence

# Input your binary file when prompted:
# > Select file input (1)
# > Enter filename: /tmp/trng_test.bin  
# > Number of sequences: 10 (for 10 MB file)
```

#### The 15 Tests

| # | Test Name | What it Measures | Min Input | Pass Criteria |
|---|-----------|-----------------|-----------|---------------|
| 1 | **Frequency (Monobit)** | Proportion of 0s and 1s | n ≥ 100 | p-value > 0.01; proportion ≥ 0.980 (for n=1000 seqs) |
| 2 | **Frequency within a Block** | Local 1-density in M-bit blocks | n ≥ 100 | p-value > 0.01 |
| 3 | **Runs** | Oscillation between 0-runs and 1-runs | n ≥ 100 | p-value > 0.01 |
| 4 | **Longest Run of Ones in a Block** | Longest run length distribution | n ≥ 128 | p-value > 0.01 |
| 5 | **Binary Matrix Rank** | Linear dependence of substrings | n ≥ 38,912 | p-value > 0.01 |
| 6 | **DFT (Spectral)** | Periodic structure (frequency domain) | n ≥ 1000 | p-value > 0.01 |
| 7 | **Non-overlapping Template** | Aperiodic patterns (9-bit templates) | n ≥ 1,000,000 | p-value > 0.01 |
| 8 | **Overlapping Template** | Runs of consecutive 1s | n ≥ 1,000,000 | p-value > 0.01 |
| 9 | **Maurer's Universal Statistical** | Compressibility / entropy content | n ≥ 387,840 | p-value > 0.01 |
| 10 | **Linear Complexity** | Linear feedback shift register length | n ≥ 1,000,000 | p-value > 0.01 |
| 11 | **Serial** | Frequency of m-bit patterns | n ≥ 1,000,000 | p-value > 0.01 (two sub-tests) |
| 12 | **Approximate Entropy** | Frequency of overlapping m-bit patterns | n ≥ 1,000,000 | p-value > 0.01 |
| 13 | **Cumulative Sums (Cusum)** | Maximum deviation of partial sums | n ≥ 100 | p-value > 0.01 (fwd + rev) |
| 14 | **Random Excursions** | Number of cycles with k visits to state x | n ≥ 1,000,000 | p-value > 0.01 (8 sub-tests) |
| 15 | **Random Excursions Variant** | Total visits to states during excursions | n ≥ 1,000,000 | p-value > 0.01 (18 sub-tests) |

**Pass criterion (from NIST SP 800-22 §4.2):**

For significance level α = 0.01 and sample size n = 1000 sequences, the acceptable range for the proportion of passing sequences per test is approximately:

```
Acceptable proportion ≥ 1 - α - 3√(α(1-α)/n)
                       ≥ 1 - 0.01 - 3√(0.0099/1000)
                       ≈ 0.9805...
```

So approximately **980 out of 1000 sequences must pass** each test. The p-value distribution across the 1000 sub-samples must also be uniform (checked by a chi-square or KS test with threshold ≥ 0.0001).

**Interpreting results:**

```
-------------------------------------------------------------------------------------
RESULTS FOR THE UNIFORMITY OF P-VALUES AND THE PROPORTION OF PASSING SEQUENCES
-------------------------------------------------------------------------------------
                C1  C2  C3  C4  C5  C6  C7  C8  C9 C10  P-VALUE  PROPORTION  RESULT
Frequency        2  26  41  95 169 264 261  96  44   2  0.739918   984/1000    Pass
BlockFrequency  ...
Runs            ...
                                               ...
ApproximateEnt   1  10  98  95 194 264 237  80  20   1  0.048693   988/1000    Pass
```

C1–C10 are histogram bins for the p-value distribution. A good RNG should show near-uniform counts across all 10 bins.

---

### 2.2 NIST SP 800-90B: Entropy Estimation

SP 800-90B defines how to **estimate min-entropy** from a raw entropy source (before conditioning). This is the framework for certifying that your hardware source actually has the claimed entropy.

#### IID vs Non-IID track

```
Collect 1,000,000 samples (8-bit each) from raw noise source
                    │
                    ▼
         Run IID hypothesis tests
         (permutation test + 5 chi-square tests)
                    │
           ┌────────┴──────────┐
           │ IID confirmed     │ non-IID (dependent samples)
           ▼                   ▼
  MCV estimate           Apply all 10 non-IID estimators
  min-entropy = min-entropy = min(all 10 estimates)
  -log2(p_max)
```

#### Non-IID entropy estimators

| Estimator | What it captures |
|-----------|-----------------|
| **Most Common Value (MCV)** | p_max = max frequency of any single symbol |
| **Collision** | Expected collision time for repeated values |
| **Markov** | 2nd-order Markov chain transition probabilities |
| **Compression** | LZ78Y-based compressibility of the sequence |
| **t-Tuple** | Frequency of all t-length patterns (t=1..4) |
| **Longest Repeated Substring (LRS)** | Longest repeated substring length |
| **MultiMCW Predictor** | Multi-symbol multi-context window predictor |
| **Lag Predictor** | Prediction based on time-lagged correlation |
| **MultiMMC Predictor** | Multi-class MMC predictor |
| **LZ78Y Predictor** | LZ78Y adaptive dictionary predictor |

**Running the NIST SP 800-90B estimator:**

```bash
# Get the official NIST tool
git clone https://github.com/usnistgov/SP800-90B_EntropyAssessment.git
cd SP800-90B_EntropyAssessment
pip install -r python/requirements.txt

# Collect raw samples (before conditioning/whitening)
dd if=/dev/hwrng of=/tmp/raw_entropy_1M.bin bs=1 count=1000000

# Run IID tests
python python/iid_main.py /tmp/raw_entropy_1M.bin 8 1

# Run non-IID tests  
python python/non_iid_main.py /tmp/raw_entropy_1M.bin 8 1

# Expected output:
# Calculating non-IID min-entropy...
# Most Common Value Estimate: 0.99876
# Collision Estimate:         0.966577
# Markov Estimate:            0.999052
# Compression Estimate:       1.000000
# t-Tuple Estimate:           0.935861  ← typically lowest
# LRS Estimate:               0.965143
# ...
# Overall min-entropy: 0.935861 bits/symbol  ← minimum of all estimators
```

**Interpretation:**
- Values close to 1.0 = high quality (≈ 1 bit of randomness per bit of output)
- Values below 0.75 = marginal; consider additional conditioning
- NIST requires **at least 0.75 bits/symbol** (for full-entropy output after 2:1 conditioning)

---

### 2.3 Dieharder

Dieharder (by Robert Brown, Duke University) is the expanded successor to the classic Diehard battery. It includes Diehard's original 15 tests plus many additional tests, totaling ~100+ p-values per full run.

**Installation:**
```bash
sudo apt-get install dieharder

# Or from source
git clone https://github.com/rebelxt/dieharder.git
cd dieharder && autoreconf -i && ./configure && make && sudo make install
```

**Running tests:**
```bash
# Full battery on a binary file (-g 201 = file input)
dieharder -a -g 201 -f /tmp/trng_test.bin

# Run all tests with increased resolution (more p-values = more reliable)
dieharder -a -g 201 -f /tmp/trng_test.bin -p 100

# Run against /dev/hwrng directly
dieharder -a -g 201 -f /dev/hwrng

# Run a specific test (e.g., test #0: Diehard Birthday Spacings)
dieharder -d 0 -g 201 -f /tmp/trng_test.bin

# List all available tests
dieharder -l
```

**Key tests in the Dieharder battery:**

| Test ID | Test Name | Source |
|---------|-----------|--------|
| 0 | Diehard Birthday Spacings | Diehard |
| 1 | Diehard OPERM5 | Diehard (suspect, deprecated) |
| 2 | Diehard 32×32 Binary Rank | Diehard |
| 3 | Diehard 6×8 Binary Rank | Diehard |
| 4 | Diehard Bitstream | Diehard |
| 5 | Diehard OPSO | Diehard |
| 6 | Diehard OQSO | Diehard |
| 7 | Diehard DNA | Diehard |
| 8 | Diehard Count 1s in Stream | Diehard |
| 9 | Diehard Count 1s in Bytes | Diehard |
| 10 | Diehard Parking Lot | Diehard |
| 11 | Diehard Minimum Distance (2D Circle) | Diehard |
| 12 | Diehard 3D Sphere (Minimum Distance) | Diehard |
| 13 | Diehard Squeeze | Diehard |
| 14 | Diehard Sums | Diehard (suspect) |
| 15 | Diehard Runs | Diehard |
| 16 | Diehard Craps | Diehard |
| 17 | Marsaglia/Tsang GCD | New |
| 100 | STS Monobit | NIST STS |
| 101 | STS Runs | NIST STS |
| 102 | STS Serial | NIST STS |
| 200 | RGB Bit Distribution Test | New |
| 201–205 | RGB Generalized Minimum Distance (2–6D) | New |
| 206 | RGB Permutations | New |
| 207 | RGB Lagged Sum | New |
| 208 | RGB Kolmogorov-Smirnov | New |
| 209 | Byte Distribution | New |
| 210 | DAB DCT | New |
| 211 | DAB Fill Tree | New |
| 212 | DAB Fill Tree 2 | New |
| 213 | DAB Monobit 2 | New |

**Interpreting Dieharder output:**
```
#=============================================================================#
#            dieharder version 3.31.1 Copyright 2003 Robert G. Brown          #
#=============================================================================#
   rng_name    |rands/second|   Seed   |
 file_input_raw|  5.61e+07  |3779178855|
#=============================================================================#
        test_name   |ntup| tsamples |psamples|  p-value |Assessment
#=============================================================================#
   diehard_birthdays|   0|       100|     100|0.34277337|  PASSED
      diehard_operm5|   0|   1000000|     100|0.28745534|  PASSED
  diehard_rank_32x32|   0|     40000|     100|0.65918413|  PASSED
```

**Pass thresholds:**
- `PASSED`:  p-value ∈ (0.005, 0.995) — normal
- `WEAK`:    p-value < 0.005 or > 0.995 — borderline (retest)
- `FAILED`:  p-value < 0.0005 or > 0.9995 — definite failure

A good TRNG should have **zero FAILED and fewer than ~5 WEAK** results across the full battery. Since p-values are uniformly distributed for a perfect RNG, expect ~1% of tests to fall in the "extreme" range by chance alone.

---

### 2.4 TestU01 (SmallCrush / Crush / BigCrush)

TestU01 (by Pierre L'Ecuyer, Université de Montréal) is the most **rigorous** published test battery. Its BigCrush consumes terabytes of data and applies 106 distinct tests.

| Battery | Tests | Data Required | Runtime |
|---------|-------|--------------|---------|
| SmallCrush | 10 | ~46 MB | ~minutes |
| Crush | 96 | ~30 GB | ~hours |
| BigCrush | 106 | ~240 GB | ~1 day |

**Installation:**
```bash
# Dependencies
sudo apt-get install libtestu01-dev

# Or build from source
wget http://simul.iro.umontreal.ca/testu01/TestU01.zip
unzip TestU01.zip && cd TestU01-1.2.3
./configure --prefix=/usr/local && make && sudo make install
```

**Testing a file-based source (C program):**

```c
/* testu01_from_file.c */
#include "unif01.h"
#include "bbattery.h"
#include <stdio.h>

static FILE *rng_file = NULL;
static unsigned int rng_index = 0;

/* Generator function: reads 32-bit words from file */
static unsigned int file_gen_bits(void) {
    unsigned int x = 0;
    if (fread(&x, sizeof(x), 1, rng_file) != 1) {
        rewind(rng_file);   /* wrap around for SmallCrush */
        fread(&x, sizeof(x), 1, rng_file);
    }
    return x;
}

int main(int argc, char *argv[]) {
    if (argc < 2) { fprintf(stderr, "Usage: %s <binary_file>\n", argv[0]); return 1; }
    
    rng_file = fopen(argv[1], "rb");
    if (!rng_file) { perror("fopen"); return 1; }

    /* Create TestU01 generator from our file-reading function */
    unif01_Gen *gen = unif01_CreateExternGenBits("TRNG_from_file", file_gen_bits);

    /* Run batteries in increasing order of rigor */
    printf("=== SmallCrush ===\n");
    bbattery_SmallCrush(gen);

    /* Uncomment for more rigorous testing (requires much more data):
    printf("=== Crush ===\n");
    bbattery_Crush(gen);
    
    printf("=== BigCrush ===\n");
    bbattery_BigCrush(gen);
    */

    unif01_DeleteExternGenBits(gen);
    fclose(rng_file);
    return 0;
}
```

**Compile and run:**
```bash
gcc -O3 -o testu01_test testu01_from_file.c -ltestu01 -lprobdist -lmylib -lm
./testu01_test /tmp/trng_test.bin
```

**Python wrapper (feeding piped data):**

```python
import subprocess
import os

def run_practrand(binary_file: str, bits: str = "32") -> str:
    """Run PractRand on a binary file via stdin pipe."""
    cmd = f"RNG_test stdin{bits} -tlmax 256MB"
    with open(binary_file, 'rb') as f:
        result = subprocess.run(
            cmd.split(),
            stdin=f,
            capture_output=True,
            text=True,
            timeout=3600
        )
    return result.stdout + result.stderr

# Feed hardware data to TestU01 via pipe
def test_hardware_source_smallcrush(hw_device: str = '/dev/hwrng'):
    """
    Stream hardware bytes through TestU01 SmallCrush.
    Requires the C test binary compiled above.
    """
    # Collect ~100 MB for SmallCrush
    os.system(f"dd if={hw_device} of=/tmp/hw_test.bin bs=1M count=100")
    os.system("./testu01_test /tmp/hw_test.bin")
```

**Interpreting TestU01 results:**

Tests that fail are reported as:
```
Generator: TRNG_from_file
-----------------------------------------------
Test                          p-value
-----------------------------------------------
 1 SmallCrush, test 1:         Collision        0.9999    [FAIL]
 2 SmallCrush, test 2:         BirthdaySpacings 0.3847
...
-----------------------------------------------
The following tests gave p-values outside [0.001, 0.999]:
(eps  means a value < 1.0e-300):
(eps1 means a value < 1.0e-15):

      Test                    p-value
------------------------------------
 1  Collision                eps
```

A good TRNG should show **no failures across SmallCrush** and only occasional borderline results in Crush/BigCrush.

---

### 2.5 ent (Fourmilab)

`ent` is a fast, single-pass entropy assessment tool. It provides a quick sanity check but is **not a substitute** for full statistical batteries.

**Installation:**
```bash
sudo apt-get install ent
# Or: https://www.fourmilab.ch/random/
```

**Usage:**
```bash
# Test a binary file
ent /tmp/trng_test.bin

# Bit-level analysis
ent -b /tmp/trng_test.bin

# CSV output
ent -c /tmp/trng_test.bin
```

**Typical output for a good TRNG:**
```
Entropy = 7.999982 bits per byte.

Optimum compression would reduce the size
of this 10485760 byte file by 0 percent.

Chi square distribution for 10485760 samples is 258.72, and randomly
would exceed this value 40.77 percent of the times.

Arithmetic mean value of data bytes is 127.497 (127.5 = random).
Monte Carlo value for Pi is 3.141528503 (error 0.00 percent).
Serial correlation coefficient is -0.000052 (totally uncorrelated = 0.0).
```

**Interpretation guide:**

| Metric | Ideal value | Acceptable range | Problem if |
|--------|------------|-----------------|-----------|
| **Entropy** (bits/byte) | 8.000000 | > 7.99 | < 7.9 |
| **Chi-square %** | ~50% | 10%–90% | > 99% or < 1% |
| **Arithmetic mean** | 127.5 | 126–129 | > 130 or < 125 |
| **Monte Carlo Pi error** | ~0.00% | < 1% | > 2% |
| **Serial correlation** | 0.000000 | < ±0.01 | > ±0.05 |

**Chi-square interpretation:**
- **1%–99%**: Normal range for random data
- **< 1%** or **> 99%**: Suspect — possible bias or correlation
- **< 0.01%** or **> 99.99%**: Almost certainly non-random

---

### 2.6 PractRand

PractRand (Practically Random) is a modern test suite optimized for **sensitivity per bit** and streaming operation. It starts detecting failures much earlier than TestU01 for many types of RNG defects.

**Installation:**
```bash
git clone https://sourceforge.net/projects/pracrand/
cd PractRand
g++ -std=c++14 -O3 -o RNG_test tools/RNG_test.cpp src/*.cpp -Iinclude
```

**Usage:**
```bash
# Test from file (streaming)
cat /tmp/trng_test.bin | ./RNG_test stdin

# Specify bit width
cat /tmp/trng_test.bin | ./RNG_test stdin32   # for 32-bit generators
cat /tmp/trng_test.bin | ./RNG_test stdin64   # for 64-bit generators

# Set maximum test length
cat /dev/hwrng | ./RNG_test stdin -tlmax 256GB

# Use expanded test set (more sensitive but slower)
cat /dev/hwrng | ./RNG_test stdin -te 1
```

**PractRand evaluation thresholds:**

| p-value (per test) | Evaluation |
|---------------------|------------|
| p ∈ (0.001, 0.999) | Normal |
| p < 0.001 or > 0.999 | **unusual** |
| p < 1e-4 or > 1-1e-4 | **mildly suspicious** |
| p < 1e-7 or > 1-1e-7 | **suspicious** |
| p < 1e-10 or > 1-1e-10 | **very suspicious** |
| p < 1e-14 or > 1-1e-14 | **FAIL !** |

**Expected output for a good TRNG:**
```
RNG_test using PractRand version 0.95
RNG = RNG_stdin, seed = 0x...

length=  128 megabytes (2^27 bytes), time= 2.3 seconds
  no anomalies in 148 test result(s)

length=  256 megabytes (2^28 bytes), time= 4.9 seconds
  no anomalies in 159 test result(s)

length=  512 megabytes (2^29 bytes), time= 9.8 seconds
  no anomalies in 169 test result(s)

length=    1 gigabyte (2^30 bytes), time= 19.2 seconds
  no anomalies in 180 test result(s)
```

A hardware TRNG with proper conditioning should pass PractRand up to the maximum test length with no more than 1–2 "unusual" annotations across the entire run.

---

### 2.7 Typical Hardware RNG Test Results

The following table summarizes published experimental results from peer-reviewed literature on various hardware TRNG technologies:

#### NIST SP 800-22 Pass Rates by TRNG Type

| TRNG Type | Source | SP 800-22 Result | Dieharder | Min-Entropy (90B) | Notes |
|-----------|--------|-----------------|-----------|-------------------|-------|
| **Thermal noise (RTN/CMOS transistor)** | [Nature Sci. Reports 2020] | **All 15 tests PASSED** | All available tests PASSED | Not reported | No post-processing needed; LSTM attack accuracy 49.81% |
| **Thermal noise (OxiGen CMOS oxide breakdown)** | [U. Michigan 2013] | **All 15 tests PASSED** | PASSED | Not reported | 11 kb/s; 2 mW; 1st TRNG to pass all 15 without post-processor |
| **Galvanic skin response (GSR physiological)** | [Sensors 2019] | All 15 tests PASSED | DIEHARD all PASSED | **0.935861** (t-tuple) | Overall min-entropy 0.936; 5 repetitions all passed |
| **Atmospheric noise (ambient sound LSBs)** | [DIVA-portal 2025] | 15/15 PASSED (with 64+ bits/sample) | Not tested | 99.5% of theoretical max | Needed 64 bits/sample; 1 LSB per 16-bit sample |
| **Cosmic ray (UHECR, smartphone CMOS)** | [Entropy 2023 / MRNG] | **6/6 applicable tests PASSED** (MRNG-P124, MRNG-RP124) | Not tested | Not reported | Only 6/15 tests applicable (small sample); ~414 hits in 18 days |
| **Cosmic ray (CMOS image sensor dark noise)** | [Park et al., cited in MRNG 2023] | All SP 800-22 PASSED | Not reported | SP 800-90B PASSED | 2.4 Mb/s; one of best cosmic-ray RNG results |
| **CMB power spectrum** | [Lee & Cleaver, Heliyon 2017] | **No tests run** (theoretical) | Not tested | Not assessed | Argues FIPS 140-2 conformance but provides no empirical test data |
| **Intel RDRAND (thermal noise + CTR_DRBG)** | [Intel DRNG Guide] | Implicitly PASSED (CAVP certified) | PASSED | Full entropy by design | SP 800-90B/C compliant; ~3 Gbps raw; auto-reseeds every 511 samples |
| **Ring oscillator (FPGA-based, hardware TDC)** | [ACM 2025] | All 15 NIST SP 800-22 PASSED | Not tested | Not reported | "Good p-values" reported; FIPS 140-3 target |

#### Cosmic Ray TRNG Detailed Results (MRNG Study)

Source: [Kutschera et al., Entropy 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10297075/)

| Sequence | Method | Bits | 6/6 NIST Tests |
|----------|--------|------|----------------|
| MRNG-P124 | Time + Position + Outlier filter | 12,052 | **PASS** (all 6) |
| MRNG-RP124 | Raw + Time + Position + Outlier filter | 126,363 | **PASS** (all 6) |
| MRNG-P1234 | All features incl. P3 (double hits) | 157,843 | **FAIL** (all 6) |
| MRNG-P123 | Without outlier filter | 153,087 | **FAIL** (all 6) |
| MRNG-RP1234 | Raw + all features | 389,890 | **FAIL** (all 6) |
| MRNG-RP123 | Raw without outlier filter | 361,987 | **FAIL** (all 6) |

**Key finding:** Removing the P3 feature (correlated double-hit timing) was essential for passing NIST tests. Feature selection / post-processing is critical for cosmic-ray TRNGs.

#### GSR-TRNG SP 800-90B Detailed Results

Source: [Picazo-Sanchez et al., Sensors 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6540050/)

| Estimator | Min-Entropy |
|-----------|------------|
| Most Common Value | 0.99876 |
| Collision | 0.966577 |
| Markov | 0.999052 |
| Compression | 1.000000 |
| t-Tuple | **0.935861** ← minimum |
| LRS | 0.965143 |
| MultiMCW Predictor | 0.999605 |
| Lag Predictor | 0.999152 |
| MultiMMC Predictor | 0.998977 |
| LZ78Y Predictor | 0.998780 |
| **Overall (minimum)** | **0.935861** |

#### Comparative Summary: Test Sensitivity

| Suite | Data needed to detect failure | Sensitivity | Best for |
|-------|------------------------------|-------------|---------|
| **ent** | < 1 MB | Low | Quick sanity check |
| **NIST SP 800-22** | ≥ 1 MB (1M bits) | Moderate | Regulatory compliance |
| **Dieharder** | ≥ 10 MB (100+ psamples) | Moderate-High | Wide coverage |
| **TestU01 SmallCrush** | ~46 MB | High | Research validation |
| **TestU01 BigCrush** | ~240 GB | Very high | Reference standard |
| **PractRand** | Streaming to 32 TB | Very high | Streaming / real-time |
| **NIST SP 800-90B** | 1M 8-bit samples | Specialized | Entropy certification |

---

## Validation Pipeline

Recommended workflow for validating a new CMB/cosmic-ray entropy source:

```bash
#!/bin/bash
# Full entropy validation pipeline
# Assumes raw binary data in $TRNG_DEVICE or piped from your acquisition script

TRNG_DEVICE="/dev/hwrng"   # Replace with your device
SAMPLE_FILE="/tmp/trng_raw.bin"
CONDITIONED_FILE="/tmp/trng_conditioned.bin"
LOG_DIR="/tmp/entropy_validation_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"

echo "=== Step 1: Collect raw samples (10 MB) ==="
dd if="$TRNG_DEVICE" of="$SAMPLE_FILE" bs=1M count=10 status=progress

echo "=== Step 2: Quick sanity check with ent ==="
ent "$SAMPLE_FILE" | tee "$LOG_DIR/ent_raw.txt"

echo "=== Step 3: NIST SP 800-90B entropy estimation ==="
python3 SP800-90B_EntropyAssessment/python/non_iid_main.py \
    "$SAMPLE_FILE" 8 1 2>&1 | tee "$LOG_DIR/sp800_90b.txt"

echo "=== Step 4: Apply conditioning (SHA-3 extraction) ==="
python3 - <<'EOF'
import hashlib, sys
inp = open("/tmp/trng_raw.bin", "rb")
out = open("/tmp/trng_conditioned.bin", "wb")
while True:
    block = inp.read(256)
    if len(block) < 256: break
    out.write(hashlib.sha3_256(block).digest())
inp.close(); out.close()
print(f"Conditioned: {open('/tmp/trng_conditioned.bin','rb').seek(0,2)} bytes")
EOF

echo "=== Step 5: ent on conditioned output ==="
ent "$CONDITIONED_FILE" | tee "$LOG_DIR/ent_conditioned.txt"

echo "=== Step 6: NIST SP 800-22 (full 15 tests) ==="
# Generate 10 MB for assessment
dd if="$CONDITIONED_FILE" of=/tmp/sp800_22_input.bin bs=1M count=10
cd sts-2.1.2 && ./assess 1000000 2>&1 | tee "$LOG_DIR/sp800_22.txt"

echo "=== Step 7: Dieharder full battery ==="
dieharder -a -g 201 -f "$CONDITIONED_FILE" -p 100 2>&1 | tee "$LOG_DIR/dieharder.txt"

echo "=== Step 8: PractRand streaming ==="
cat "$CONDITIONED_FILE" | ./RNG_test stdin -tlmax 256MB 2>&1 | tee "$LOG_DIR/practrand.txt"

echo "=== Step 9: TestU01 SmallCrush ==="
./testu01_test "$CONDITIONED_FILE" 2>&1 | tee "$LOG_DIR/testu01_smallcrush.txt"

echo "=== Validation complete. Results in $LOG_DIR ==="
```

---

## Security Considerations

1. **Never rely on a single entropy source.** XOR outputs from multiple independent sources; the result has entropy equal to the maximum of any single source.

2. **Apply conditioning before use.** Raw hardware entropy typically has bias. Use SHA-3, AES-CBC-MAC, or HMAC conditioning to produce near-uniform output. A 2:1 compression ratio (256 bytes raw → 128 bytes conditioned) is the NIST SP 800-90B minimum.

3. **CMB-specific concerns:**
   - Ground-based CMB detectors have low signal-to-noise ratio. The dominant noise source is receiver thermal noise (50–100 K system temperature), not the 2.7 K CMB. This is still valid true randomness but is not the cosmological source.
   - An adversary with knowledge of your telescope pointing, frequency, time, and binning parameters could theoretically replicate your CMB observation.
   - The [Lee & Cleaver 2017 paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC5639047/) argues CMB can conform to FIPS 140-2 but provides no empirical test results; treat this as theoretical.

4. **Cosmic-ray-specific concerns:**
   - Detection rates are very low (~414 clean events in 18 days over 8 smartphone sensors in the [MRNG study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10297075/)). This is insufficient for cryptographic key generation at scale without hybrid seeding.
   - Feature selection matters critically: including correlated double-hit timing (P3 feature) caused all NIST 800-22 tests to fail.
   - **Recommended approach:** Use cosmic-ray events as entropy seeds for a HMAC_DRBG that generates bulk randomness.

5. **Thermal noise TRNGs** (from ADCs, ring oscillators, Johnson-Nyquist noise) are the most studied and consistently pass all NIST tests without post-processing, as evidenced by the [2020 Nature paper](https://www.nature.com/articles/s41598-020-74351-y) and Intel RDRAND design.

6. **FIPS 140-3 / SP 800-90B certification:** For production systems requiring FIPS certification, the entropy source must go through formal validation at an accredited testing laboratory. The SP 800-90B toolkit provides the algorithms but not the certification.

7. **Reseed limits:** NIST DRBG mechanisms require reseeding before the reseed counter limit (10,000 for HMAC_DRBG, 2^48 for CTR_DRBG). Always implement a reseeding schedule.

8. **Forward/backward secrecy:** After generating key material, overwrite DRBG state to prevent past output recovery if state is compromised (fast key-erasure RNG pattern).

---

## References

1. **NIST SP 800-22 Rev 1a**: "A Statistical Test Suite for Random and Pseudorandom Number Generators for Cryptographic Applications" (April 2010). https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final

2. **NIST SP 800-90A Rev 1**: "Recommendation for Random Number Generation Using Deterministic Random Bit Generators" (June 2015). https://csrc.nist.gov/publications/detail/sp/800-90a/rev-1/final

3. **NIST SP 800-90B**: "Recommendation for the Entropy Sources Used for Random Bit Generation" (January 2018). https://csrc.nist.gov/publications/detail/sp/800-90b/final

4. **liboqs (Open Quantum Safe)**: https://openquantumsafe.org/liboqs/ and https://github.com/open-quantum-safe/liboqs

5. **OpenSSL RAND_add documentation**: https://docs.openssl.org/3.1/man3/RAND_add/

6. **OpenSSL Random Numbers wiki**: https://wiki.openssl.org/index.php/Random_Numbers

7. **Intel DRNG Software Implementation Guide**: https://www.intel.com/content/www/us/en/developer/articles/guide/intel-digital-random-number-generator-drng-software-implementation-guide.html

8. **Kutschera et al. (2023)**: "MRNG: Accessing Cosmic Radiation as an Entropy Source for a Mobile Random Number Generator." *Entropy* 25(6):888. https://pmc.ncbi.nlm.nih.gov/articles/PMC10297075/

9. **Lee & Cleaver (2017)**: "The cosmic microwave background radiation power spectrum as a random bit generator." *Heliyon* 3(10). https://pmc.ncbi.nlm.nih.gov/articles/PMC5639047/

10. **Picazo-Sanchez et al. (2019)**: "Design and Analysis of a True Random Number Generator Based on GSR Signals." *Sensors* 19(9):2032. https://pmc.ncbi.nlm.nih.gov/articles/PMC6540050/

11. **Al Shibli et al. (2020)**: "Random-telegraph-noise-enabled true random number generator." *Scientific Reports* 10:17534. https://www.nature.com/articles/s41598-020-74351-y

12. **Linux rng-tools / rngd**: https://github.com/nhorman/rng-tools

13. **HAVEGE / haveged**: https://github.com/jirka-h/haveged

14. **Dieharder**: https://webhome.phy.duke.edu/~rgb/General/dieharder.php

15. **TestU01**: http://simul.iro.umontreal.ca/testu01/tu01.html

16. **PractRand**: https://sourceforge.net/projects/pracrand/

17. **Fourmilab ent**: https://www.fourmilab.ch/random/

18. **ArchWiki rng-tools**: https://wiki.archlinux.org/title/Rng-tools

19. **PQShield entropy source lecture**: https://mjos.fi/doc/20211006-wpi-saarinen-entropy.pdf

20. **NIST SP 800-90B Entropy Assessment tool**: https://github.com/usnistgov/SP800-90B_EntropyAssessment
