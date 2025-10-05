import React, { useState } from 'react';
import { Music, Download, FileText, Copy } from 'lucide-react';
import pako from 'pako';

/**
 * EABC to Ace Studio Encoder
 * 
 * Supported EABC Parameters (map to Ace Studio's 6 core parameters):
 * ✅ {ten:0-100} → tension (0.5-1.5)
 * ✅ {wt:0-100} → tension (vocal weight)
 * ✅ {intense:0-100} → tension (intensity)
 * ✅ {br:0-100} → breathiness (0-2.0)
 * ✅ {air:0-100} → breathiness (aspiration)
 * ✅ {dyn:pp/p/mp/mf/f/ff} → energy (0.5-1.5)
 * ✅ {eff:0-100} → energy (effort)
 * ✅ {reg:chest/head/falsetto/mixed} → falsetto (0-1.0)
 * ✅ {gen:-100 to +100} → gender (0.5-1.5)
 * ✅ {fmt:-100 to +100} → gender (formant shift)
 * ✅ {age:0-100} → gender (vocal age)
 * ✅ {bend/scoop/fall/glide:cents} → pitchDelta (-200 to +200)
 * ✅ {vib:depth,rate,delay} → vibrato object
 * ✅ {expr:smile/cry/angry/breathy/belt} → combined parameter presets
 * 
 * Unsupported EABC Parameters (cannot map to Ace Studio):
 * ❌ Acoustic: fry, growl, sub, harm, shim, vibjit, vibmod
 * ❌ Articulation: tng, jaw, lip, res, width, bright
 * ❌ Temporal: env, onset, offset, swing, ph
 * ❌ Processing: comp, riff
 * 
 * See EABC_PARAMETER_MAPPING.md for full documentation.
 */
export default function EABCToAceEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');

  const parseEABC = (eabcText) => {
    const lines = eabcText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%'));
    
    const metadata = {
      title: '',
      composer: '',
      meter: '4/4',
      length: '1/4',
      tempo: 120,
      key: 'C'
    };
    
    const notes = [];
    let currentParams = {};
    let pendingLyrics = []; // Store lyrics from w: lines
    let tickPosition = 0;
    const ticksPerQuarter = 480;
    
    lines.forEach(line => {
      if (line.startsWith('T:')) metadata.title = line.substring(2).trim();
      if (line.startsWith('C:')) metadata.composer = line.substring(2).trim();
      if (line.startsWith('M:')) metadata.meter = line.substring(2).trim();
      if (line.startsWith('L:')) metadata.length = line.substring(2).trim();
      if (line.startsWith('K:')) metadata.key = line.substring(2).trim();
      if (line.startsWith('Q:')) {
        const tempoMatch = line.match(/(\d+\/\d+)=(\d+)/);
        if (tempoMatch) metadata.tempo = parseInt(tempoMatch[2]);
      }
    });
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip metadata lines
      if (line.startsWith('T:') || line.startsWith('C:') || 
          line.startsWith('M:') || line.startsWith('L:') || 
          line.startsWith('K:') || line.startsWith('Q:') ||
          line.startsWith('X:')) {
        continue;
      }
      
      // If this is a w: line, store it for the next note line
      if (line.startsWith('w:')) {
        const lyricLine = line.substring(2).trim();
        pendingLyrics = lyricLine.split(/[\s-]+/).filter(s => s);
        continue;
      }
      
      // Use pending lyrics or check if next line has lyrics
      let lineLyrics = [];
      if (pendingLyrics.length > 0) {
        lineLyrics = pendingLyrics;
        pendingLyrics = [];
      } else if (i + 1 < lines.length && lines[i + 1].startsWith('w:')) {
        const lyricLine = lines[i + 1].substring(2).trim();
        lineLyrics = lyricLine.split(/[\s-]+/).filter(s => s);
        i++; // Skip the w: line in next iteration
      }
      
      // Extract parameters from the line
      const paramMatches = line.matchAll(/\{([^}]+)\}/g);
      for (const match of paramMatches) {
        const paramStr = match[1];
        const parts = paramStr.split(':');
        const paramType = parts[0];
        
        if (paramType === 'dyn' || paramType === 'eff') currentParams.dynamics = parts[1];
        else if (paramType === 'vib') {
          const vibValues = parts[1].split(',');
          currentParams.vibrato = {
            depth: parseInt(vibValues[0]) || 50,
            rate: parseInt(vibValues[1]) || 40,
            delay: parseInt(vibValues[2]) || 0
          };
        }
        else if (paramType === 'br' || paramType === 'air') currentParams.breathiness = parseFloat(parts[1]);
        else if (paramType === 'ten' || paramType === 'wt' || paramType === 'intense') currentParams.tension = parseFloat(parts[1]);
        else if (paramType === 'gen' || paramType === 'fmt' || paramType === 'age') currentParams.gender = parseFloat(parts[1]);
        else if (paramType === 'reg') {
          const regParts = parts[1].split(',');
          currentParams.register = regParts[0];
          if (regParts[1]) currentParams.registerBlend = parseFloat(regParts[1]);
        }
        else if (paramType === 'bend' || paramType === 'scoop' || paramType === 'fall' || paramType === 'glide') {
          const bendParts = parts[1].split(',');
          currentParams.pitchDelta = parseFloat(bendParts[0]) || 0;
        }
        else if (paramType === 'expr') currentParams.expression = parts[1];
      }
      
      // Parse notes and inline lyrics
      // First, extract inline lyrics
      const inlineLyrics = [];
      const lyricMatches = line.matchAll(/"([^"]+)"/g);
      for (const match of lyricMatches) {
        inlineLyrics.push(match[1]);
      }
      
      // Remove inline lyrics from line for note parsing
      const cleanLine = line.replace(/"[^"]+"/g, '');
      
      const notePattern = /([A-Ga-g][',]*|z|\[[^\]]+\])(\d*)(\/\d+)?/g;
      let noteMatch;
      let syllableIndex = 0;
      
      while ((noteMatch = notePattern.exec(cleanLine)) !== null) {
        const [, pitch, multiplier, divisor] = noteMatch;
        
        if (pitch === 'z') {
          const duration = calculateDuration(multiplier, divisor, metadata.length, ticksPerQuarter);
          tickPosition += duration;
          continue;
        }
        
        if (pitch.startsWith('[')) {
          const duration = calculateDuration(multiplier, divisor, metadata.length, ticksPerQuarter);
          tickPosition += duration;
          continue;
        }
        
        const midiNote = pitchToMidi(pitch, metadata.key);
        const duration = calculateDuration(multiplier, divisor, metadata.length, ticksPerQuarter);
        
        // Use inline lyrics first, then line lyrics, then empty
        let lyric = '';
        if (inlineLyrics.length > syllableIndex) {
          lyric = inlineLyrics[syllableIndex];
        } else if (lineLyrics.length > syllableIndex) {
          lyric = lineLyrics[syllableIndex];
        }
        
        notes.push({
          tick: tickPosition,
          duration: duration,
          pitch: midiNote,
          lyric: lyric,
          params: { ...currentParams }
        });
        
        tickPosition += duration;
        syllableIndex++;
      }
    }
    
    return { metadata, notes };
  };

  const calculateDuration = (multiplier, divisor, defaultLength, ticksPerQuarter) => {
    let duration = ticksPerQuarter;
    
    if (defaultLength === '1/8') duration = ticksPerQuarter / 2;
    if (defaultLength === '1/16') duration = ticksPerQuarter / 4;
    if (defaultLength === '1/2') duration = ticksPerQuarter * 2;
    
    if (multiplier) duration *= parseInt(multiplier);
    if (divisor) duration /= parseInt(divisor.substring(1));
    
    return Math.round(duration);
  };

  const pitchToMidi = (pitch, key) => {
    const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
    const note = pitch[0].toUpperCase();
    let octave = 4;
    let midiNote = noteMap[note];
    
    // Apply key signature accidentals
    if (key && key.includes('#') && key[0] === note) {
      midiNote++;
    } else if (key && key.includes('b') && key[0] === note) {
      midiNote--;
    }
    
    for (let i = 1; i < pitch.length; i++) {
      if (pitch[i] === "'") octave++;
      if (pitch[i] === ",") octave--;
    }
    
    if (pitch[0] === pitch[0].toLowerCase() && pitch[0] !== pitch[0].toUpperCase()) {
      octave++;
    }
    
    return 12 * (octave + 1) + midiNote;
  };

  const mapToAceParams = (params) => {
    const ace = {
      tension: 1.0,
      breathiness: 0.0,
      energy: 1.0,
      falsetto: 0.0,
      gender: 1.0,
      pitchDelta: 0
    };
    
    // TENSION: Maps from ten, wt, intense (0-100 -> 0.5-1.5)
    if (params.tension !== undefined) {
      ace.tension = 0.5 + (params.tension / 100) * 1.0;
    }
    
    // BREATHINESS: Maps from br, air (0-100 -> 0-2.0)
    if (params.breathiness !== undefined) {
      ace.breathiness = (params.breathiness / 100) * 2.0;
    }
    
    // ENERGY: Maps from dyn, eff (0-100 or dynamics marking -> 0.5-1.5)
    if (params.dynamics) {
      const dynMap = { 
        'pp': 0.5, 'p': 0.7, 'mp': 0.85, 
        'mf': 1.0, 'f': 1.2, 'ff': 1.4, 
        'fff': 1.5 
      };
      ace.energy = dynMap[params.dynamics] || (params.dynamics / 100) * 1.0 + 0.5;
    }
    
    // FALSETTO: Maps from reg (falsetto/head/mixed) (0-100 -> 0-1.0)
    if (params.register === 'falsetto') {
      ace.falsetto = 1.0;
    } else if (params.register === 'head') {
      ace.falsetto = 0.8;
    } else if (params.register === 'mixed') {
      // Use blend if provided, otherwise 50/50
      ace.falsetto = params.registerBlend ? params.registerBlend / 100 : 0.5;
    } else if (params.register === 'whistle') {
      ace.falsetto = 1.0;
    }
    
    // GENDER: Maps from gen, fmt, age (-100 to +100 -> 0.5-1.5)
    if (params.gender !== undefined) {
      ace.gender = 0.5 + ((params.gender + 100) / 200) * 1.0;
    }
    
    // PITCHDELTA: Maps from bend, scoop, fall, glide (-200 to +200 cents)
    if (params.pitchDelta !== undefined) {
      ace.pitchDelta = Math.max(-200, Math.min(200, params.pitchDelta));
    }
    
    // Expression presets (override individual params)
    if (params.expression === 'smile') {
      ace.tension = 0.8;
      ace.energy = 1.2;
    } else if (params.expression === 'cry') {
      ace.tension = 1.3;
      ace.breathiness = 0.8;
    } else if (params.expression === 'angry') {
      ace.tension = 1.4;
      ace.energy = 1.4;
    } else if (params.expression === 'breathy') {
      ace.breathiness = 1.5;
      ace.tension = 0.7;
    } else if (params.expression === 'belt') {
      ace.energy = 1.5;
      ace.tension = 1.3;
    }
    
    return ace;
  };

  const convertToAceStudio = () => {
    try {
      if (!input.trim()) {
        setStatus('❌ Please enter EABC notation');
        return;
      }
      
      const { metadata, notes } = parseEABC(input);
      
      if (notes.length === 0) {
        setStatus('❌ No notes found in input');
        return;
      }
      
      const aceNotes = notes.map(note => {
        const aceParams = mapToAceParams(note.params);
        
        const aceNote = {
          pos: note.tick,
          length: note.duration,
          lyric: note.lyric,
          pronunciation: note.lyric,
          pitch: note.pitch,
          tension: aceParams.tension,
          breathiness: aceParams.breathiness,
          energy: aceParams.energy,
          falsetto: aceParams.falsetto,
          gender: aceParams.gender,
          pitchDelta: aceParams.pitchDelta
        };
        
        if (note.params.vibrato) {
          aceNote.vibrato = {
            depth: note.params.vibrato.depth / 100,
            rate: note.params.vibrato.rate / 10,
            attack: note.params.vibrato.delay || 0,
            release: 100
          };
        }
        
        return aceNote;
      });
      
      const aceProject = {
        version: "1.0.0",
        tempo: metadata.tempo,
        timeSignature: metadata.meter,
        tracks: [
          {
            name: metadata.title || "Vocal Track",
            voice: "Misty",
            notes: aceNotes,
            parameters: {
              tension: aceNotes.map(n => ({ tick: n.pos, value: n.tension })),
              breathiness: aceNotes.map(n => ({ tick: n.pos, value: n.breathiness })),
              energy: aceNotes.map(n => ({ tick: n.pos, value: n.energy })),
              falsetto: aceNotes.map(n => ({ tick: n.pos, value: n.falsetto })),
              gender: aceNotes.map(n => ({ tick: n.pos, value: n.gender })),
              pitchDelta: aceNotes.map(n => ({ tick: n.pos, value: n.pitchDelta }))
            }
          }
        ]
      };
      
      setOutput(JSON.stringify(aceProject, null, 2));
      setStatus(`✅ Converted ${notes.length} notes successfully!`);
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ace-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('✅ JSON downloaded!');
  };

  const downloadACEP = () => {
    try {
      setStatus('⏳ Compressing with gzip (zstd alternative)...');
      
      // Convert JSON to bytes
      const encoder = new TextEncoder();
      const jsonBytes = encoder.encode(output);
      
      // Compress with gzip (pako library - available in React artifacts)
      const compressed = pako.gzip(jsonBytes, { level: 9 });
      
      // Convert to base64
      let binary = '';
      for (let i = 0; i < compressed.length; i++) {
        binary += String.fromCharCode(compressed[i]);
      }
      const base64 = btoa(binary);
      
      // Generate random salt
      const salt = Array.from({ length: 16 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      // Create ACEP envelope (using gzip instead of zstd)
      const acepData = {
        compressMethod: "gzip",
        content: base64,
        salt: salt,
        version: 1000
      };
      
      const blob = new Blob([JSON.stringify(acepData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.acep';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus('✅ .acep downloaded (gzip compressed)!');
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      setStatus('✅ Copied to clipboard!');
    }).catch(() => {
      setStatus('❌ Could not copy');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-8 h-8 text-blue-300" />
            <h1 className="text-3xl font-bold text-white">EABC to Ace Studio Encoder</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white font-semibold mb-2">EABC Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your EABC notation here..."
                className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
            
            <div>
              <label className="block text-white font-semibold mb-2">Ace Studio JSON Output</label>
              <textarea
                value={output}
                readOnly
                placeholder="Converted output will appear here..."
                className="w-full h-96 p-4 bg-gray-900 text-blue-400 font-mono text-sm rounded-lg border border-gray-700 resize-none"
              />
            </div>
          </div>
          
          {status && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg text-white text-center font-medium">
              {status}
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={convertToAceStudio}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <FileText className="w-5 h-5" />
              Convert to Ace Studio
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={downloadJSON}
                disabled={!output}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
              <button
                onClick={downloadACEP}
                disabled={!output}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download .acep (gzip)
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="w-4 h-4" />
                Copy JSON
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> Using gzip compression instead of zstd. Ace Studio may not support this format. 
              For proper zstd compression, you'll need to use external tools or a Node.js environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
