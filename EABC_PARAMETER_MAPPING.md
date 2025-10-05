# EABC to Ace Studio Parameter Mapping

## Overview
Ace Studio has **6 core vocal parameters** that control AI vocal synthesis. EABC notation provides 35+ parameters, but only a subset can be directly mapped to Ace Studio's internal format.

## ✅ Directly Mappable Parameters

### 1. **Tension** (Range: 0.5-1.5, Default: 1.0)
Maps from EABC parameters:
- `{ten:value}` - Direct tension control (0-100 → 0.5-1.5)
- `{wt:value}` - Vocal weight (0-100 → 0.5-1.5) 
- `{intense:value}` - Emotional intensity (0-100 → 0.5-1.5)

**Mapping Formula**: `tension = 0.5 + (value / 100) * 1.0`

**Example**:
```abc
{ten:80}C4  → tension: 1.3
{wt:60}D4   → tension: 1.1
```

---

### 2. **Breathiness** (Range: 0-2.0, Default: 0)
Maps from EABC parameters:
- `{br:value}` - Direct breathiness control (0-100 → 0-2.0)
- `{air:value}` - Aspiration/air noise (0-100 → 0-2.0)

**Mapping Formula**: `breathiness = (value / 100) * 2.0`

**Example**:
```abc
{br:50}E4   → breathiness: 1.0
{air:75}F4  → breathiness: 1.5
```

---

### 3. **Energy** (Range: 0.5-1.5, Default: 1.0)
Maps from EABC parameters:
- `{dyn:marking}` - Dynamic markings (pp/p/mp/mf/f/ff → 0.5-1.5)
- `{eff:value}` - Vocal effort (0-100 → 0.5-1.5)

**Mapping Table**:
| Dynamic | Value |
|---------|-------|
| pp      | 0.5   |
| p       | 0.7   |
| mp      | 0.85  |
| mf      | 1.0   |
| f       | 1.2   |
| ff      | 1.4   |
| fff     | 1.5   |

**Example**:
```abc
{dyn:ff}G4  → energy: 1.4
{eff:90}A4  → energy: 1.4
```

---

### 4. **Falsetto** (Range: 0-1.0, Default: 0)
Maps from EABC parameter:
- `{reg:type,blend}` - Register control

**Mapping Rules**:
- `{reg:chest}` → falsetto: 0.0
- `{reg:head}` → falsetto: 0.8
- `{reg:falsetto}` → falsetto: 1.0
- `{reg:whistle}` → falsetto: 1.0
- `{reg:mixed,60}` → falsetto: 0.6 (uses blend percentage)

**Example**:
```abc
{reg:falsetto}C5     → falsetto: 1.0
{reg:mixed,70}A4     → falsetto: 0.7
```

---

### 5. **Gender** (Range: 0.5-1.5, Default: 1.0)
Maps from EABC parameters:
- `{gen:value}` - Gender parameter (-100 to +100 → 0.5-1.5)
- `{fmt:value}` - Formant shift (-100 to +100 → 0.5-1.5)
- `{age:value}` - Vocal age (0-100 → 0.5-1.5, remapped from -100 to +100)

**Mapping Formula**: `gender = 0.5 + ((value + 100) / 200) * 1.0`

**Example**:
```abc
{gen:60}B4   → gender: 1.3
{gen:-40}E3  → gender: 0.8
{fmt:20}D4   → gender: 1.1
```

---

### 6. **PitchDelta** (Range: -200 to +200 cents, Default: 0)
Maps from EABC parameters:
- `{bend:cents,duration}` - Pitch bend
- `{scoop:cents,duration,direction}` - Scooping into note
- `{fall:cents,duration,curve}` - Fall off at end
- `{glide:time}` - Portamento between notes

**Note**: These parameters extract the cents value only. Duration/timing is simplified in the current implementation.

**Example**:
```abc
{bend:50}C4      → pitchDelta: 50
{scoop:100}D4    → pitchDelta: 100
{fall:150}E4     → pitchDelta: 150
```

---

## ✅ Expression Presets (Override Multiple Parameters)

EABC `{expr:type}` maps to combined parameter adjustments:

| Expression | Tension | Breathiness | Energy |
|------------|---------|-------------|--------|
| smile      | 0.8     | -           | 1.2    |
| cry        | 1.3     | 0.8         | -      |
| angry      | 1.4     | -           | 1.4    |
| breathy    | 0.7     | 1.5         | -      |
| belt       | 1.3     | -           | 1.5    |

**Example**:
```abc
{expr:smile}C D E F  → tension: 0.8, energy: 1.2
{expr:belt}G A B c   → tension: 1.3, energy: 1.5
```

---

## ✅ Vibrato (Special Complex Mapping)

EABC `{vib:depth,rate,delay,attack,release}` maps to Ace Studio's full vibrato object:

```json
{
  "vibrato": {
    "depth": 0.7,      // depth/100 (0-1.0)
    "rate": 4.5,       // rate/10 (Hz, typically 4-7)
    "attack": 20,      // delay (0-100)
    "release": 100     // release (0-100)
  }
}
```

**Example**:
```abc
{vib:70,45,20}A4  → depth: 0.7, rate: 4.5, attack: 20, release: 100
```

---

## ❌ Non-Mappable Parameters

The following EABC parameters **cannot be directly converted** to Ace Studio's 6 core parameters. They are either too granular, require additional synthesis features, or are not supported:

### Acoustic/Physical Parameters
- ❌ `{fry:value,position}` - Vocal fry/creak
- ❌ `{growl:value}` - Vocal distortion
- ❌ `{sub:value}` - Subharmonics
- ❌ `{harm:freq,gain}` - Harmonic emphasis
- ❌ `{shim:value}` - Vocal shimmer
- ❌ `{vibjit:value}` - Vibrato jitter
- ❌ `{vibmod:type,intensity}` - Vibrato modulation

### Articulatory Parameters
- ❌ `{tng:forward,height}` - Tongue position
- ❌ `{jaw:value}` - Jaw opening
- ❌ `{lip:value}` - Lip rounding
- ❌ `{res:value}` - Resonance/nasality
- ❌ `{width:value}` - Vocal width
- ❌ `{bright:value}` - Brightness (partial overlap with fmt/gender)

### Temporal Parameters
- ❌ `{env:attack,decay,sustain,release}` - ADSR envelope
- ❌ `{onset:type,intensity}` - Vocal onset type
- ❌ `{offset:type,duration}` - Vocal offset type
- ❌ `{swing:value}` - Micro-timing
- ❌ `{ph:phoneme,timing}` - Phoneme timing

### Processing Parameters
- ❌ `{comp:ratio,threshold}` - Vocal compression
- ❌ `{riff:notes,duration}` - Vocal runs

**Why can't these map?**
1. Ace Studio's synthesis engine only exposes 6 parameters
2. These effects would require DSP post-processing
3. Some (like tongue/jaw) are articulatory models not in Ace Studio
4. Others (like fry, growl) need specialized synthesis techniques

---

## 🔄 Workarounds & Approximations

Some non-mappable parameters can be **approximated** using the 6 core parameters:

### Brightness → Gender + Formant
```abc
{bright:80}E4  
→ Approximate with: {gen:50}E4 (raises formants)
```

### Vocal Width → Tension + Breathiness
```abc
{width:30}A4  (narrow/focused)
→ Approximate with: {ten:70}{br:10}A4
```

### Attack/Envelope → (Not possible in Ace Studio core params)
Would require external MIDI CC automation or DAW envelope

---

## 📊 Summary Table

| Category | EABC Parameters | Ace Studio Parameter | Mappable? |
|----------|-----------------|----------------------|-----------|
| Tension/Strain | ten, wt, intense | tension | ✅ Yes |
| Breathiness | br, air | breathiness | ✅ Yes |
| Dynamics | dyn, eff | energy | ✅ Yes |
| Register | reg | falsetto | ✅ Yes |
| Timbre | gen, fmt, age | gender | ✅ Yes |
| Pitch | bend, scoop, fall, glide | pitchDelta | ✅ Yes |
| Vibrato | vib, vibjit, vibmod | vibrato object | ✅ Partial |
| Distortion | fry, growl, sub, harm | - | ❌ No |
| Articulation | tng, jaw, lip, res, width, bright | - | ❌ No |
| Envelope | env, onset, offset, swing | - | ❌ No |
| Phonetics | ph | - | ❌ No |
| Processing | comp, riff | - | ❌ No |

---

## 🎵 Complete Example

```abc
X:1
T:EABC Mapping Demo
M:4/4
L:1/4
Q:1/4=120
K:C

% Verse - uses all 6 core parameters
w: A - ma - zing grace
{dyn:mf}{ten:60}{br:20}C D {reg:chest}E {gen:0}F|

% Chorus - falsetto with vibrato
w: How sweet the sound
{reg:falsetto}{vib:70,45,20}{dyn:f}G2 A2|

% Bridge - expression preset + pitch bend
w: That saved a wretch
{expr:belt}{bend:50}B2 {dyn:ff}c2|

% Unmappable parameters (will be ignored)
{fry:50}{growl:30}{jaw:80}d2 e2|  % Only notes are processed
```

**Output**: Only tension, breathiness, energy, falsetto, gender, pitchDelta, and vibrato are converted to Ace Studio format. Other parameters are ignored.

---

## 🔧 Implementation Notes

1. **Parameter Precedence**: Expression presets override individual parameters
2. **Range Clamping**: All values are clamped to valid Ace Studio ranges
3. **Default Values**: Missing parameters use Ace Studio defaults
4. **Vibrato Handling**: Vibrato is stored per-note, not in the global parameters array
5. **Future Extensions**: Consider adding post-processing for unmappable parameters

---

## 🚀 Usage in Code

```javascript
// EABC input
const eabc = `
{ten:80}{br:50}{dyn:ff}C4
`;

// Converts to Ace Studio note:
{
  pitch: 60,
  tension: 1.3,        // from {ten:80}
  breathiness: 1.0,    // from {br:50}
  energy: 1.4,         // from {dyn:ff}
  falsetto: 0.0,       // default
  gender: 1.0,         // default
  pitchDelta: 0        // default
}
```

---

**Last Updated**: 2025-10-05
**Version**: 1.0