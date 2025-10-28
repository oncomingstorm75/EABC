# EABC to Ace Studio Encoder

A web-based tool to convert Enhanced ABC Notation (EABC) with vocal synthesis parameters to Ace Studio's .acep format.

## 🎵 What is EABC?

**EABC (Enhanced ABC Notation)** extends standard ABC music notation with vocal synthesis parameters for AI vocal engines. It allows you to write:
- **Notes and melodies** (standard ABC notation)
- **Lyrics** (syllable-by-syllable)
- **Vocal parameters** (tension, breathiness, vibrato, dynamics, etc.)

Then convert it all to **Ace Studio** format for AI vocal synthesis!

## 🚀 Quick Start

### 1. Write Your EABC Notation

```abc
X:1
T:My Song
M:4/4
L:1/4
Q:1/4=120
K:C

% Lyrics go on a separate line
w: Hel - lo world how are you
{dyn:f}{vib:60,45,20}C D E F G |
```

### 2. Convert to Ace Studio

1. Open the web app
2. Paste your EABC in the left box
3. Click **"Convert to Ace Studio"** (purple button)
4. Click **"Download .acep (for Ace Studio)"** (green button)

### 3. Import into Ace Studio

Open the `.acep` file in Ace Studio - your notes, lyrics, and vocal parameters will all be there!

---

## 📖 **Important: EABC Format Guide**

**👉 Before converting, read this**: [`EABC_FORMAT_GUIDE.md`](EABC_FORMAT_GUIDE.md)

This guide explains:
- ✅ **Proper lyric format** (most common issue!)
- ✅ Supported parameters vs. unsupported
- ✅ Common mistakes and solutions
- ✅ Complete working examples
- ✅ Debugging tips

**Common issue**: Lyrics not appearing? Check your format in the guide!

---

## 🎛️ Supported Parameters

EABC has 35+ parameters, but only these map to **Ace Studio's 6 core parameters**:

### ✅ **Fully Supported** (Convert Correctly)

| EABC Parameter | Ace Studio | Range | Example |
|----------------|------------|-------|---------|
| `{ten:}` `{wt:}` `{intense:}` | tension | 0.5-1.5 | `{ten:80}C4` |
| `{br:}` `{air:}` | breathiness | 0-2.0 | `{br:50}D4` |
| `{dyn:}` `{eff:}` | energy | 0.5-1.5 | `{dyn:ff}E4` |
| `{reg:}` | falsetto | 0-1.0 | `{reg:head}F4` |
| `{gen:}` `{fmt:}` `{age:}` | gender | 0.5-1.5 | `{gen:30}G4` |
| `{bend:}` `{scoop:}` `{fall:}` `{glide:}` | pitchDelta | -200 to +200 | `{bend:50}A4` |
| `{vib:depth,rate,delay}` | vibrato | object | `{vib:70,45,20}B4` |
| `{expr:smile/cry/angry/breathy/belt}` | multi-param | presets | `{expr:belt}C4` |

### ❌ **Not Supported** (Silently Ignored)

These parameters **cannot** map to Ace Studio:
- Acoustic: `{fry:}` `{growl:}` `{sub:}` `{harm:}` `{shim:}` `{vibjit:}` `{vibmod:}`
- Articulation: `{tng:}` `{jaw:}` `{lip:}` `{res:}` `{width:}` `{bright:}`
- Temporal: `{env:}` `{onset:}` `{offset:}` `{swing:}` `{ph:}`
- Processing: `{comp:}` `{riff:}`
- Meta: `{voice:}` `{art:}`

See [`EABC_PARAMETER_MAPPING.md`](EABC_PARAMETER_MAPPING.md) for complete details.

---

## 📚 Full Documentation

- **[`EABC_FORMAT_GUIDE.md`](EABC_FORMAT_GUIDE.md)** ⭐ - **Start here!** Format guide and best practices
- **[`EABC_PARAMETER_MAPPING.md`](EABC_PARAMETER_MAPPING.md)** - Complete parameter reference with formulas
- **[`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md)** - Technical architecture and testing
- **[`ZSTD_IMPLEMENTATION.md`](ZSTD_IMPLEMENTATION.md)** - Compression implementation details
- **[`DEPLOYMENT.md`](DEPLOYMENT.md)** - Deployment instructions

---

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to use the app locally.

### Build for Production
```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

---

## 🏗️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **zstd-codec** - Zstandard compression for .acep files
- **Lucide React** - Icons

---

## 🎯 How It Works

```
EABC Notation Input
        ↓
Parse metadata, notes, lyrics, parameters
        ↓
Map EABC params → Ace Studio's 6 core parameters
        ↓
Generate Ace Studio JSON
        ↓
Compress with zstd (level 10)
        ↓
Base64 encode
        ↓
Wrap in .acep envelope
        ↓
Download .acep file
        ↓
Import into Ace Studio ✅
```

---

## 🐛 Troubleshooting

### Problem: Lyrics Not Appearing

**Solution**: Read [`EABC_FORMAT_GUIDE.md`](EABC_FORMAT_GUIDE.md) - Section on lyric format

Common causes:
- ❌ Quotes around `w:` lines: `"w:lyrics"` (now supported!)
- ❌ `w:` mixed on same line as notes
- ❌ Syllable count doesn't match note count
- ❌ Extra blank lines between `w:` and notes

**Correct format**:
```abc
w: Hel - lo world
C D E F |
```

### Problem: Parameters Not Working

**Check**:
1. Are you using supported parameters? (See table above)
2. Are parameters BEFORE notes? `{dyn:f}C D` not `C D{dyn:f}`
3. Is syntax correct? `{dyn:f}` not `{dyn: f}` (no spaces)

### Problem: .acep Won't Import to Ace Studio

**Check**:
1. Did you click the green "Download .acep (for Ace Studio)" button?
2. Is Ace Studio up to date?
3. Try downloading JSON first to verify conversion worked

---

## 📊 Example Conversion

### Input (EABC):
```abc
X:1
T:Amazing Grace
M:3/4
L:1/4
Q:1/4=90
K:G

w: A - ma - zing grace
{dyn:mf}{vib:50,40,20}G2 B | d2 B |
```

### Output (Ace Studio .acep):
```json
{
  "compressMethod": "zstd",
  "content": "<base64-compressed-data>",
  "salt": "a1b2c3d4e5f67890",
  "version": 1000
}
```

When decompressed, contains:
```json
{
  "tracks": [{
    "notes": [
      {
        "pitch": 67,
        "lyric": "A",
        "tension": 1.0,
        "breathiness": 0.0,
        "energy": 1.0,
        "vibrato": {"depth": 0.5, "rate": 4.0, "attack": 20}
      }
      // ... more notes
    ]
  }]
}
```

---

## 🎓 Learning Resources

### New to ABC Notation?
- Start with standard ABC: http://abcnotation.com/
- ABC tutorial: http://abcnotation.com/learn

### New to Ace Studio?
- Ace Studio website: [Insert link]
- Parameter documentation: See our guides

### Want to Extend EABC?
- Fork this repo!
- See `IMPLEMENTATION_NOTES.md` for architecture
- See `EABC_PARAMETER_MAPPING.md` for mapping logic

---

## 🚨 **START HERE if you're having issues:**

👉 **[EABC_FORMAT_GUIDE.md](EABC_FORMAT_GUIDE.md)** 👈

This guide solves 90% of conversion problems!

---

## 📄 License

MIT

## 🤝 Contributing

Issues and pull requests welcome!

---

**Version**: 1.1  
**Last Updated**: 2025-10-05