# Musical Keys

A single-page web application that transforms your QWERTY keyboard into a playable musical instrument. Features viewport-based scaling for consistent appearance across all devices, professional Web Audio API synthesis with stuck-note prevention, and visual feedback.

![Musical Keys](https://img.shields.io/badge/version-2.0-blue) ![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-supported-green)

## Features

- **Full Keyboard Layout**: Visual representation of complete QWERTY keyboard with greyed-out non-musical keys
- **Viewport-Based Scaling**: Keyboard scales proportionally with window size (like GLSL shaders)
- **Solid Audio Engine**: Professional Web Audio API synthesis with stuck-note prevention
- **Speaker Icon**: Animated visual indicator when sound is playing
- **Dual Input System**: Play with QWERTY keyboard or click/tap on-screen keys
- **Polyphonic Synthesis**: Play multiple notes simultaneously without issues
- **Recording & Playback**: Record your performances and play them back
- **Save/Load Recordings**: Export and import recordings as JSON files
- **Elegant Header**: Integrated menu button in header with speaker icon
- **Fancy Spacebar**: Features "Musical Keys" in grey
- **Single Page Application**: No scrolling, everything fits on screen

## Keyboard Layout

The application uses a standard QWERTY keyboard layout with 30 working musical keys:

### Working Musical Keys

**Row 1**: ` 1 2 3 4 5 6 7 8 9 0 - = ⌫` (inactive, greyed out)
**Row 2**: Tab Q W E R T Y U I O P [ ] \ (Tab, [, ], \ inactive)
**Row 3**: Caps A S D F G H J K L ; ' Enter (Caps, ', Enter inactive)
**Row 4**: Shift Z X C V B N M , . / Shift (Shift keys inactive)
**Row 5**: Ctrl ⌘ Alt **Space** Alt ⌘ Ctrl (all inactive except Space shows text)

**Active Musical Keys**: Q W E R T Y U I O P A S D F G H J K L ; Z X C V B N M , . /

### Note Mapping

| Key | MIDI Note |
|-----|-----------|
| Q, A, Z | 60 (C4) |
| W, S, X | 62 (D4) |
| E, D, C | 64 (E4) |
| R, F, V | 65 (F4) |
| T, G, B | 67 (G4) |
| Y, H, N | 69 (A4) |
| U, J, M | 71 (B4) |
| I, K, , | 72 (C5) |
| O, L, . | 74 (D5) |
| P, ; | 76 (E5) |
| / | 77 (F5) |

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
- Press the mapped keys (QWERTYUIOPASDFGHJKL;ZXCVBNM,./) to play sounds
- Hold keys for sustained notes
- Release keys to stop notes
- Multiple keys can be pressed simultaneously
- Speaker icon animates when notes are playing

**Mouse/Touch Input:**
- Click or tap on-screen keys (white keys only)
- Greyed-out keys are non-functional
- Keys highlight in cyan when pressed

**Menu (☰ Button):**
1. Click the menu button in header to access controls
2. **Record**: Start capturing your performance
3. **Stop**: Finish recording
4. **Play**: Hear your recording
5. **Save**: Download as JSON file
6. **Load**: Import a previously saved recording

## Technical Details

### Audio Architecture

The application uses the **Web Audio API** for robust, stuck-note-free synthesis:

```
AudioContext
    └─ MasterGain (fixed at 1.0)
        └─ Destination (speakers/headphones)

Per Note:
    Oscillator (triangle) → NoteGain (ADSR) → MasterGain
```

Each note creates a unique oscillator instance with proper cleanup:
```javascript
const activeNotes = new Map(); // midi -> { osc, noteGain, startTime }
```

### Stuck Note Prevention

The audio engine implements multiple safeguards:

1. **Duplicate Note Prevention**: Checks if note is already playing before starting
2. **Proper Cleanup**: Oscillators are disconnected after release phase
3. **Emergency Stop**: `stopAllNotes()` method forces cleanup of all active notes
4. **Tab Hidden Handling**: Automatically stops all notes when tab is hidden
5. **Page Unload Handling**: Cleanup on browser close/navigation

### Waveform

Uses triangle waveform for a balanced, mellow tone with rich harmonics.

### Frequency Calculation

Notes are calculated using the standard MIDI-to-frequency formula:
```javascript
frequency = 440 × 2^((MIDI - 69) / 12)
```

### ADSR Envelope

Each note uses an ADSR (Attack, Decay, Sustain, Release) envelope:
- **Attack**: 10ms linear ramp to full velocity
- **Decay**: 300ms exponential drop to 70% sustain level
- **Sustain**: Maintained while key is held
- **Release**: 100ms exponential fade when key is released

### Polyphony

Unlimited polyphony through a Map-based tracking system with active note counting.

### Viewport Scaling

Keyboard uses viewport-based units (vw, vh) for consistent appearance:
- Key size: `5vw × 5vh` with min/max constraints
- Responsive scaling maintains proportions across all devices
- Similar to GLSL shader coordinate systems

## File Structure

```
musical_keys/
├── index.html           # Main HTML structure and keyboard UI
├── css/
│   └── style.css        # Viewport-based scaling and styling
├── js/
│   ├── audio-engine.js  # Web Audio API synthesis with stuck-note prevention
│   ├── input-handler.js # Keyboard mapping and dual input
│   ├── recording.js     # Event recording and playback
│   └── main.js          # App initialization and menu wiring
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
  "version": "2.0",
  "date": "2025-01-30T12:34:56.789Z",
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

## Visual Design

### Header
- Fixed position at top (60px height)
- Speaker icon with cyan glow animation when sound plays
- "Musical Keys" title with gradient text
- Menu button (☰) on the right side

### Key Styling
- **Active keys**: White gradient (#f0f0f0 → #d0d0d0)
- **Inactive keys**: Grey gradient (#808080 → #606060) with 50% opacity
- **Pressed keys**: Cyan gradient (#00d4ff → #0099cc)
- **Key labels**: Viewport-based sizing with clamp()
- **Key size**: 5vw × 5vh (min 40px, max 90px)

### Spacebar
- Features "Musical Keys" in grey (#888)
- Spans most of the bottom row width
- Clickable but doesn't produce sound (visual only)

## Verification Checklist

### File Structure ✅
- [ ] index.html exists with full keyboard layout
- [ ] css/style.css uses viewport-based scaling
- [ ] js/audio-engine.js uses Web Audio API
- [ ] js/input-handler.js maps keyboard to MIDI notes
- [ ] js/recording.js handles recording/playback
- [ ] js/main.js initializes the application

### Audio Engine
- [ ] Notes play without sticking
- [ ] Multiple keys can be pressed rapidly
- [ ] All notes stop when tab is hidden
- [ ] Emergency stop works (stopAllNotes)
- [ ] Speaker icon animates when sound plays

### Keyboard Mapping
- [ ] All 30 musical keys produce sound when pressed
- [ ] Non-musical keys are greyed out and non-functional
- [ ] Multiple notes can play simultaneously (chords)
- [ ] Visual feedback appears on key press
- [ ] Visual feedback appears on mouse/touch press

### Menu Functionality
- [ ] Menu button (☰) is in header
- [ ] Clicking menu button shows dropdown
- [ ] All recording controls work from menu
- [ ] Recording status displays in menu

### Responsive Design
- [ ] Desktop layout displays correctly
- [ ] Tablet layout (768px) adapts properly
- [ ] Mobile layout (480px) adapts properly
- [ ] Keyboard maintains proportions across screen sizes
- [ ] No scrollbar appears (single-page app)
- [ ] Keys are tappable on mobile

## Testing Instructions

1. Open index.html in multiple browsers
2. Test each musical key plays a unique note
3. Verify non-musical keys are greyed out
4. Test clicking/tapping on-screen keys
5. Test playing chords (multiple keys simultaneously)
6. Rapidly press and release keys to test stuck-note prevention
7. Test menu button opens/closes dropdown
8. Record a simple melody, then play it back
9. Save recording, reload page, load and play recording
10. Verify spacebar displays "Musical Keys"
11. Test on mobile device (or mobile emulation)
12. Check browser console for errors
13. Verify speaker icon animates when sound plays
14. Test window resize - keyboard should scale proportionally

## Troubleshooting

### Stuck Notes
- If notes get stuck, refresh the page
- Check browser console for error messages
- Ensure you're running a modern browser with Web Audio API support

### No Sound
- Make sure you've pressed a key or clicked something (audio initializes on first interaction)
- Check your system volume
- Check browser console for Web Audio API errors

### Keys Not Responding
- Verify focus is on the page (click anywhere)
- Check browser console for JavaScript errors
- Try refreshing the page
- Ensure you're pressing musical keys (QWERTYUIOPASDFGHJKL;ZXCVBNM,/)

### Layout Issues
- Ensure browser window is maximized
- Check that zoom level is 100%
- Try resizing the browser window
- Keyboard should scale proportionally

## Performance Tips

- For best performance, use Chrome or Firefox
- Close unnecessary browser tabs
- Use a wired connection on mobile for lower latency
- Web Audio API provides better timing accuracy than alternatives

## License

This project is open source and available under the MIT License.

## Credits

Built with vanilla JavaScript using the **Web Audio API** for professional, stuck-note-free audio synthesis.

---

**Enjoy playing Musical Keys! 🎹**
