// --- Constants for workout timings (in seconds) ---
const WARMUP_DURATION = 300; // 5 minutes
const RUN_DURATION = 60;     // 1 minute
const WALK_DURATION = 60;    // 1 minute
const COOLDOWN_DURATION = 300; // 5 minutes

// --- DOM Element References ---
const weekDisplay = document.getElementById('week-display');
const weekUpBtn = document.getElementById('week-up-btn');
const weekDownBtn = document.getElementById('week-down-btn');
const statusDisplay = document.getElementById('status-display');
const timeDisplay = document.getElementById('time-display');
const repDisplay = document.getElementById('rep-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const audioPlayer = document.getElementById('audio-player');

// --- State Variables ---
let weekNumber = 1; // Our 'N'
let currentState = 'Ready'; // 'Ready', 'WarmUp', 'Run', 'Walk', 'CoolDown', 'Finished'
let timeRemaining = 0;
let currentRep = 0;
let timerInterval = null;
let isPaused = false;

// --- Main Timer Logic ---
function tick() {
    if (isPaused) return;

    timeRemaining--;
    updateUI();

    if (timeRemaining <= 0) {
        playSound();
        moveToNextState();
    }
}

// --- State Machine: The core program logic ---
function moveToNextState() {
    switch (currentState) {
        case 'WarmUp':
            currentState = 'Run';
            timeRemaining = RUN_DURATION;
            currentRep = 1;
            break;
        case 'Run':
            if (currentRep < weekNumber) {
                currentState = 'Walk';
                timeRemaining = WALK_DURATION;
            } else {
                currentState = 'CoolDown';
                timeRemaining = COOLDOWN_DURATION;
            }
            break;
        case 'Walk':
            currentState = 'Run';
            timeRemaining = RUN_DURATION;
            currentRep++;
            break;
        case 'CoolDown':
            currentState = 'Finished';
            clearInterval(timerInterval);
            break;
    }
    updateUI();
}

// --- Control Functions ---
function startWorkout() {
    currentState = 'WarmUp';
    timeRemaining = WARMUP_DURATION;
    currentRep = 0;
    isPaused = false;
    
    // Clear any existing timer before starting a new one
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(tick, 1000);
    updateUI();
}

function pauseResumeWorkout() {
    isPaused = !isPaused;
    updateUI();
}

function resetWorkout() {
    clearInterval(timerInterval);
    timerInterval = null;
    currentState = 'Ready';
    timeRemaining = 0;
    currentRep = 0;
    isPaused = false;
    updateUI();
}

// --- UI and Helper Functions ---
function updateUI() {
    // Update Time Display
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const seconds = (timeRemaining % 60).toString().padStart(2, '0');
    timeDisplay.textContent = `${minutes}:${seconds}`;

    // Update Status and Rep Displays
    repDisplay.textContent = ''; // Clear by default
    switch (currentState) {
        case 'Ready':
            statusDisplay.textContent = 'Ready to Start';
            break;
        case 'WarmUp':
            statusDisplay.textContent = 'Warm-Up Walk';
            break;
        case 'Run':
            statusDisplay.textContent = 'RUN';
            repDisplay.textContent = `Repetition ${currentRep} of ${weekNumber}`;
            break;
        case 'Walk':
            statusDisplay.textContent = 'Walk';
            repDisplay.textContent = `Repetition ${currentRep} of ${weekNumber}`;
            break;
        case 'CoolDown':
            statusDisplay.textContent = 'Cool-Down Walk';
            break;
        case 'Finished':
            statusDisplay.textContent = 'Workout Complete!';
            break;
    }

    // Update Week Selector
    weekDisplay.textContent = `Week ${weekNumber} (N = ${weekNumber} reps)`;
    const isWorkoutRunning = currentState !== 'Ready' && currentState !== 'Finished';
    weekUpBtn.disabled = isWorkoutRunning;
    weekDownBtn.disabled = isWorkoutRunning || weekNumber <= 1;
    
    // Update Control Buttons
    resetBtn.disabled = !isWorkoutRunning && currentState !== 'Finished';
    if (currentState === 'Ready' || currentState === 'Finished') {
        startPauseBtn.textContent = 'START';
        startPauseBtn.className = 'control-btn start-btn';
    } else {
        startPauseBtn.textContent = isPaused ? 'RESUME' : 'PAUSE';
        startPauseBtn.className = isPaused ? 'control-btn start-btn' : 'control-btn pause-btn';
    }
}

function playSound() {
    audioPlayer.currentTime = 0;
    audioPlayer.play();

    // Set a timer to stop the sound after 500 milliseconds (0.5 seconds)
    setTimeout(() => {
        audioPlayer.pause(); // The .pause() method stops playback
    }, 5000); // The time in milliseconds
}

// --- Event Listeners ---
startPauseBtn.addEventListener('click', () => {
    if (currentState === 'Ready' || currentState === 'Finished') {
        startWorkout();
    } else {
        pauseResumeWorkout();
    }
});

resetBtn.addEventListener('click', resetWorkout);

weekUpBtn.addEventListener('click', () => {
    weekNumber++;
    updateUI();
});

weekDownBtn.addEventListener('click', () => {
    if (weekNumber > 1) {
        weekNumber--;
        updateUI();
    }
});

// --- Initial UI setup on page load ---
window.onload = updateUI;
