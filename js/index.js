const keyMode = document.getElementById("key-mode");
let keyModeBin = 0; // 0 - straight, 1 - paddle

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

let WPM = 20; // Words per minute (paddle)
let ditDuration = 1200 / WPM; // 1 unit
let dahDuration = ditDuration * 3; // 3 units

ditKey.addEventListener("click", () => {
    playTone(ditDuration);
})

dahKey.addEventListener("click", () => {
    playTone(dahDuration);
})