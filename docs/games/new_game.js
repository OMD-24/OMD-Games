// Game State
// Game State
let gameState = {
  mode: null,
  isGreenLight: false,
  isGameActive: false,
  players: {},
  gameStartTime: 0,
  currentTimer: 30.0,
  lightChangeTimeout: null,
  gameInterval: null,
  botIntervals: [],
  eliminatedPlayers: [],
  winner: null,
  botMoveSchedules: {}, // Added for bot schedule arrays
  redLightCount: 0,
  botDeathSchedule: {},
};

// Configuration
const config = {
  gameTime: 30.0,
  moveDistance: 2.5,
  greenLightDuration: { min: 2000, max: 5000 },
  redLightDuration: { min: 1500, max: 4000 },
  eliminationDelay: 300,
  finishLineY: 90,
  startingLineY: 15,
  redLightSurvivalChance: 0.25,
  botScheduleLength: 225, // Number of 200ms ticks (45s / 0.2s)
  botDecisionInterval: 200,
};

function init() {
  showModeSelection();
  setupEventListeners();
}

function setupEventListeners() {
  document.querySelectorAll(".control-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const player = btn.dataset.player;
      const direction = btn.dataset.dir;
      movePlayer(player, direction);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!gameState.isGameActive) return;

    const keyMap = {
      ArrowUp: ["player2", "up"],
      ArrowDown: ["player2", "down"],
      ArrowLeft: ["player2", "left"],
      ArrowRight: ["player2", "right"],
      w: ["player1", "up"],
      s: ["player1", "down"],
      a: ["player1", "left"],
      d: ["player1", "right"],
    };

    if (gameState.mode === "single") {
      const singleKeyMap = {
        w: ["player", "up"],
        s: ["player", "down"],
        a: ["player", "left"],
        d: ["player", "right"],
      };
      const input = singleKeyMap[e.key.toLowerCase()];
      if (input) movePlayer(input[0], input[1]);
    } else {
      const input = keyMap[e.key];
      if (input) movePlayer(input[0], input[1]);
    }
  });
}

function showModeSelection() {
  document.getElementById("modeModal").classList.remove("hidden");
}

function selectMode(mode) {
  gameState.mode = mode;
  document.getElementById("modeModal").classList.add("hidden");
  initializeGame();
}
// Updated initialization with realistic bot death schedule
function initializeGame() {
  // Remove existing players
  document.querySelectorAll(".player").forEach((p) => p.remove());

  // Reset game state
  gameState.players = {};
  gameState.eliminatedPlayers = [];
  gameState.winner = null;
  gameState.isGameActive = false;
  gameState.isGreenLight = false;
  gameState.currentTimer = config.gameTime;
  gameState.redLightCount = 0;
  gameState.botDeathSchedule = {};

  // Clear timers and intervals
  gameState.botIntervals.forEach((i) => clearInterval(i));
  gameState.botIntervals = [];

  clearTimeout(gameState.lightChangeTimeout);
  clearInterval(gameState.gameInterval);

  // Create players based on mode
  if (gameState.mode === "single") {
    createSinglePlayerGame();
  } else {
    createMultiplayerGame();
  }

  // Create realistic bot elimination schedule
  // Bots will be eliminated by "bad luck" not by moving during red light
  createRealisticBotSchedule();

  showControls();
  startGame();
}

function createSinglePlayerGame() {
  createPlayer("player", "player-human", 50, "You");
  [20, 35, 65, 80].forEach((pos, i) => {
    createPlayer(`bot${i + 1}`, "player-bot", pos, `Bot ${i + 1}`);
  });
}

function createMultiplayerGame() {
  createPlayer("player1", "player-human", 35, "Player 1");
  createPlayer("player2", "player-human2", 65, "Player 2");
  [20, 50, 80].forEach((pos, i) => {
    createPlayer(`bot${i + 1}`, "player-bot", pos, `Bot ${i + 1}`);
  });
}

function createPlayer(id, className, x, name) {
  const player = document.createElement("div");
  player.id = id;
  player.className = `player ${className}`;
  player.style.left = x + "%";
  player.style.bottom = config.startingLineY + "%";

  player.innerHTML = `
        <div class="character">
            <div class="character-head"></div>
            <div class="character-body"></div>
            <div class="character-legs"></div>
        </div>
    `;

  document.querySelector(".game-field").appendChild(player);

  gameState.players[id] = {
    x: x,
    y: config.startingLineY,
    name: name,
    isBot: id.startsWith("bot"),
    isMoving: false,
    lastMoveTime: 0,
    moveCount: 0,
    eliminated: false,
    finished: false, // <- Add this
    element: player,
  };
}

function showControls() {
  document
    .querySelectorAll(".controls")
    .forEach((ctrl) => ctrl.classList.add("hidden"));
  if (gameState.mode === "single") {
    document.getElementById("singlePlayerControls").classList.remove("hidden");
  } else {
    document
      .getElementById("multiplayerControlsLeft")
      .classList.remove("hidden");
    document
      .getElementById("multiplayerControlsRight")
      .classList.remove("hidden");
  }
}

function startGame() {
  gameState.isGameActive = true;
  gameState.currentTimer = config.gameTime;

  updateUI();
  createProgressBars();

  gameState.gameInterval = setInterval(() => {
    if (gameState.currentTimer <= 0) {
      endGame("timeout");
      return;
    }

    gameState.currentTimer -= 0.1;
    updateUI();
  }, 100);

  gameState.isGreenLight = true;
  showGreenLight();
  scheduleNextLightChange();
  startBotAI();
}

function updateUI() {
  document.getElementById("timer").textContent =
    gameState.currentTimer.toFixed(1);
  const alive = Object.values(gameState.players).filter(
    (p) => !p.eliminated
  ).length;
  document.getElementById("playersAlive").textContent = alive;

  Object.entries(gameState.players).forEach(([id, player]) => {
    if (!player.isBot) {
      const progress =
        ((player.y - config.startingLineY) /
          (config.finishLineY - config.startingLineY)) *
        100;
      const bar = document.getElementById(`progress-${id}`);
      const text = document.getElementById(`progress-text-${id}`);
      if (bar && text) {
        bar.style.height = `${progress}%`;
        text.textContent = `${Math.round(progress)}%`;
      }
    }
  });
}
function showGreenLight() {
  playSound("greenSound");
  document.getElementById("gameStatus").textContent = "GO!";

  document.getElementById("lightRed").classList.remove("active");
  document.getElementById("lightGreen").classList.add("active");

  document.getElementById("dollImage").innerHTML = getNeutralDollHTML();
}

// Updated red light handler to check for bot mistakes
// Add debug logging to see what's happening
function showRedLight() {
  gameState.redLightCount++;
  console.log("Red light #", gameState.redLightCount); // Debug log

  playSound("redSound");
  document.getElementById("gameStatus").textContent = "STOP!";

  document.getElementById("lightGreen").classList.remove("active");
  document.getElementById("lightRed").classList.add("active");

  document.getElementById("dollImage").innerHTML = getAngryDollHTML();

  setTimeout(() => {
    if (!gameState.isGreenLight) {
      checkForMovingPlayers(); // Check human players
      handleScheduledBotDeaths(); // Handle bot eliminations separately
    }
  }, config.eliminationDelay);
}

//.......................
// Updated elimination handler - bots get eliminated by "unlucky moments"
// Add more debug logging
function handleScheduledBotDeaths() {
  console.log("Checking for bot deaths at round", gameState.redLightCount); // Debug log

  Object.entries(gameState.players).forEach(([id, p]) => {
    if (p.isBot && !p.eliminated && !p.finished) {
      const deathRound = gameState.botDeathSchedule[id];
      console.log(
        `Bot ${id} scheduled for round ${deathRound}, current round ${gameState.redLightCount}`
      ); // Debug log

      // Only eliminate if it's their scheduled round AND during red light
      if (gameState.redLightCount === deathRound && !gameState.isGreenLight) {
        // Add some randomness - simulate "unlucky moment"
        if (Math.random() < 0.7) {
          // 70% chance of elimination
          console.log(
            `Eliminating bot ${id} in round ${gameState.redLightCount}`
          ); // Debug log
          simulateBotMistake(id);
        }
      }
    }
  });
}

function getNeutralDollHTML() {
  return `<div class="relative w-[100px] h-[100px] bg-black rounded-full flex items-center justify-center">
    <div class="absolute top-[35%] left-[24%] w-[14px] h-[14px] bg-black rounded-full"></div>
    <div class="absolute top-[35%] right-[24%] w-[14px] h-[14px] bg-black rounded-full"></div>
    <div class="absolute bottom-[24%] left-1/2 transform -translate-x-1/2 w-[36px] h-[6px] bg-[#000000] rounded-full"></div>
  </div>`;
}

function getAngryDollHTML() {
  return `<div class="relative w-[100px] h-[100px] bg-yellow-200 rounded-full flex items-center justify-center">
    <div class="absolute top-[35%] left-[24%] w-[16px] h-[16px] bg-red-600 rounded-full"></div>
    <div class="absolute top-[35%] right-[24%] w-[16px] h-[16px] bg-red-600 rounded-full"></div>
    <div class="absolute top-[28%] left-[20%] w-[26px] h-[5px] bg-black rotate-[-45deg] rounded-full"></div>
    <div class="absolute top-[28%] right-[20%] w-[26px] h-[5px] bg-black rotate-[45deg] rounded-full"></div>
    <div class="absolute bottom-[24%] left-1/2 transform -translate-x-1/2 w-[36px] h-[6px] bg-[#000000] rounded-full"></div>
  </div>`;
}

function createProgressBars() {
  const panel = document.getElementById("progressPanel");
  panel.innerHTML = "";
  Object.entries(gameState.players).forEach(([id, p]) => {
    if (!p.isBot) {
      const bar = document.createElement("div");
      bar.className = "progress-container";
      bar.innerHTML = `
        <div class="progress-name">${p.name}</div>
        <div class="progress-bar-vertical">
          <div class="progress-fill-vertical" id="progress-${id}"></div>
        </div>
        <div class="progress-text-vertical" id="progress-text-${id}">0%</div>
      `;
      panel.appendChild(bar);
    }
  });
}

function scheduleNextLightChange() {
  if (!gameState.isGameActive) return;
  const delay = gameState.isGreenLight
    ? randomBetween(
        config.greenLightDuration.min,
        config.greenLightDuration.max
      )
    : randomBetween(config.redLightDuration.min, config.redLightDuration.max);

  gameState.lightChangeTimeout = setTimeout(() => {
    gameState.isGreenLight = !gameState.isGreenLight;
    gameState.isGreenLight ? showGreenLight() : showRedLight();
    scheduleNextLightChange();
  }, delay);
}

// Also update checkForMovingPlayers to only check human players
function checkForMovingPlayers() {
  Object.entries(gameState.players).forEach(([id, p]) => {
    // Only check human players for red light violations
    if (
      !p.eliminated &&
      !p.finished && // ✅ Don't eliminate finished players
      !p.isBot && // Only check human players
      (p.isMoving || Date.now() - p.lastMoveTime < config.eliminationDelay)
    ) {
      eliminatePlayer(id);
    }
  });
}

function movePlayer(id, direction) {
  const p = gameState.players[id];
  if (!gameState.isGameActive || !p || p.eliminated) return;

  p.lastMoveTime = Date.now();
  p.isMoving = true;

  if (!p.isBot) {
    p.element.classList.add("bounce");
    setTimeout(() => {
      p.element.classList.remove("bounce");
      p.isMoving = false;
    }, 200);
  } else {
    // For bots, reset isMoving after a short delay
    setTimeout(() => {
      p.isMoving = false;
    }, 200);
  }

  // CRITICAL FIX: Only eliminate HUMAN players for moving during red light
  // Bots are eliminated only through their scheduled death system
  if (!gameState.isGreenLight && !p.isBot && !p.finished) {
    eliminatePlayer(id);
    return;
  }

  // If it's a bot moving during red light, ignore the movement
  // (this shouldn't happen with our smart AI, but just in case)
  if (!gameState.isGreenLight && p.isBot) {
    return;
  }

  // Normal movement logic for green light
  switch (direction) {
    case "up":
      p.y = Math.min(config.finishLineY, p.y + config.moveDistance);
      break;
    case "down":
      p.y = Math.max(config.startingLineY, p.y - config.moveDistance);
      break;
    case "left":
      p.x = Math.max(5, p.x - config.moveDistance);
      break;
    case "right":
      p.x = Math.min(95, p.x + config.moveDistance);
      break;
  }

  p.element.style.left = p.x + "%";
  p.element.style.bottom = p.y + "%";

  if (p.y >= config.finishLineY && !p.finished) {
    p.finished = true;
    p.element.classList.add("finished");

    if (!p.isBot) {
      showVictoryScreen(p.name); // Immediately show victory for human
    } else {
      checkForGameCompletion(); // Let bot finish silently
    }
  }

  updateUI();
}

//......................................
function checkForGameCompletion() {
  const allPlayers = Object.values(gameState.players);
  const allDone = allPlayers.every((p) => p.eliminated || p.finished);

  if (allDone || gameState.currentTimer <= 0) {
    const humans = allPlayers.filter((p) => !p.isBot);
    const winners = humans.filter((p) => p.finished);

    if (winners.length > 0) {
      const winnerNames = winners.map((p) => p.name).join(" & ");
      showVictoryScreen(winnerNames);
    } else {
      triggerGameOver("You couldn't cross finish line!");
    }
  }
}

function showVictoryScreen(winnerNames) {
  gameState.isGameActive = false;
  clearInterval(gameState.gameInterval);
  clearTimeout(gameState.lightChangeTimeout);
  gameState.botIntervals.forEach((i) => clearInterval(i));

  document.getElementById("victoryMessage").textContent = `${winnerNames} win!`;
  document.getElementById("victoryModal").classList.remove("hidden");
}

function eliminatePlayer(id) {
  const p = gameState.players[id];
  if (!p || p.eliminated) return;

  playSound("eliminateSound");

  p.eliminated = true;
  p.element.classList.add("eliminated");
  gameState.eliminatedPlayers.push(id);

  // 🔍 Check elimination conditions
  if (gameState.mode === "single") {
    if (id === "player") {
      // Player lost — show Game Over
      triggerGameOver("You were eliminated!");
    }
  } else if (gameState.mode === "multi") {
    const p1Eliminated = gameState.players["player1"]?.eliminated;
    const p2Eliminated = gameState.players["player2"]?.eliminated;

    if (p1Eliminated && p2Eliminated) {
      // Both players lost — show Game Over
      triggerGameOver("Both players were eliminated!");
    }
  }
}

function triggerGameOver(message) {
  gameState.isGameActive = false;

  clearTimeout(gameState.lightChangeTimeout);
  clearInterval(gameState.gameInterval);
  gameState.botIntervals.forEach((i) => clearInterval(i));

  document.getElementById("gameOverMessage").textContent = message;
  document.getElementById("gameOverModal").classList.remove("hidden");
}

function victory(id) {
  gameState.isGameActive = false;
  clearInterval(gameState.gameInterval);
  clearTimeout(gameState.lightChangeTimeout);
  gameState.botIntervals.forEach((i) => clearInterval(i));
  gameState.winner = id;

  const winner = gameState.players[id];
  document.getElementById(
    "victoryMessage"
  ).textContent = `${winner.name} wins!`;
  document.getElementById("victoryModal").classList.remove("hidden");
}

function endGame(reason) {
  gameState.isGameActive = false;
  clearInterval(gameState.gameInterval);
  clearTimeout(gameState.lightChangeTimeout);
  gameState.botIntervals.forEach((i) => clearInterval(i));

  checkForGameCompletion(); // check for finished players before showing result
}

function restartGame() {
  document.getElementById("victoryModal").classList.add("hidden");
  document.getElementById("gameOverModal").classList.add("hidden");
  initializeGame();
}

// Completely rewritten Bot AI - Bots behave like real smart players
function startBotAI() {
  Object.entries(gameState.players).forEach(([id, bot]) => {
    if (!bot.isBot) return;

    const interval = setInterval(() => {
      if (!gameState.isGameActive || bot.eliminated) return;

      // Bots are smart - they only move during GREEN light
      if (gameState.isGreenLight) {
        // Each bot has different movement probability to create variety
        const moveProbability = getBotMoveProbability(id);

        if (Math.random() < moveProbability) {
          movePlayer(id, "up");
        }
      }
      // During RED light, bots are completely still (like real players)
      // They NEVER move during red light - this prevents first round eliminations
    }, config.botDecisionInterval);

    gameState.botIntervals.push(interval);
  });
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.selectMode = selectMode;
window.restartGame = restartGame;
window.showModeSelection = showModeSelection;

init();

function playSound(soundId) {
  const allSounds = ["greenSound", "redSound", "eliminateSound"];
  allSounds.forEach((id) => {
    const audio = document.getElementById(id);
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  const newSound = document.getElementById(soundId);
  if (newSound) {
    newSound.currentTime = 0;
    newSound.play();
  }
}

function getBotMoveProbability(botId) {
  const botPersonalities = {
    bot1: 0.4, // Aggressive bot
    bot2: 0.25, // Cautious bot
    bot3: 0.35, // Moderate bot
    bot4: 0.3, // Careful bot
    bot5: 0.2, // Very cautious bot
  };

  return botPersonalities[botId] || 0.3;
}

// Create realistic elimination schedule for bots
// Make sure the elimination schedule starts from round 3 or 4
function createRealisticBotSchedule() {
  const botIDs = Object.keys(gameState.players).filter((id) =>
    id.startsWith("bot")
  );

  console.log("Creating bot schedule for:", botIDs); // Debug log

  botIDs.forEach((id, index) => {
    if (index === 0) {
      // First bot survives until round 5-6
      gameState.botDeathSchedule[id] = randomBetween(5, 6);
    } else if (index === 1) {
      // Second bot survives until round 4-5
      gameState.botDeathSchedule[id] = randomBetween(4, 5);
    } else if (index === 2) {
      // Third bot survives until round 3-4
      gameState.botDeathSchedule[id] = randomBetween(3, 4);
    } else {
      // Remaining bots get elimination rounds 3-6
      gameState.botDeathSchedule[id] = randomBetween(2, 6);
    }
  });

  // Debug log to see the schedule
  console.log("Bot death schedule:", gameState.botDeathSchedule);
}

// Simulate a bot making a mistake (like a real player might)
function simulateBotMistake(botId) {
  const bot = gameState.players[botId];
  if (!bot || bot.eliminated) return;

  // Simulate the bot "accidentally" moving during red light
  bot.lastMoveTime = Date.now();
  bot.isMoving = true;

  // Add visual feedback that the bot made a mistake
  bot.element.classList.add("mistake");
  setTimeout(() => {
    bot.element.classList.remove("mistake");
  }, 300);

  // Eliminate the bot after a brief delay
  setTimeout(() => {
    eliminatePlayer(botId);
  }, 200);
}

// Add CSS for mistake animation (add this to your CSS)
const mistakeCSS = `
.mistake {
  animation: shake 0.3s ease-in-out;
  border: 2px solid red !important;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
`;

// Add the CSS to the page
if (!document.getElementById("mistake-styles")) {
  const style = document.createElement("style");
  style.id = "mistake-styles";
  style.textContent = mistakeCSS;
  document.head.appendChild(style);
}
