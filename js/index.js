const keyMode = document.getElementById("key-mode");
let keyModeBin = 0; // 0 - straight, 1 - paddle

keyMode.addEventListener("click", () => {
    keyModeBin = !keyModeBin;
    console.log(keyModeBin);
})