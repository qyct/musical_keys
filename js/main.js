/**
 * Main Application Initialization for Qwertica Keys
 * Wires up all modules and handles UI interactions
 */

// Global state
let isStarted = false;

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Initializing Qwertica Keys...');

    // Initialize modules
    await audioEngine.init();
    inputHandler = new InputHandler(audioEngine);
    inputHandler.init();
    recordingSystem = new RecordingSystem(audioEngine);

    // Connect recorder to input handler
    inputHandler.setRecorderCallback((event) => {
        recordingSystem.recordEvent(event);
    });

    // Wire up UI controls
    setupRecordingControls();

    // Auto-initialize audio on first keypress
    setupAutoInit();

    console.log('Qwertica Keys initialized successfully');
}

/**
 * Set up recording controls
 */
function setupRecordingControls() {
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playBtn = document.getElementById('playBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadFile = document.getElementById('loadFile');
    const recordingStatus = document.getElementById('recordingStatus');

    // Record button
    recordBtn.addEventListener('click', () => {
        recordingSystem.startRecording();
        recordBtn.classList.add('recording');
        recordBtn.textContent = 'Recording...';
        stopBtn.disabled = false;
        playBtn.disabled = true;
        saveBtn.disabled = true;
        recordingStatus.textContent = 'Recording in progress...';
        recordingStatus.classList.add('recording');
    });

    // Stop button
    stopBtn.addEventListener('click', () => {
        const events = recordingSystem.stopRecording();
        recordBtn.classList.remove('recording');
        recordBtn.textContent = 'Record';

        if (events.length > 0) {
            playBtn.disabled = false;
            saveBtn.disabled = false;
            recordingStatus.textContent = `Recording saved: ${events.length} events`;
        } else {
            recordingStatus.textContent = 'No events recorded';
        }
        recordingStatus.classList.remove('recording');
    });

    // Play button
    playBtn.addEventListener('click', () => {
        recordingSystem.playRecording();
        playBtn.classList.add('playing');
        playBtn.textContent = 'Playing...';
        stopBtn.disabled = true;
        recordBtn.disabled = true;
        recordingStatus.textContent = 'Playing recording...';
    });

    // Listen for playback end
    const checkPlaybackEnd = setInterval(() => {
        if (!recordingSystem.isCurrentlyPlaying() && playBtn.classList.contains('playing')) {
            playBtn.classList.remove('playing');
            playBtn.textContent = 'Play';
            stopBtn.disabled = false;
            recordBtn.disabled = false;
            recordingStatus.textContent = 'Playback finished';
        }
    }, 100);

    // Save button
    saveBtn.addEventListener('click', () => {
        recordingSystem.saveRecording();
        recordingStatus.textContent = 'Recording saved to file';
    });

    // Load file input
    loadFile.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await recordingSystem.loadRecording(file);
            const info = recordingSystem.getRecordingInfo();
            playBtn.disabled = false;
            saveBtn.disabled = false;
            recordingStatus.textContent = `Loaded: ${info.eventCount} events, ${Math.round(info.duration / 1000)}s`;
        } catch (error) {
            recordingStatus.textContent = 'Failed to load recording';
            console.error('Load error:', error);
        }

        // Reset file input
        event.target.value = '';
    });
}

/**
 * Set up auto-initialization on first interaction
 */
function setupAutoInit() {
    const initAudio = async () => {
        if (!audioEngine.isReady()) {
            await audioEngine.init();
            await audioEngine.resume();
            isStarted = true;
            console.log('Audio context started');

            // Remove listeners after first init
            document.removeEventListener('keydown', initAudio);
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        }
    };

    // Initialize on first interaction
    document.addEventListener('keydown', initAudio, { once: true });
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
}

/**
 * Handle cleanup on page unload
 */
function cleanup() {
    if (audioEngine) {
        audioEngine.stopAllNotes();
    }
    if (inputHandler) {
        inputHandler.stopAllNotes();
    }
    if (recordingSystem) {
        recordingSystem.stopPlayback();
    }
    console.log('Cleaned up resources');
}

// Set up cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause/resume audio context as needed
        if (audioEngine && audioEngine.audioContext) {
            if (audioEngine.audioContext.state === 'running') {
                audioEngine.audioContext.suspend();
            }
        }
    } else {
        if (audioEngine && audioEngine.audioContext) {
            if (audioEngine.audioContext.state === 'suspended') {
                audioEngine.audioContext.resume();
            }
        }
    }
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for debugging (optional)
if (typeof window !== 'undefined') {
    window.QwerticaKeys = {
        audioEngine,
        inputHandler,
        recordingSystem
    };
}
