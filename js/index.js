const keyMode = document.getElementById("key-mode");
let keyModeBin = false; // false - straight, true - paddle

keyMode.addEventListener("click", () => {
    keyModeBin = !keyModeBin;
    console.log("Mode:", keyModeBin ? "Paddle" : "Straight");
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(duration = 100) {
    const oscillator = audioCtx.createOscillator();
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}

const ditKey = document.getElementById("dit");
const dahKey = document.getElementById("dah");
const WPM = document.getElementById("wpm");
const userInput = document.getElementById("input");
const output = document.getElementById("output");

let WPMval = WPM.value;
let ditDuration = 1200 / WPMval;
let dahDuration = ditDuration * 3;
let resetInterval = 1200 * (1 / (WPMval / 10)); // 3 unit pause for character separation
let ditDahThreshold = ditDuration * 2;

WPM.addEventListener("change", () => {
    WPMval = WPM.value;
    ditDuration = 1200 / WPMval;
    dahDuration = ditDuration * 3;
    ditDahThreshold = ditDuration * 1.5;
    resetInterval = 1200 * (1 / (WPMval / 10)); // Modified by WPM val
});

const morseToChar = {
    "•−": "A",   "−•••": "B", "−•−•": "C", "−••": "D",  "•": "E",
    "••−•": "F", "−−•": "G",  "••••": "H", "••": "I",   "•−−−": "J",
    "−•−": "K",  "•−••": "L", "−−": "M",   "−•": "N",   "−−−": "O",
    "•−−•": "P", "−−•−": "Q", "•−•": "R",  "•••": "S",  "−": "T",
    "••−": "U",  "•••−": "V", "•−−": "W",  "−••−": "X", "−•−−": "Y",
    "−−••": "Z",
    "•−−−−": "1", "••−−−": "2", "•••−−": "3", "••••−": "4", "•••••": "5",
    "−••••": "6", "−−•••": "7", "−−−••": "8", "−−−−•": "9", "−−−−−": "0"
};

let currentMorse = "";
let currentOut = "";
let decodeTimer = null;

function queueMorse(symbol) {
    currentMorse += symbol;
    userInput.innerHTML = currentMorse;

    clearTimeout(decodeTimer);
    startCharacterSpacingBar(resetInterval); // Visualize spacing timer

    decodeTimer = setTimeout(() => {
        const decodedChar = morseToChar[currentMorse] || "�";
        currentOut += decodedChar;
        output.innerHTML = currentOut;
        currentMorse = "";
        userInput.innerHTML = "";
    }, resetInterval);
}

// Button click support (Paddle mode)
ditKey.addEventListener("click", () => {
    playTone(ditDuration);
    queueMorse("•");
});

dahKey.addEventListener("click", () => {
    playTone(dahDuration);
    queueMorse("−");
});

// Straight keying (Spacebar)
let oscillator = null;
let keyDownTime = 0;

document.addEventListener("keydown", function (event) {
    if (keyModeBin === false && (event.key === " " || event.key === "Spacebar")) {
        if (!oscillator) {
            oscillator = audioCtx.createOscillator();
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            keyDownTime = performance.now();
        }
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    if (keyModeBin === false && (event.key === " " || event.key === "Spacebar")) {
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;

            const keyUpTime = performance.now();
            const duration = keyUpTime - keyDownTime;
            const symbol = duration < ditDahThreshold ? "•" : "−";

            // playTone(duration);
            queueMorse(symbol);

            console.log(`Key duration: ${duration.toFixed(0)} ms → ${symbol}`);
        }
    }
});

function startCharacterSpacingBar(duration) {
    const bar = document.getElementById("character-spacing");
    bar.style.transition = "none"; // Reset transition
    bar.style.width = "15rem";     // Reset width instantly

    // Trigger reflow to apply the reset before animating again
    void bar.offsetWidth;

    bar.style.transition = `width ${duration}ms linear`;
    bar.style.width = "0rem"; // Animate to 0 over duration
}