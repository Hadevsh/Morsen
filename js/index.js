const keyMode = document.getElementById("key-mode");
let keyModeBin = false; // false - straight, true - paddle

keyMode.addEventListener("click", () => {
    keyModeBin = !keyModeBin;
    console.log("Mode:", keyModeBin ? "Paddle" : "Straight");
    
    // Show current mode
    if (keyModeBin) {
        keyMode.textContent = "Switch to Straight Key";
    } else {
        keyMode.textContent = "Switch to Paddle";
    }
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
    resetInterval = 1200 * (1 / (WPMval / 10));
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
    startCharacterSpacingBar(resetInterval);

    decodeTimer = setTimeout(() => {
        const decodedChar = morseToChar[currentMorse] || "�";
        currentOut += decodedChar;
        output.innerHTML = currentOut;
        currentMorse = "";
        userInput.innerHTML = "";
    }, resetInterval);
}

// Button click support (Every mode)
ditKey.addEventListener("mousedown", () => {
    playTone(ditDuration);
    queueMorse("•");
    ditKey.classList.add("active");
});

ditKey.addEventListener("mouseup", () => {
    ditKey.classList.remove("active");
});

dahKey.addEventListener("mousedown", () => {
    playTone(dahDuration);
    queueMorse("−");
    dahKey.classList.add("active");
});

dahKey.addEventListener("mouseup", () => {
    dahKey.classList.remove("active");
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
    
    // Paddle mode key handlers
    if (keyModeBin === true) {
        if (event.key === ",") {
            playTone(ditDuration);
            queueMorse("•");
            ditKey.classList.add("active");
            event.preventDefault();
        } else if (event.key === ".") {
            playTone(dahDuration);
            queueMorse("−");
            dahKey.classList.add("active");
            event.preventDefault();
        }
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

            queueMorse(symbol);
            console.log(`Key duration: ${duration.toFixed(0)} ms → ${symbol}`);
        }
    }
    
    if (keyModeBin === true) {
        if (event.key === "<") {
            ditKey.classList.remove("active");
            event.preventDefault();
        } else if (event.key === ">") {
            dahKey.classList.remove("active");
            event.preventDefault();
        }
    }
});

function startCharacterSpacingBar(duration) {
    const bar = document.getElementById("character-spacing");
    bar.style.transition = "none";
    bar.style.width = "15rem";
    void bar.offsetWidth;
    bar.style.transition = `width ${duration}ms linear`;
    bar.style.width = "0rem";
}

const backspace_btn = document.getElementById("backspace");
backspace_btn.addEventListener("click", () => {
    output.innerHTML = output.innerText.slice(0, output.innerText.length - 1);
    if (output.innerText == "") {
        output.innerHTML = `Start sending Morse...`;
    }
});