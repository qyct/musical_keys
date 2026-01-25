# Qwertica Keys

A single-page web application that transforms your QWERTY keyboard into a playable musical instrument. Press keyboard keys or click/tap the on-screen keys to create sounds. Features polyphonic Web Audio API synthesis, recording/playback functionality, and save/load capabilities.

![Qwertica Keys](https://img.shields.io/badge/version-1.0-blue) ![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-supported-green)

## Features

- **Dual Input System**: Play with QWERTY keyboard or click/tap on-screen keys
- **Ergonomic Two-Handed Layout**: Designed for natural hand positioning
- **Polyphonic Synthesis**: Play multiple notes simultaneously
- **Recording & Playback**: Record your performances and play them back
- **Save/Load Recordings**: Export and import recordings as JSON files
- **Single Page Application**: No scrolling, everything fits on one screen
- **No External Dependencies**: Pure vanilla JavaScript, HTML, and CSS

## Keyboard Layout

The application uses an ergonomic two-handed layout designed for comfortable typing:

### Left Hand

| Finger | Keys |
|--------|------|
| Little | Q, A, Z |
| Ring | W, S, X |
| Middle | E, D, C |
| Index | R, F, V, T, G, B |

**Left hand keys**: Q W E R T A S D F G Z X C V B

### Right Hand

| Finger | Keys |
|--------|------|
| Index | Y, H, N, U, J, M |
| Middle | I, K, , |
| Ring | O, L, . |
| Little | P, ;, / |

**Right hand keys**: Y U I O P H J K L N M , . ; /

## Installation & Usage

### Local Development

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Start pressing keys or clicking on-screen keys
4. Audio initializes automatically on first interaction

### GitHub Pages Deployment

1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings > Pages
4. Select the main branch as source
5. Your app will be live at `https://username.github.io/repository-name`

### Using the Application

**Keyboard Input:**
- Press the mapped keys to play sounds
- Hold keys for sustained notes
- Release keys to stop notes
- Multiple keys can be pressed simultaneously

**Mouse/Touch Input:**
- Click or tap on-screen keys
- Drag across keys for glissando effect

**Recording:**
1. Click "Record" to start capturing your performance
2. Play some notes
3. Click "Stop" to finish recording
4. Click "Play" to hear your recording
5. Click "Save" to download as JSON file
6. Use "Load" to import a previously saved recording

## Technical Details

### Audio Architecture

The application uses the Web Audio API for sound synthesis:

```
AudioContext
    └─ MasterGain (fixed at 1.0)
        └─ Destination (speakers/headphones)

Per Note:
    Oscillator (triangle) → NoteGain (ADSR) → MasterGain
```

### Waveform

Uses triangle waveform exclusively for a balanced, mellow tone.

### Frequency Calculation

Notes are calculated using the standard MIDI-to-frequency formula:
```javascript
frequency = 440 × 2^((MIDI - 69) / 12)
```

### ADSR Envelope

Each note uses an ADSR (Attack, Decay, Sustain, Release) envelope:
- **Attack**: 10ms linear ramp to full velocity
- **Decay**: 290ms exponential drop to 70% sustain level
- **Sustain**: Maintained while key is held
- **Release**: 300ms exponential fade when key is released

### Polyphony

Unlimited polyphony through a Map-based tracking system:
```javascript
const activeNotes = new Map(); // midi -> { osc, noteGain }
```

## File Structure

```
qwertica_piano/
├── index.html           # Main HTML structure and UI
├── css/
│   └── style.css        # Single-page layout and styling
├── js/
│   ├── audio-engine.js  # Web Audio API, oscillators, ADSR
│   ├── input-handler.js # Keyboard mapping and dual input
│   ├── recording.js     # Event recording and playback
│   └── main.js          # App initialization and UI wiring
└── README.md            # Documentation
```

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 60+     | ✅ Fully Supported |
| Firefox | 57+     | ✅ Fully Supported |
| Safari  | 11+     | ✅ Fully Supported |
| Edge    | 79+     | ✅ Fully Supported |
| Opera   | 47+     | ✅ Fully Supported |

**Note**: Audio initializes automatically on first user interaction (keydown, click, or touch).

## Recording File Format

Recordings are saved as JSON files with the following structure:

```json
{
  "version": "1.0",
  "date": "2025-01-25T12:34:56.789Z",
  "duration": 5432.100,
  "eventCount": 42,
  "events": [
    {
      "type": "noteOn",
      "note": 60,
      "velocity": 0.5,
      "timestamp": 0.000
    },
    {
      "type": "noteOff",
      "note": 60,
      "velocity": 0,
      "timestamp": 500.123
    }
  ]
}
```

## Verification Checklist

Use this checklist to verify the application works correctly:

### File Structure ✅
- [ ] index.html exists and is properly formatted
- [ ] css/style.css contains all styles
- [ ] js/audio-engine.js implements Web Audio API
- [ ] js/input-handler.js maps keyboard to MIDI notes
- [ ] js/recording.js handles recording/playback
- [ ] js/main.js initializes the application

### Keyboard Mapping
- [ ] Q W E R T play different notes
- [ ] A S D F G play different notes
- [ ] Z X C V B play different notes
- [ ] Y U I O P play different notes
- [ ] H J K L play different notes
- [ ] N M , . ; / play different notes

### Functional Tests
- [ ] All keys produce sound when pressed
- [ ] Multiple notes can play simultaneously (chords)
- [ ] Notes stop when key is released
- [ ] Visual feedback appears on keyboard press
- [ ] Visual feedback appears on mouse/touch press
- [ ] Key repeat is prevented (holding key doesn't retrigger)

### Recording Tests
- [ ] Record button starts recording
- [ ] Note events are captured with timestamps
- [ ] Stop button finalizes recording
- [ ] Play button reproduces recording accurately
- [ ] Playback timing matches original performance
- [ ] Visual feedback during playback works
- [ ] Save button downloads JSON file
- [ ] JSON file contains valid event data
- [ ] Load button imports JSON file
- [ ] Loaded recording plays correctly

### Responsive Design
- [ ] Desktop layout displays correctly
- [ ] Tablet layout (768px) adapts properly
- [ ] Mobile layout (480px) adapts properly
- [ ] No scrollbar appears (single-page app)
- [ ] Keys are tappable on mobile

### Browser Compatibility
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

### Audio Quality
- [ ] Triangle waveform produces smooth tone
- [ ] No audio glitches when playing fast passages
- [ ] Full volume output is maintained
- [ ] ADSR envelope sounds natural

### Performance
- [ ] No memory leaks after extended use
- [ ] Page loads quickly (< 2 seconds)
- [ ] No console errors or warnings
- [ ] Cleanup works on page unload

## Testing Instructions

1. Open index.html in multiple browsers
2. Test each keyboard key plays a unique note
3. Test clicking/tapping on-screen keys
4. Test playing chords (multiple keys simultaneously)
5. Record a simple melody, then play it back
6. Save recording, reload page, load and play recording
7. Test on mobile device (or mobile emulation)
8. Check browser console for errors
9. Verify responsive design at different screen sizes
10. Confirm no scrollbar appears (everything fits on screen)

## Troubleshooting

### No Sound
- Make sure you've pressed a key or clicked something (audio initializes on first interaction)
- Check your system volume
- Check browser console for Web Audio API errors

### Keys Not Responding
- Verify focus is on the page (click anywhere)
- Check browser console for JavaScript errors
- Try refreshing the page

### Recording Issues
- Ensure events were recorded (check event count)
- Verify JSON file structure if loading
- Check browser console for errors

### Layout Issues
- Ensure browser window is maximized
- Check that zoom level is 100%
- Try resizing the browser window

## Performance Tips

- For best performance, use Chrome or Firefox
- Close unnecessary browser tabs
- Use a wired connection on mobile for lower latency
- Reduce the number of simultaneous notes on slower devices

## License

This project is open source and available under the MIT License.

## Credits

Built with vanilla JavaScript using the Web Audio API. No external libraries or frameworks.

---

**Enjoy playing Qwertica Keys! ⌨️**
