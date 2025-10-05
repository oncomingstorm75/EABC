# Melisma Support in EABC

## 🎵 What is Melisma?

**Melisma** is when a single syllable is sung across multiple notes. For example:
- "Halle-lu-jah" where "jah" is sung over 5 notes: `C D E F G`

---

## ✅ **How to Use Melisma in EABC**

### **Syntax: Use Underscore `_`**

```abc
w: Hel lo _ _ world
C D E F G |
```

**Result:**
- Note 1 (C) → "Hel"
- Note 2 (D) → "lo"
- Note 3 (E) → "lo" (melisma - repeats previous syllable)
- Note 4 (F) → "lo" (melisma - repeats previous syllable)
- Note 5 (G) → "world"

---

## 📝 **Complete Examples**

### **Example 1: Simple Melisma**

```abc
X:1
T:Melisma Test
M:4/4
L:1/4
Q:1/4=120
K:C

% "Day" sung over 3 notes
w: What a beau ti ful _ _ day
C D E F G A B c |
```

**Output:**
```
C → "What"
D → "a"
E → "beau"
F → "ti"
G → "ful"
A → "ful" (melisma)
B → "ful" (melisma)
c → "day"
```

---

### **Example 2: Multiple Melismas**

```abc
% Gospel-style with runs
w: Hal le _ lu _ _ _ jah
C D E | F G A B | c2 z2 |
```

**Output:**
```
C → "Hal"
D → "le"
E → "le" (melisma)
F → "lu"
G → "lu" (melisma)
A → "lu" (melisma)
B → "lu" (melisma)
c → "jah"
```

---

### **Example 3: Mixed with Hyphens**

```abc
% Combining hyphens (word breaks) and underscores (melisma)
w: A-ma-zing _ _ grace
C D E F G A |
```

**Output:**
```
C → "A"
D → "ma"
E → "zing"
F → "zing" (melisma)
G → "zing" (melisma)
A → "grace"
```

---

## 🎭 **When to Use Melisma**

### **Use Case 1: Vocal Runs**
```abc
% R&B/Gospel runs on one syllable
w: Oh _ _ _ _ yeah
C D E F G A |
```

### **Use Case 2: Sustained Vowels**
```abc
% Holding a note over multiple pitches
w: Heeeeey (becomes: He _ _ _ y)
w: He _ _ _ y
G A B c d |
```

### **Use Case 3: Flourishes**
```abc
% Operatic coloratura
w: Glo _ _ _ _ _ ri a
c d e f g a b c' |
```

---

## ⚠️ **Important Rules**

### **Rule 1: Underscores Come AFTER the Syllable**
```abc
w: Hel _ _ lo        ✅ Correct
w: _ _ Hel lo        ❌ Wrong (no previous syllable)
```

### **Rule 2: Spaces Separate Syllables**
```abc
w: Hel-lo _ world    ✅ 4 syllables: Hel, lo, _, world
w: Hello _ world     ✅ 3 syllables: Hello, _, world
```

### **Rule 3: Use One Underscore Per Note**
```abc
w: Hel lo _ _ _      % 5 syllables
C D E F G |          % 5 notes ✅
```

---

## 🔄 **Alternative: Tilde `~`**

Both `_` and `~` work for melisma:

```abc
w: Hel lo ~ ~ world
C D E F G |
```

Same result as using `_`.

---

## 🎯 **Your "One Perfect Day" Example**

If you have notes without lyrics, use melisma:

### **Before (Empty Lyrics):**
```abc
w: Fi nal ly ans              % 4 syllables
c d e d |                      % 4 notes
c B A2 |                       % 3 notes with no lyrics ❌
w: wered now
```

### **After (With Melisma):**
```abc
w: Fi nal ly ans _ _ wered now    % 7 syllables (ans holds for 3 notes)
c d e d |                          % 4 notes
c B A2 |                           % 3 notes
```

**Result in JSON:**
```json
{ "lyric": "Fi" },
{ "lyric": "nal" },
{ "lyric": "ly" },
{ "lyric": "ans" },
{ "lyric": "ans" },  // melisma
{ "lyric": "ans" },  // melisma
{ "lyric": "wered" }
```

---

## 📊 **Melisma vs. No Lyrics**

| Your EABC | Result in Ace Studio |
|-----------|----------------------|
| `w: Hel lo world` (3 syllables)<br>`C D E F G` (5 notes) | Notes D, E have empty lyrics (hummed) |
| `w: Hel lo _ _ world` (5 syllables)<br>`C D E F G` (5 notes) | All notes have lyrics, "lo" held across D, E |
| No `w:` line<br>`C D E F G` | All notes empty (instrumental/hummed) |

---

## 🚀 **How It Works Now**

### **Parser Logic:**

1. **Split lyrics by spaces**: `"Hel lo _ _ world"` → `["Hel", "lo", "_", "_", "world"]`
2. **Process each note**:
   - If syllable is `_` or `~` → copy previous syllable
   - Otherwise → use the syllable as-is
3. **Result**: Melisma notes get same lyric as previous note

---

## 🎼 **Standard ABC Melisma Conventions**

This matches standard ABC notation:
- **Underscore** `_` = melisma/syllable extension
- **Tilde** `~` = alternate melisma symbol
- **Asterisk** `*` = sometimes used (we can add if needed)

---

## ✨ **Try It Now!**

Update your EABC with underscores:

```abc
X:1
T:Melisma Test
M:4/4
L:1/4
Q:1/4=120
K:C

% Syllable "day" sung over 4 notes
w: What a beau ti ful _ _ _ day
C D E F | G A B c | d4 |
```

Then convert and check - all notes should have lyrics now! 🎵

---

**Last Updated**: 2025-10-05  
**Feature**: Melisma support with `_` and `~`  
**Status**: ✅ Implemented and ready!