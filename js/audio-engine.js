/**
 * Audio Engine for Musical Keys
 * Handles Web Audio API initialization, sound synthesis, and polyphony
 * Uses triangle waveform with proper cleanup to prevent stuck notes
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeNotes = new Map(); // midi -> { osc, noteGain, startTime }
        this.isInitialized = false;
        this.activeNoteCount = 0;
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
        // Auto-initialize if not already done
        if (!this.isInitialized) {
            console.warn('Audio engine not initialized, cannot play note');
            return;
        }

        // Don't play if note is already active
        if (this.activeNotes.has(midi)) {
            console.log(`Note ${midi} already playing, skipping`);
            return;
        }

        const now = this.audioContext.currentTime;
        const frequency = this.midiToFrequency(midi);

        try {
            // Create oscillator for the note (triangle waveform)
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
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(velocity, now + 0.01);

            // Decay: slight drop to sustain level
            noteGain.gain.exponentialRampToValueAtTime(velocity * 0.7, now + 0.3);

            // Start the oscillator
            osc.start(now);

            // Store the active note with timestamp for cleanup
            this.activeNotes.set(midi, {
                osc,
                noteGain,
                startTime: now
            });

            this.activeNoteCount++;
            this.updateSpeakerIcon();

            console.log(`Playing note ${midi} (${frequency.toFixed(2)}Hz), active: ${this.activeNoteCount}`);
        } catch (error) {
            console.error(`Error playing note ${midi}:`, error);
        }
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
            console.log(`Note ${midi} not playing, cannot stop`);
            return;
        }

        const { osc, noteGain } = noteData;
        const now = this.audioContext.currentTime;

        try {
            // Cancel any scheduled changes
            noteGain.gain.cancelScheduledValues(now);

            // Get current gain value to prevent clicking
            const currentGain = noteGain.gain.value;
            noteGain.gain.setValueAtTime(currentGain, now);

            // Release: fade out quickly
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            // Stop oscillator after release
            osc.stop(now + 0.15);

            // Clean up the active notes map after release
            setTimeout(() => {
                // Only disconnect if this note is still the same one (prevent re-use issues)
                const currentNote = this.activeNotes.get(midi);
                if (currentNote && currentNote.osc === osc) {
                    try {
                        osc.disconnect();
                        noteGain.disconnect();
                    } catch (e) {
                        // Already disconnected, ignore
                    }
                    this.activeNotes.delete(midi);
                    this.activeNoteCount--;
                    this.updateSpeakerIcon();
                    console.log(`Stopped note ${midi}, active: ${this.activeNoteCount}`);
                }
            }, 200);
        } catch (error) {
            console.error(`Error stopping note ${midi}:`, error);
            // Force cleanup on error
            this.activeNotes.delete(midi);
            this.activeNoteCount--;
            this.updateSpeakerIcon();
        }
    }

    /**
     * Stop all currently playing notes (emergency stop)
     */
    stopAllNotes() {
        if (!this.isInitialized) {
            return;
        }

        console.log(`Emergency stop: stopping ${this.activeNotes.size} notes`);

        const now = this.audioContext.currentTime;
        const notesToStop = Array.from(this.activeNotes.entries());

        notesToStop.forEach(([midi, noteData]) => {
            const { osc, noteGain } = noteData;

            try {
                // Immediate stop with quick fade to prevent clicking
                noteGain.gain.cancelScheduledValues(now);
                noteGain.gain.setValueAtTime(noteGain.gain.value, now);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.stop(now + 0.1);

                setTimeout(() => {
                    try {
                        osc.disconnect();
                        noteGain.disconnect();
                    } catch (e) {
                        // Already disconnected
                    }
                }, 150);
            } catch (error) {
                console.error(`Error stopping note ${midi}:`, error);
            }
        });

        // Clear all notes immediately
        this.activeNotes.clear();
        this.activeNoteCount = 0;
        this.updateSpeakerIcon();

        console.log('All notes stopped');
    }

    /**
     * Update the speaker icon based on active notes
     */
    updateSpeakerIcon() {
        const speakerIcon = document.getElementById('speakerIcon');
        if (speakerIcon) {
            if (this.activeNoteCount > 0) {
                speakerIcon.classList.add('active');
            } else {
                speakerIcon.classList.remove('active');
            }
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

    /**
     * Get the number of currently playing notes
     */
    getActiveNoteCount() {
        return this.activeNoteCount;
    }
}

// Create global audio engine instance
const audioEngine = new AudioEngine();
