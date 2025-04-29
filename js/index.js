const keyMode = document.getElementById("key-mode");
let keyModeBin = false; // false - straight, true - paddle

keyMode.addEventListener("click", () => {
    keyModeBin = !keyModeBin;
    console.log(keyModeBin);
})

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(duration = 100) {
    const oscillator = audioCtx.createOscillator();
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // 600Hz tone
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}

const ditKey = document.getElementById("dit");
const dahKey = document.getElementById("dah");
const WPM = document.getElementById("wpm"); // Words per minute (paddle)
const userInput = document.getElementById("input");

let WPMval = WPM.value;
let ditDuration = 1200 / WPMval; // 1 unit
let dahDuration = ditDuration * 3; // 3 units

WPM.addEventListener("change", () => {
    WPMval = document.getElementById("wpm").value;
    ditDuration = 1200 / WPMval; // 1 unit
    dahDuration = ditDuration * 3; // 3 units
});

let keyerDown = 0;
let keyerUp = 0;
let resetInteval = 1200; // 1 unit between characters (but stay 1200 because to fast)

ditKey.addEventListener("click", () => {
    keyerUp = performance.now();
    if (userInput.innerHTML === "Dit ..dit" || (keyerUp-keyerDown) >= resetInteval) { 
        userInput.innerHTML = ``;
    }
    userInput.innerHTML += `•`;
    playTone(ditDuration);
    keyerDown = performance.now();
});

dahKey.addEventListener("click", () => {
    keyerUp = performance.now();
    if (userInput.innerHTML === "Dit ..dit" || (keyerUp-keyerDown) >= resetInteval) { userInput.innerHTML = `` }
    userInput.innerHTML += `−`;
    playTone(dahDuration);
    keyerDown = performance.now();
});

let oscillator = null;
let keyDownTime = 0;

console.log()

document.addEventListener("keydown", function(event) {
    if (keyModeBin === false && (event.key === " " || event.key === "Spacebar")) {
        if (!oscillator) {
            // Start tone on keydown
            oscillator = audioCtx.createOscillator();
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            keyDownTime = performance.now(); // Record time for duration if needed
        }
        event.preventDefault(); // Prevent page scroll
    }
});

document.addEventListener("keyup", function(event) {
    if (keyModeBin === false && (event.key === " " || event.key === "Spacebar")) {
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;

            const keyUpTime = performance.now();
            const duration = keyUpTime - keyDownTime;

            // Optional: log or use duration to detect dit vs dah
            console.log(`Straight key duration: ${duration.toFixed(0)} ms`);
        }
    }
});