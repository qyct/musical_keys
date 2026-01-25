/**
 * Input Handler for Qwertica Keys
 * Maps keyboard events to MIDI notes and coordinates dual input
 */

class InputHandler {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.pressedKeys = new Set(); // Track currently pressed keys
        this.keyToMidi = this.createKeyToMidiMap();
        this.midiToKeyElement = this.createMidiToKeyElementMap();
        this.isInitialized = false;
    }

    /**
     * Create mapping from keyboard keys to MIDI notes
     * Left hand: Q W E R T | A S D F G | Z X C V B
     * Right hand: Y U I O P | H J K L | N M , . ; /
     */
    createKeyToMidiMap() {
        return new Map([
            // Left Hand - Row Q
            ['q', 60], ['w', 62], ['e', 64], ['r', 65], ['t', 67],
            // Left Hand - Row A
            ['a', 60], ['s', 62], ['d', 64], ['f', 65], ['g', 67],
            // Left Hand - Row Z
            ['z', 60], ['x', 62], ['c', 64], ['v', 65], ['b', 67],
            // Right Hand - Row Y
            ['y', 69], ['u', 71], ['i', 72], ['o', 74], ['p', 76],
            // Right Hand - Row H
            ['h', 69], ['j', 71], ['k', 72], ['l', 74],
            // Right Hand - Row N
            ['n', 69], ['m', 71], [',', 72], ['.', 74], [';', 76], ['/', 77]
        ]);
    }

    /**
     * Create mapping from MIDI notes to DOM key elements
     */
    createMidiToKeyElementMap() {
        const map = new Map();
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const midi = parseInt(key.dataset.note);
            if (midi) {
                map.set(midi, key);
            }
        });
        return map;
    }

    /**
     * Initialize event listeners
     */
    init() {
        if (this.isInitialized) return;

        // Keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Mouse/touch event listeners for on-screen keys
        this.setupMouseTouchHandlers();

        this.isInitialized = true;
        console.log('Input handler initialized');
    }

    /**
     * Handle keyboard keydown events
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        // Ignore if not a mapped key
        if (!this.keyToMidi.has(key)) {
            return;
        }

        // Ignore if key is already pressed (prevent repeat)
        if (this.pressedKeys.has(key)) {
            event.preventDefault();
            return;
        }

        // Add to pressed keys
        this.pressedKeys.add(key);

        // Get MIDI note
        const midi = this.keyToMidi.get(key);

        // Play note
        this.audioEngine.playNote(midi, 0.5);

        // Visual feedback
        this.activateKey(midi);

        // Prevent default browser behavior
        event.preventDefault();

        // Notify recorder
        this.notifyRecorder('noteOn', midi, 0.5);
    }

    /**
     * Handle keyboard keyup events
     */
    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        // Ignore if not a mapped key
        if (!this.keyToMidi.has(key)) {
            return;
        }

        // Remove from pressed keys
        this.pressedKeys.delete(key);

        // Get MIDI note
        const midi = this.keyToMidi.get(key);

        // Stop note
        this.audioEngine.stopNote(midi);

        // Remove visual feedback
        this.deactivateKey(midi);

        // Prevent default browser behavior
        event.preventDefault();

        // Notify recorder
        this.notifyRecorder('noteOff', midi, 0);
    }

    /**
     * Set up mouse and touch event handlers for on-screen keys
     */
    setupMouseTouchHandlers() {
        const keys = document.querySelectorAll('.key');

        keys.forEach(key => {
            const midi = parseInt(key.dataset.note);

            // Mouse events
            key.addEventListener('mousedown', (event) => {
                this.handlePointerDown(midi, key);
                event.preventDefault();
            });

            key.addEventListener('mouseup', (event) => {
                this.handlePointerUp(midi, key);
                event.preventDefault();
            });

            key.addEventListener('mouseleave', (event) => {
                this.handlePointerUp(midi, key);
            });

            // Touch events
            key.addEventListener('touchstart', (event) => {
                this.handlePointerDown(midi, key);
                event.preventDefault();
            });

            key.addEventListener('touchend', (event) => {
                this.handlePointerUp(midi, key);
                event.preventDefault();
            });
        });
    }

    /**
     * Handle pointer down (mouse/touch) on a key
     */
    handlePointerDown(midi, keyElement) {
        // Don't play if already active
        if (keyElement.classList.contains('active')) {
            return;
        }

        // Play note
        this.audioEngine.playNote(midi, 0.5);

        // Visual feedback
        this.activateKey(midi);

        // Notify recorder
        this.notifyRecorder('noteOn', midi, 0.5);
    }

    /**
     * Handle pointer up (mouse/touch) on a key
     */
    handlePointerUp(midi, keyElement) {
        // Don't stop if not active
        if (!keyElement.classList.contains('active')) {
            return;
        }

        // Stop note
        this.audioEngine.stopNote(midi);

        // Remove visual feedback
        this.deactivateKey(midi);

        // Notify recorder
        this.notifyRecorder('noteOff', midi, 0);
    }

    /**
     * Activate visual feedback for a key
     */
    activateKey(midi) {
        const keyElement = this.midiToKeyElement.get(midi);
        if (keyElement) {
            keyElement.classList.add('active');
        }
    }

    /**
     * Deactivate visual feedback for a key
     */
    deactivateKey(midi) {
        const keyElement = this.midiToKeyElement.get(midi);
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }

    /**
     * Set recorder callback for event recording
     */
    setRecorderCallback(callback) {
        this.recorderCallback = callback;
    }

    /**
     * Notify recorder of note events
     */
    notifyRecorder(type, note, velocity) {
        if (this.recorderCallback) {
            this.recorderCallback({
                type,
                note,
                velocity,
                timestamp: performance.now()
            });
        }
    }

    /**
     * Get the key character for a MIDI note (for display)
     */
    getKeyForMidi(midi) {
        for (const [key, midiNum] of this.keyToMidi) {
            if (midiNum === midi) {
                return key.toUpperCase();
            }
        }
        return null;
    }

    /**
     * Clear all pressed keys (useful for cleanup)
     */
    clearPressedKeys() {
        this.pressedKeys.clear();
    }

    /**
     * Stop all currently playing notes
     */
    stopAllNotes() {
        for (const midi of this.midiToKeyElement.keys()) {
            this.deactivateKey(midi);
        }
        this.audioEngine.stopAllNotes();
    }
}

// Create global input handler instance (will be initialized with audio engine)
let inputHandler;
