let sgSeq = [];
let sgUser = [];
let sgBtns = ["pink", "blue", "green", "purple"];
let sgLevel = 0;
let sgBest = 0;
let sgCanClick = false;
let sgStarted = false;
let sgAudio;

const sgTones = { pink: 261, blue: 329, green: 392, purple: 523 };

function sgGetAudio() {
  if (!sgAudio) sgAudio = new (window.AudioContext || window.webkitAudioContext)();
  return sgAudio;
}

function sgSound(color, dur = 0.28) {
  try {
    let c = sgGetAudio();
    let o = c.createOscillator();
    let g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = sgTones[color];
    o.type = "sine";
    g.gain.setValueAtTime(0.25, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.start();
    o.stop(c.currentTime + dur);
  } catch (e) {}
}

function sgGameOverSound() {
  try {
    let c = sgGetAudio();
    [220, 165, 110].forEach((f, i) => {
      let o = c.createOscillator();
      let g = c.createGain();
      o.connect(g);
      g.connect(c.destination);
      o.frequency.value = f;
      o.type = "sawtooth";
      g.gain.setValueAtTime(0.15, c.currentTime + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.15 + 0.15);
      o.start(c.currentTime + i * 0.15);
      o.stop(c.currentTime + i * 0.15 + 0.2);
    });
  } catch (e) {}
}

function sgFlash(id, cb) {
  let el = document.getElementById(id);
  el.classList.add("flash");
  sgSound(id);
  setTimeout(() => {
    el.classList.remove("flash");
    if (cb) cb();
  }, 350);
}

function sgStart() {
  if (sgStarted) return;
  sgStarted = true;
  sgSeq = [];
  sgUser = [];
  sgLevel = 0;
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("hintText").textContent = "Laptop flashes NEW color only — repeat the full sequence!";
  document.querySelectorAll(".game-btn").forEach(b => b.classList.remove("dim"));
  sgLevelUp();
}

function sgLevelUp() {
  sgUser = [];
  sgCanClick = false;
  sgLevel++;
  document.getElementById("levelDisplay").textContent = sgLevel;
  document.getElementById("centerText").textContent = sgLevel;
  document.getElementById("statusText").textContent = "Level " + sgLevel + " — new color added!";

  // Add only ONE new random color
  let r = sgBtns[Math.floor(Math.random() * 4)];
  sgSeq.push(r);

  // Flash ONLY the new (last) color
  setTimeout(() => {
    sgFlash(sgSeq[sgSeq.length - 1], () => {
      setTimeout(() => {
        sgCanClick = true;
        let total = sgSeq.length;
        document.getElementById("statusText").textContent =
          "Your turn! Repeat all " + total + " color" + (total > 1 ? "s" : "");
        document.getElementById("hintText").textContent =
          "Remember from color 1 to color " + total;
      }, 300);
    });
  }, 600);
}

function sgCheck(idx) {
  if (sgUser[idx] === sgSeq[idx]) {
    if (sgUser.length === sgSeq.length) {
      document.getElementById("statusText").textContent = "Perfect! Next level...";
      sgCanClick = false;
      setTimeout(sgLevelUp, 900);
    }
  } else {
    sgGameOverSound();
    let score = sgLevel - 1;
    if (score > sgBest) {
      sgBest = score;
      document.getElementById("bestDisplay").textContent = sgBest;
    }
    document.getElementById("statusText").textContent = "Game Over! Score: " + score;
    document.getElementById("centerText").textContent = "GAME\nOVER";
    document.getElementById("gameBoard").classList.add("shake");
    setTimeout(() => document.getElementById("gameBoard").classList.remove("shake"), 400);
    sgReset();
  }
}

function sgReset() {
  sgSeq = [];
  sgUser = [];
  sgStarted = false;
  sgCanClick = false;
  sgLevel = 0;
  document.getElementById("levelDisplay").textContent = 0;
  document.querySelectorAll(".game-btn").forEach(b => b.classList.add("dim"));
  setTimeout(() => {
    document.getElementById("centerText").textContent = "PRESS\nSTART";
    document.getElementById("hintText").textContent = "Laptop flashes NEW color only — you repeat ALL from memory!";
    document.getElementById("startBtn").style.display = "";
  }, 900);
}

document.querySelectorAll(".game-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    if (!sgCanClick) return;
    let id = this.getAttribute("id");
    sgFlash(id, null);
    sgUser.push(id);
    sgCheck(sgUser.length - 1);
  });
});
