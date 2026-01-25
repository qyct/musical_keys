/**
 * Recording System for Qwertica Piano
 * Handles event recording, playback, and save/load functionality
 */

class RecordingSystem {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.isRecording = false;
        this.isPlaying = false;
        this.recordedEvents = [];
        this.recordingStartTime = 0;
        this.playbackTimeouts = [];
    }

    /**
     * Start recording
     */
    startRecording() {
        if (this.isRecording) {
            console.warn('Already recording');
            return;
        }

        this.isRecording = true;
        this.recordedEvents = [];
        this.recordingStartTime = performance.now();

        console.log('Recording started');
        return this.isRecording;
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.isRecording) {
            console.warn('Not recording');
            return;
        }

        this.isRecording = false;

        console.log('Recording stopped. Events recorded:', this.recordedEvents.length);
        return this.recordedEvents;
    }

    /**
     * Record a note event
     * @param {Object} event - Event object with type, note, velocity, timestamp
     */
    recordEvent(event) {
        if (!this.isRecording) {
            return;
        }

        // Adjust timestamp to be relative to recording start
        const adjustedEvent = {
            ...event,
            timestamp: event.timestamp - this.recordingStartTime
        };

        this.recordedEvents.push(adjustedEvent);
    }

    /**
     * Check if currently recording
     */
    isCurrentlyRecording() {
        return this.isRecording;
    }

    /**
     * Check if there are recorded events
     */
    hasRecording() {
        return this.recordedEvents.length > 0;
    }

    /**
     * Get the number of recorded events
     */
    getEventCount() {
        return this.recordedEvents.length;
    }

    /**
     * Play back the recorded events
     */
    playRecording() {
        if (this.isPlaying) {
            console.warn('Already playing');
            return;
        }

        if (!this.hasRecording()) {
            console.warn('No recording to play');
            return;
        }

        this.isPlaying = true;
        this.playbackTimeouts = [];

        console.log('Playing recording...');

        // Schedule each event
        this.recordedEvents.forEach((event, index) => {
            const timeoutId = setTimeout(() => {
                if (event.type === 'noteOn') {
                    this.audioEngine.playNote(event.note, event.velocity);
                    // Visual feedback
                    this.visualizeNote(event.note, true);
                } else if (event.type === 'noteOff') {
                    this.audioEngine.stopNote(event.note);
                    // Visual feedback
                    this.visualizeNote(event.note, false);
                }

                // Check if this is the last event
                if (index === this.recordedEvents.length - 1) {
                    // Wait a bit after last event, then stop
                    setTimeout(() => {
                        this.stopPlayback();
                    }, 500);
                }
            }, event.timestamp);

            this.playbackTimeouts.push(timeoutId);
        });

        return this.isPlaying;
    }

    /**
     * Stop playback
     */
    stopPlayback() {
        if (!this.isPlaying) {
            return;
        }

        // Clear all pending timeouts
        this.playbackTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.playbackTimeouts = [];

        // Stop all notes
        this.audioEngine.stopAllNotes();

        this.isPlaying = false;
        console.log('Playback stopped');
    }

    /**
     * Check if currently playing
     */
    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    /**
     * Provide visual feedback during playback
     */
    visualizeNote(midi, activate) {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const keyMidi = parseInt(key.dataset.note);
            if (keyMidi === midi) {
                if (activate) {
                    key.classList.add('active');
                } else {
                    key.classList.remove('active');
                }
            }
        });
    }

    /**
     * Save recording to JSON file
     */
    saveRecording() {
        if (!this.hasRecording()) {
            console.warn('No recording to save');
            return null;
        }

        const recordingData = {
            version: '1.0',
            date: new Date().toISOString(),
            duration: this.recordedEvents[this.recordedEvents.length - 1].timestamp,
            eventCount: this.recordedEvents.length,
            events: this.recordedEvents
        };

        const json = JSON.stringify(recordingData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `qwertica-recording-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Recording saved');
        return recordingData;
    }

    /**
     * Load recording from JSON file
     * @param {File} file - JSON file to load
     */
    async loadRecording(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    // Validate data structure
                    if (!data.events || !Array.isArray(data.events)) {
                        throw new Error('Invalid recording format');
                    }

                    this.recordedEvents = data.events;

                    console.log('Recording loaded:', {
                        date: data.date,
                        duration: data.duration,
                        eventCount: data.eventCount
                    });

                    resolve(data);
                } catch (error) {
                    console.error('Failed to load recording:', error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Clear the current recording
     */
    clearRecording() {
        this.recordedEvents = [];
        console.log('Recording cleared');
    }

    /**
     * Get recording info
     */
    getRecordingInfo() {
        if (!this.hasRecording()) {
            return null;
        }

        const lastEvent = this.recordedEvents[this.recordedEvents.length - 1];
        return {
            eventCount: this.recordedEvents.length,
            duration: lastEvent ? lastEvent.timestamp : 0
        };
    }
}

// Create global recording system instance
let recordingSystem;
