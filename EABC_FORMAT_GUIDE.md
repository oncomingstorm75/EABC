# EABC Format Guide for Ace Studio Conversion

## 🎯 Quick Start: Best Practices

### ✅ **DO THIS** - Recommended Format

```abc
X:1
T:Song Title
C:Composer Name
M:4/4
L:1/4
Q:1/4=120
K:C

% Comments start with %

% Lyrics go on the line BEFORE the notes
w: Hel-lo world how are you
{dyn:mf}{vib:50,40,20}C D E F G |

% Or lyrics can go AFTER the notes
C D E F G |
w: Hel-lo world how are you

% Parameters in curly braces, notes, then bar lines
{ten:80}{br:30}{dyn:f}D E F G A |

% Pitch bends apply to the NEXT note only
{scoop:100}C D {bend:50}E F |  % C gets scoop, E gets bend

% Melisma (one syllable across multiple notes)
w: Hel-lo _ _ world
C D E F G |  % "lo" holds across D, E, F
```

---

## 📋 Complete Format Rules

### 1. **Metadata Section** (Required at top)

```abc
X:1                  % Tune number (required by ABC standard)
T:Your Song Title    % Title
C:Composer Name      % Composer (optional)
M:4/4                % Time signature (4/4, 3/4, etc.)
L:1/4                % Default note length (1/4 = quarter note)
Q:1/4=120            % Tempo (quarter note = 120 BPM)
K:C                  % Key signature (C, D, Em, F#m, etc.)
```

**Order matters!** Put metadata at the very top, in this order.

---

### 2. **Lyric Format** (Choose ONE style per song)

#### **Style A: Pre-line Lyrics** (Recommended ✅)

Lyrics come **BEFORE** the note line:

```abc
w: Hel-lo world how are you
C D E F G |
```

**Rules**:
- Start with `w:` (with or without quotes: `w:` or `"w:` both work)
- **Use hyphens** to split syllables: `trea-sure` = 2 syllables
- Spaces also separate syllables
- One syllable per note (or use `_` for melisma)
- No quotes around individual syllables

#### **Style B: Post-line Lyrics**

Lyrics come **AFTER** the note line:

```abc
C D E F G |
w: Hel - lo world how are you
```

#### **Style C: Inline Lyrics** (Advanced)

Put lyrics directly on notes:

```abc
C"Hel" D"lo" E"world" F"how" G"are" |
```

**⚠️ Important**: Don't mix `w:` lines with inline `"lyric"` quotes on the same notes!

---

#### **NEW: Melisma Support** ✨

Use `_` (underscore) or `~` (tilde) to hold a syllable across multiple notes:

```abc
w: Hel-lo _ _ world
C D E F G |
```

**Result:**
- C → "Hel"
- D → "lo"
- E → "lo" (melisma - holds "lo")
- F → "lo" (melisma - holds "lo")
- G → "world"

See [`MELISMA_GUIDE.md`](MELISMA_GUIDE.md) for complete details!

---

### 3. **Parameter Format**

Parameters go in `{curly braces}` BEFORE the notes they affect:

```abc
% Single parameter
{dyn:f}C D E F |

% Multiple parameters (stack them at line start)
{ten:80}{br:50}{dyn:ff}G A B c |

% Parameters on SEPARATE line (before notes)
{gen:-20}{dyn:mf}{ten:40}
w: Sleep now my treasure
D E F E |

% Most parameters PERSIST until changed
{dyn:mf}C D E F | G A B c |  % All notes are mf
{dyn:f}d e f g |                % These are f

% EXCEPTION: Pitch bends apply to ONE note only
{scoop:100}C D {bend:50}E F |
% C gets scoop:100, then cleared
% D gets nothing (0)
% E gets bend:50, then cleared
% F gets nothing (0)
```

---

### 4. **Note Format**

```abc
% Basic notes
C D E F G A B c d e f g

% Octaves
C,  % Low C (octave below middle C)
C   % Middle C
c   % High C (octave above middle C)
c'  % Higher C (add ' for each octave up)
C,, % Very low C (add , for each octave down)

% Durations
C2  % Double length (half note if L:1/4)
C/2 % Half length (eighth note if L:1/4)
C3  % Triple length
C4  % Quadruple length

% Accidentals
^C  % C sharp
_C  % C flat
=C  % C natural

% Rests
z   % Rest (same length as default L:)
z2  % Double-length rest
z4  % Whole rest

% Bar lines
|   % Regular bar line
||  % Double bar line (end of section)
```

---

### 5. **Supported Parameters** (Map to Ace Studio)

Only use these parameters - they convert to Ace Studio's 6 core parameters:

```abc
% TENSION (0-100 → 0.5-1.5)
{ten:80}        % Direct tension
{wt:80}         % Vocal weight (maps to tension)
{intense:80}    % Intensity (maps to tension)

% BREATHINESS (0-100 → 0-2.0)
{br:50}         % Breathiness
{air:50}        % Aspiration (maps to breathiness)

% ENERGY (dynamics or 0-100 → 0.5-1.5)
{dyn:pp}        % Pianissimo (very soft)
{dyn:p}         % Piano (soft)
{dyn:mp}        % Mezzo-piano
{dyn:mf}        % Mezzo-forte (medium)
{dyn:f}         % Forte (loud)
{dyn:ff}        % Fortissimo (very loud)
{eff:90}        % Effort (maps to energy)

% FALSETTO (0-1.0)
{reg:chest}     % Chest voice (falsetto: 0)
{reg:head}      % Head voice (falsetto: 0.8)
{reg:falsetto}  % Falsetto (falsetto: 1.0)
{reg:mixed,60}  % Mixed voice, 60% head (falsetto: 0.6)

% GENDER (-100 to +100 → 0.5-1.5)
{gen:-40}       % Masculine (-100 to +100)
{gen:30}        % Feminine
{fmt:20}        % Formant shift (maps to gender)
{age:25}        % Vocal age (maps to gender)

% PITCH DELTA (-200 to +200 cents) - PER-NOTE ONLY!
{bend:50}       % Pitch bend up 50 cents (applies to next note only)
{scoop:100}     % Scoop up to note (per-note)
{fall:150}      % Fall off at end (per-note)
{glide:40}      % Portamento/glide (per-note)

% IMPORTANT: Pitch bends clear after each note!
{scoop:100}C D E  → Only C has scoop, D and E have pitchDelta:0

% VIBRATO
{vib:70,45,20}  % depth:70, rate:45Hz, delay:20%

% EXPRESSION PRESETS
{expr:smile}    % Happy (tension:0.8, energy:1.2)
{expr:cry}      % Sad (tension:1.3, breathiness:0.8)
{expr:angry}    % Angry (tension:1.4, energy:1.4)
{expr:breathy}  % Breathy (tension:0.7, breathiness:1.5)
{expr:belt}     % Belting (tension:1.3, energy:1.5)
```

---

## ❌ **DON'T DO THIS** - Common Mistakes

### ❌ Mistake 1: Mixing Lyric Styles

```abc
% DON'T MIX w: lines and inline quotes!
w: Hel - lo world      ❌
C"Hel" D"lo" E"world"  ❌
```

**Fix**: Choose ONE style - either `w:` OR inline quotes.

### ❌ Mistake 2: Quotes Around w: Lines (Now Fixed!)

```abc
"w:Hello world"  % Now works! ✅ (just fixed)
```

This used to break, but now it works!

### ❌ Mistake 3: Parameters After Notes

```abc
C D E F{dyn:f}  ❌ Wrong! Parameters after notes don't work
```

**Fix**: Put parameters BEFORE notes:
```abc
{dyn:f}C D E F  ✅ Correct!
```

### ❌ Mistake 4: Unsupported Parameters

```abc
{fry:50}        ❌ Not supported (can't map to Ace Studio)
{growl:80}      ❌ Not supported
{jaw:70}        ❌ Not supported
{ph:k,20|æ,80}  ❌ Not supported
```

**Fix**: Only use the 6 core parameter families (see list above).

### ❌ Mistake 5: Mismatched Syllable Count

```abc
w: Hel - lo world how are        % 5 syllables
C D E F G A B c |                % 8 notes
```

**Result**: First 5 notes get lyrics, last 3 are empty.

**Fix**: Make sure syllable count matches note count!

---

## 📝 **Perfect Example Template**

Copy this template for your songs:

```abc
X:1
T:My Song Title
C:Composer Name
M:4/4
L:1/4
Q:1/4=120
K:C

% === VERSE 1 ===
% Tenor voice, medium-forte
{voice:tenor}{gen:-20}{dyn:mf}{ten:40}
w: One per - fect morn - ing sun in the sky
D2 F2 | A2 d2 | c2 B2 | A4 |

w: See how it shines in your beau - ti - ful eye
d2 c2 | B2 A2 | G2 F2 | E4 |

% === CHORUS ===
% Louder with vibrato
{dyn:f}{vib:60,45,20}
w: THIS IS THE CHO - RUS SING - ING LOUD
F2 A2 | d2 f2 | e2 d2 | c4 |

% === BRIDGE ===
% Soft and breathy
{dyn:p}{br:50}{expr:breathy}
w: Soft - ly now whis - per - ing
D2 E2 | F2 G2 | A2 G2 | F4 |
```

---

## 🔍 **Debugging Tips**

### Problem: "No lyrics appearing"

**Check**:
1. ✅ Do your `w:` lines come **directly** before or after note lines?
2. ✅ Is there an empty line between `w:` and notes? (Remove it!)
3. ✅ Are syllables separated by spaces or hyphens?
4. ✅ Does syllable count match note count?

### Problem: "Some lyrics missing"

**Common causes**:
- More notes than syllables → Last notes get no lyrics
- Rest notes (`z`) don't get lyrics
- Chords (`[CEG]`) are skipped by parser

**Solution**: Count your syllables and notes carefully!

### Problem: "Parameters not working"

**Check**:
1. ✅ Are parameters in `{curly braces}`?
2. ✅ Are they BEFORE the notes they affect?
3. ✅ Are you using supported parameter names?
4. ✅ Check spelling: `{dyn:f}` not `{dyn: f}` (no spaces!)

---

## 📐 **Format Checklist**

Before converting, verify:

- [ ] Metadata at top (X:, T:, M:, L:, Q:, K:)
- [ ] Comments start with `%`
- [ ] Lyrics use `w:` (with or without quotes)
- [ ] Lyrics are directly before or after note lines
- [ ] Syllable count matches note count
- [ ] Parameters in `{braces}` before notes
- [ ] Only using supported parameters (see list above)
- [ ] Notes separated by spaces
- [ ] Bar lines `|` at end of measures
- [ ] No mixing of inline and w: lyrics

---

## 🎵 **Working Example - Your Song Format**

Here's how to format "One Perfect Day" correctly:

```abc
X:1
T:One Perfect Day - Vocals Only
C:Musical Drama Prologue
M:4/4
L:1/4
Q:1/4=72
K:D

% === INTRO - Rests ===
z8 | z8 |

% === VERSE 1 - Tenor ===
{gen:-20}{dyn:mf}{ten:40}
w: One per - fect morn - ing sun in the sky
D2 F2 | A2 d2 | c2 B2 | A4 |

w: See how it shines in your beau - ti - ful eye
d2 c2 | B2 A2 | G2 F2 | E4 |

w: All of our wait - ing all of our prayer
F2 A2 | d2 f2 | e2 d2 | c4 |

w: Fi - nal - ly ans - wered a life we can share
{dyn:f}{vib:50,40,20}d2 e2 | f2 e2 | d2 c2 | d4 |

% === VERSE 2 - Mezzo ===
{gen:30}{dyn:mf}{br:30}
w: One per - fect eve - ning stars in a row
D2 F2 | A2 B2 | c2 d2 | e4 |

w: Guid - ing us down a new path we will go
{vib:40,35,10}d2 c2 | B2 A2 | G2 F2 | G4 |

% === CHORUS - Duet ===
{dyn:f}{vib:55,42,15}
w: ONE PER - FECT MO - MENT ONE PER - FECT VOW
D2 F2 | A2 B2 | c2 d2 | e2 f2 |

w: OUR LIFE BE - GINS START - ING RIGHT HERE AND NOW
{dyn:ff}g2 f2 | e2 d2 | A2 G2 | F2 E2 |
```

**Key points**:
- ✅ No quotes around `w:` lines (or if you use quotes, that's fine too now)
- ✅ One `w:` line per measure group
- ✅ Syllables match note count
- ✅ Parameters before notes
- ✅ Clear sections with comments

---

## 🚫 **What the Parser IGNORES**

These won't cause errors, but they're not converted:

```abc
% Ignored parameters (not in Ace Studio's 6 core params)
{voice:soprano}           % Ignored - use voice selection in Ace Studio
{art:spoken}              % Ignored - no spoken mode
{fry:50}                  % Ignored - not mappable
{growl:80}                % Ignored - not mappable
{jaw:70}                  % Ignored - not mappable
{ph:k,20|æ,80}            % Ignored - phoneme timing not supported

% Chord notation (skipped by parser)
[CEG]                     % Chords are skipped - use single notes only
```

---

## 📊 **Syllable-to-Note Matching**

The parser matches syllables to notes in order:

```abc
w: A - ma - zing grace how sweet
C   D   E    F     G    A   B

Syllable 1 "A"      → Note C
Syllable 2 "ma"     → Note D  
Syllable 3 zing"    → Note E
Syllable 4 "grace"  → Note F
Syllable 5 "how"    → Note G
Syllable 6 "sweet"  → Note A
(No syllable)       → Note B (empty lyric)
```

**Tips**:
- Use `-` in `w:` lines to separate syllables: `A - ma - zing`
- Spaces also separate syllables: `A ma zing`
- Extra notes get no lyrics
- Missing syllables leave notes empty

---

## 🎼 **Multi-measure Songs**

For longer songs, group measures logically:

```abc
% === VERSE 1 ===
w: First line of ly - rics here
{dyn:mf}C D E F | G A B c |

w: Se - cond line con - tin - ues
d c B A | G F E D |

% === CHORUS ===
w: CHO - RUS GETS LOUD - ER NOW
{dyn:f}{vib:60,45,20}E F G A | B c d e |

% === BRIDGE ===
w: Bridge is soft - er and slow
{dyn:p}{br:40}Q:1/4=90
D E F G | A B c d |
```

**Rules**:
- ✅ One `w:` line per measure group (before bar lines)
- ✅ Count notes carefully including rests
- ✅ Keep related lyrics together

---

## 🔧 **Your Specific Issue**

Based on your output (all empty lyrics), here's what's likely wrong:

### **Original Format** (Not Working):
```abc
"w:One per-fect morn-ing, sun in the sky"
D2 F2 | A2 d2 | c2 B2 | A4 |
```

### **Problem**:
The parser sees `"w:One per-fect morn-ing, sun in the sky"` as a string on the note line, NOT as a lyric line.

### **Fixed Format #1** (Remove quotes):
```abc
w: One per - fect morn - ing sun in the sky
D2 F2 | A2 d2 | c2 B2 | A4 |
```

### **Fixed Format #2** (Separate line):
```abc
w: One per - fect morn - ing sun in the sky
{dyn:mf}{ten:40}D2 F2 | A2 d2 | c2 B2 | A4 |
```

---

## 🎯 **Recommended Workflow**

### Step 1: Write Your Metadata
```abc
X:1
T:Song Title
M:4/4
L:1/4
Q:1/4=120
K:C
```

### Step 2: Write Notes First (No Lyrics)
```abc
C D E F | G A B c |
d c B A | G F E D |
```

### Step 3: Count Notes Per Line
```
Line 1: C D E F | G A B c | = 8 notes
Line 2: d c B A | G F E D | = 8 notes
```

### Step 4: Add Lyrics (Match Count!)
```abc
w: One per - fect morn - ing sun in the sky
C D E F | G A B c |

w: See how it shines in your beau - ti - ful eye
d c B A | G F E D |
```

### Step 5: Add Parameters
```abc
{dyn:mf}{ten:40}
w: One per - fect morn - ing sun in the sky
C D E F | G A B c |

{dyn:f}{vib:60,45,20}
w: See how it shines in your beau - ti - ful eye
d c B A | G F E D |
```

---

## 📱 **Complete Working Example**

```abc
X:1
T:Amazing Grace
C:John Newton
M:3/4
L:1/4
Q:1/4=90
K:G

% Verse 1
{dyn:mf}{vib:50,40,20}
w: A - ma - zing grace how sweet the sound
G2 B | d2 B | d2 e | d2 B |

w: That saved a wretch like me
G2 A | B2 G | E2 D | G2 z |

% Verse 2
{dyn:p}{ten:70}
w: I once was lost but now am found
G2 B | d2 B | d2 e | d2 B |

w: Was blind but now I see
{dyn:f}{vib:60,45,15}G2 A | B2 G | E2 D | G2 z |
```

**This format works perfectly!** ✅

---

## 🐛 **Common Errors & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| No lyrics appear | Lyrics not on separate line | Put `w:` on its own line |
| Wrong syllables | Count mismatch | Count notes vs syllables |
| Parameters ignored | After notes | Move `{params}` before notes |
| Notes not parsing | Missing bar lines | Add `|` at measure ends |
| Key signature wrong | Missing `K:` | Add `K:C` (or correct key) |
| Tempo wrong | Missing `Q:` | Add `Q:1/4=120` |

---

## 🎨 **Style Recommendations**

### For Maximum Compatibility:

1. **Use `w:` lines without quotes** (simpler)
2. **Put parameters at start of line** (easier to read)
3. **One lyric line per measure or phrase**
4. **Comments for sections** (`% VERSE`, `% CHORUS`)
5. **Consistent formatting** (align bar lines)

### Example (Beautiful Format):
```abc
X:1
T:My Perfect Song
M:4/4
L:1/4
Q:1/4=120
K:C

% =============================
% VERSE 1 - Gentle and Loving
% =============================
{gen:-20}{dyn:mf}{expr:gentle}
w: One per - fect morn - ing sun in the sky
D2 F2 | A2 d2 | c2 B2 | A4 |

w: See how it shines in your beau - ti - ful eye  
d2 c2 | B2 A2 | G2 F2 | E4 |

% =============================
% CHORUS - Powerful and Soaring
% =============================
{dyn:ff}{vib:70,50,20}{expr:belt}
w: THIS IS MY CHO - RUS LOUD AND CLEAR
F2 A2 | d2 f2 | e2 d2 | c4 |

w: WITH ALL MY HEART I SING IT HERE
{dyn:fff}d2 e2 | f2 g2 | a2 g2 | f4 |
```

---

## 🎤 **Voice-Specific Tips**

Different voice types often need different parameters:

### Soprano (High Female)
```abc
{gen:40}{reg:head}{dyn:mf}
w: So - pra - no sings high and clear
c'2 d'2 | e'2 f'2 | g'2 f'2 | e'4 |
```

### Tenor (High Male)
```abc
{gen:-20}{reg:chest}{dyn:f}
w: Te - nor voice strong and bright
G2 A2 | B2 c2 | d2 c2 | B4 |
```

### Bass (Low Male)
```abc
{gen:-50}{dyn:mf}{ten:60}
w: Bass voice deep and low
D,2 E,2 | F,2 G,2 | A,2 G,2 | F,4 |
```

---

## 💾 **Save Your File**

1. **Use `.abc` or `.txt` extension**: `mysong.abc` or `mysong.txt`
2. **Use UTF-8 encoding** (most text editors default to this)
3. **Save with Unix line endings** (LF, not CRLF) if possible
4. **No BOM** (Byte Order Mark)

---

## ✅ **Final Checklist Before Conversion**

- [ ] Metadata complete (X, T, M, L, Q, K)
- [ ] All `w:` lines on separate lines (not mixed with notes)
- [ ] Syllables separated by spaces or hyphens
- [ ] Syllable count matches note count
- [ ] Parameters before notes
- [ ] Only supported parameters used
- [ ] Bar lines `|` at end of measures
- [ ] Comments use `%`
- [ ] File saved as `.abc` or `.txt`

---

## 🚀 **Ready to Convert!**

Once your EABC file follows this format:

1. **Open the web app**
2. **Copy your entire EABC file**
3. **Paste into left box**
4. **Click "Convert to Ace Studio"** (purple button)
5. **Click "Download .acep (for Ace Studio)"** (green button)
6. **Import into Ace Studio**

Your lyrics, notes, and parameters will all work! 🎵

---

**Questions?** Check these docs:
- `EABC_PARAMETER_MAPPING.md` - Full parameter reference
- `IMPLEMENTATION_NOTES.md` - Technical details
- `EABC_FIXES_SUMMARY.md` - What's supported vs. not

**Last Updated**: 2025-10-05  
**Version**: 1.1