# EABC to Ace Studio Encoder

A React web application that converts EABC (Extended ABC) notation to Ace Studio format (.acep files).

## Features

- Parse EABC notation with metadata, notes, and lyrics
- Convert to Ace Studio JSON format
- Export as .acep files (gzip compressed)
- Support for vocal parameters (tension, breathiness, energy, vibrato, etc.)
- Beautiful, modern UI with dark theme

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Usage

1. Paste your EABC notation in the left textarea
2. Click "Convert to Ace Studio" 
3. Download as JSON or .acep file
4. Import into Ace Studio

## EABC Format Support

- Metadata: T: (title), C: (composer), M: (meter), L: (length), K: (key), Q: (tempo)
- Notes: Standard ABC notation
- Lyrics: w: prefix
- Parameters: {dyn:...}, {vib:...}, {br:...}, {ten:...}, {gen:...}, {reg:...}, {expr:...}

## Deployment

### Deploy to Netlify/Vercel

1. Build the project: `npm run build`
2. Deploy the `dist` folder

### Deploy with Docker

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Note

Currently using gzip compression for .acep files. Ace Studio officially uses zstd compression, which may require external tools for full compatibility.