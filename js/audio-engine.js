/**
 * Audio Engine for Qwertica Keys
 * Handles Web Audio API initialization, sound synthesis, and polyphony
 * Uses triangle waveform only at full volume
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeNotes = new Map(); // midi -> { osc, noteGain }
        this.waveform = 'triangle'; // Fixed to triangle waveform
        this.isInitialized = false;
    }

    /**
     * Initialize the AudioContext (must be called after user gesture)
     */
    async init() {
        if (this.isInitialized) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();

            // Create master gain node at full volume
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 1.0;

            // Connect master gain to output
            this.masterGain.connect(this.audioContext.destination);

            this.isInitialized = true;
            console.log('Audio engine initialized');
        } catch (error) {
            console.error('Failed to initialize audio engine:', error);
            throw error;
        }
    }

    /**
     * Convert MIDI note number to frequency
     * Formula: f = 440 * 2^((midi - 69) / 12)
     */
    midiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    /**
     * Play a note with the specified MIDI number and velocity
     * @param {number} midi - MIDI note number (48-77)
     * @param {number} velocity - Note velocity (0-1)
     */
    playNote(midi, velocity = 0.5) {
        if (!this.isInitialized) {
            console.warn('Audio engine not initialized');
            return;
        }

        // Don't play if note is already active
        if (this.activeNotes.has(midi)) {
            return;
        }

        const now = this.audioContext.currentTime;
        const frequency = this.midiToFrequency(midi);

        // Create oscillator for the note (triangle waveform only)
        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = frequency;

        // Create gain node for ADSR envelope
        const noteGain = this.audioContext.createGain();
        noteGain.gain.value = 0;

        // Connect: osc -> noteGain -> masterGain
        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        // ADSR Envelope
        // Attack: quick fade in
        noteGain.gain.linearRampToValueAtTime(velocity, now + 0.01);

        // Decay: slight drop to sustain level
        noteGain.gain.exponentialRampToValueAtTime(velocity * 0.7, now + 0.3);

        // Start the oscillator
        osc.start(now);

        // Store the active note
        this.activeNotes.set(midi, { osc, noteGain });
    }

    /**
     * Stop a currently playing note
     * @param {number} midi - MIDI note number to stop
     */
    stopNote(midi) {
        if (!this.isInitialized) {
            return;
        }

        const noteData = this.activeNotes.get(midi);
        if (!noteData) {
            return;
        }

        const { osc, noteGain } = noteData;
        const now = this.audioContext.currentTime;

        // Release: fade out quickly
        try {
            noteGain.gain.cancelScheduledValues(now);
            noteGain.gain.setValueAtTime(noteGain.gain.value, now);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            // Stop oscillator after release
            osc.stop(now + 0.35);

            // Clean up the active notes map
            setTimeout(() => {
                this.activeNotes.delete(midi);
            }, 400);
        } catch (error) {
            // If there's an error with scheduling, just clean up
            this.activeNotes.delete(midi);
        }
    }

    /**
     * Stop all currently playing notes
     */
    stopAllNotes() {
        for (const midi of this.activeNotes.keys()) {
            this.stopNote(midi);
        }
    }

    /**
     * Resume the AudioContext if suspended (required by some browsers)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Check if the audio engine is initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Get the current AudioContext state
     */
    getState() {
        return this.audioContext ? this.audioContext.state : 'not initialized';
    }
}

// Create global audio engine instance
const audioEngine = new AudioEngine();
