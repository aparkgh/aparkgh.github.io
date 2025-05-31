// Game state
let gameState = {
    score: 0,
    timeLeft: 60,
    difficulty: 'easy',
    isRunning: true,
    isPaused: false,
    combo: 0,
    lastCatchTime: 0,
    powerUps: [],
    effects: {
        frozen: false,
        slow: false,
        shrunk: false
    }
};

// Difficulty settings
const difficulties = {
    easy: { speed: 3000, moveDistance: 100, buttonSize: 1, name: 'Easy' },
    medium: { speed: 2000, moveDistance: 150, buttonSize: 0.9, name: 'Medium' },
    hard: { speed: 1000, moveDistance: 200, buttonSize: 0.8, name: 'Hard' },
    insane: { speed: 500, moveDistance: 250, buttonSize: 0.7, name: 'INSANE!' }
    };

    const btn = document.getElementById('run-button');
    const scoreEl = document.getElementById('score');
    const timerEl = document.getElementById('timer');
    const levelEl = document.getElementById('level');
    const comboEl = document.getElementById('combo');

    // Initialize game
    function initGame() {
    createParticles();
    moveButton();
    startTimer();
    spawnPowerUp();
    updateUI();
}

// Create floating background particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 10 + 5) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 6 + 's';
        particlesContainer.appendChild(particle);
    }
}

// Move button with enhanced logic
function moveButton() {
    if (!gameState.isRunning || gameState.isPaused || gameState.effects.frozen) return;

    const padding = 20;
    const currentDiff = difficulties[gameState.difficulty];
    const maxX = window.innerWidth - btn.offsetWidth - padding;
    const maxY = window.innerHeight - btn.offsetHeight - padding;

    // Smart movement - avoid being trapped in corners
    let randomX, randomY;
    do {
        randomX = Math.floor(Math.random() * maxX) + padding;
        randomY = Math.floor(Math.random() * maxY) + padding;
    } while (
        // Avoid UI panel area
        (randomX < 250 && randomY < 150) ||
        // Avoid corners if score is high
        (gameState.score > 10 && (
        (randomX < 100 && randomY < 100) ||
        (randomX > maxX - 100 && randomY < 100) ||
        (randomX < 100 && randomY > maxY - 100) ||
        (randomX > maxX - 100 && randomY > maxY - 100)
        ))
    );

    btn.style.left = randomX + 'px';
    btn.style.top = randomY + 'px';
    btn.style.transform = `scale(${currentDiff.buttonSize * (gameState.effects.shrunk ? 0.6 : 1)})`;

    // Update button text based on score
    const messages = [
        "Catch me if you can!",
        "Too slow!",
        "Almost got me!",
        "Getting warmer...",
        "You're persistent!",
        "Impressive!",
        "Now you're trying!",
        "So close!",
        "Keep going!",
        "You won't catch me!"
    ];

    if (gameState.score < messages.length) {
        btn.textContent = messages[gameState.score];
    } else {
        btn.textContent = `Score: ${gameState.score}! Keep going!`;
    }
}

// Enhanced mouse enter event
btn.addEventListener('mouseenter', () => {
    if (!gameState.effects.slow) {
        moveButton();
    }
});

// Button click event
btn.addEventListener('click', (e) => {
e.preventDefault();
if (!gameState.isRunning || gameState.isPaused) return;

gameState.score++;
const now = Date.now();

// Combo system
if (now - gameState.lastCatchTime < 2000) {
    gameState.combo++;
    showCombo();
    gameState.score += gameState.combo; // Bonus points for combo
} else {
    gameState.combo = 0;
}
gameState.lastCatchTime = now;

// Victory animation
btn.classList.add('caught');
setTimeout(() => btn.classList.remove('caught'), 600);

// Increase difficulty automatically
if (gameState.score % 5 === 0 && gameState.score > 0) {
    autoDifficultyIncrease();
}

moveButton();
updateUI();

// Add time bonus for high scores
if (gameState.score % 10 === 0) {
    gameState.timeLeft += 5;
    showMessage("+5 seconds bonus!");
}
});

// Combo display
function showCombo() {
    if (gameState.combo > 1) {
        comboEl.textContent = `${gameState.combo}x COMBO!`;
        comboEl.classList.add('show');
        setTimeout(() => comboEl.classList.remove('show'), 1000);
    }
}

// Power-up system
function spawnPowerUp() {
    if (!gameState.isRunning || Math.random() > 0.3) {
        setTimeout(spawnPowerUp, 5000 + Math.random() * 10000);
        return;
    }

    const powerUp = document.createElement('div');
    const types = ['freeze', 'slow', 'shrink'];
    const type = types[Math.floor(Math.random() * types.length)];

    powerUp.className = `powerup ${type}`;
    powerUp.style.left = Math.random() * (window.innerWidth - 40) + 'px';
    powerUp.style.top = Math.random() * (window.innerHeight - 40) + 'px';

    const icons = { freeze: '❄️', slow: '🐌', shrink: '🔍' };
    powerUp.innerHTML = icons[type];

    powerUp.addEventListener('click', () => {
        activatePowerUp(type);
        powerUp.remove();
    });

    document.body.appendChild(powerUp);

    // Remove after 8 seconds if not clicked
    setTimeout(() => {
        if (document.body.contains(powerUp)) {
        powerUp.remove();
        }
    }, 8000);

    setTimeout(spawnPowerUp, 8000 + Math.random() * 12000);
}

// Activate power-up effects
function activatePowerUp(type) {
    switch(type) {
        case 'freeze':
        gameState.effects.frozen = true;
        showMessage('Button frozen for 3 seconds!');
        setTimeout(() => gameState.effects.frozen = false, 3000);
        break;
        case 'slow':
        gameState.effects.slow = true;
        showMessage('Button moves slower for 5 seconds!');
        setTimeout(() => gameState.effects.slow = false, 5000);
        break;
        case 'shrink':
        gameState.effects.shrunk = true;
        showMessage('Button shrunk for 4 seconds!');
        setTimeout(() => gameState.effects.shrunk = false, 4000);
        break;
    }
}

// Show temporary message
function showMessage(text) {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed; top: 20%; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.8); color: white; padding: 15px 25px;
        border-radius: 25px; font-size: 18px; z-index: 1000;
        animation: fadeInOut 2s ease;
    `;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

// Timer system
function startTimer() {
    const timer = setInterval(() => {
        if (!gameState.isRunning || gameState.isPaused) return;
        
        gameState.timeLeft--;
        updateUI();
        
        if (gameState.timeLeft <= 0) {
        endGame();
        clearInterval(timer);
        }
    }, 1000);
}

// Auto difficulty increase
function autoDifficultyIncrease() {
    const diffKeys = Object.keys(difficulties);
    const currentIndex = diffKeys.indexOf(gameState.difficulty);
    if (currentIndex < diffKeys.length - 1) {
        gameState.difficulty = diffKeys[currentIndex + 1];
        showMessage(`Level up! Now playing: ${difficulties[gameState.difficulty].name}`);
    }
}

// Manual difficulty change
function changeDifficulty() {
    const diffKeys = Object.keys(difficulties);
    const currentIndex = diffKeys.indexOf(gameState.difficulty);
    const nextIndex = (currentIndex + 1) % diffKeys.length;
    gameState.difficulty = diffKeys[nextIndex];
    updateUI();
    moveButton();
}

// Pause/Resume
function pauseGame() {
    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.querySelector('.control-btn:nth-child(2)');
    pauseBtn.textContent = gameState.isPaused ? 'Resume' : 'Pause';
}

// Update UI elements
function updateUI() {
    scoreEl.textContent = gameState.score;
    timerEl.textContent = gameState.timeLeft;
    levelEl.textContent = difficulties[gameState.difficulty].name;
}

// End game
function endGame() {
    gameState.isRunning = false;
    const gameOverEl = document.getElementById('game-over');
    const finalScoreEl = document.getElementById('final-score');
    const performanceEl = document.getElementById('performance');

    finalScoreEl.textContent = `Your final score: ${gameState.score}`;

    let performance = '';
    if (gameState.score < 5) performance = 'Keep practicing! 🎯';
    else if (gameState.score < 15) performance = 'Not bad! Getting better! 👍';
    else if (gameState.score < 25) performance = 'Great job! You\'re getting good! 🔥';
    else if (gameState.score < 40) performance = 'Excellent! You\'re a pro! ⭐';
    else performance = 'LEGENDARY! You\'re unstoppable! 🏆';

    performanceEl.textContent = performance;
    gameOverEl.style.display = 'flex';
}

// Restart game
function restartGame() {
    // Reset game state
    gameState = {
        score: 0,
        timeLeft: 60,
        difficulty: 'easy',
        isRunning: true,
        isPaused: false,
        combo: 0,
        lastCatchTime: 0,
        powerUps: [],
        effects: { frozen: false, slow: false, shrunk: false }
    };

    // Hide game over screen
    document.getElementById('game-over').style.display = 'none';

    // Reset button
    btn.textContent = "Catch me if you can!";
    btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
    btn.style.transform = 'scale(1)';

    // Remove existing power-ups
    document.querySelectorAll('.powerup').forEach(pu => pu.remove());

    // Restart game systems
    updateUI();
    moveButton();
    startTimer();
    spawnPowerUp();
}

// Auto-move button periodically (with effects consideration)
setInterval(() => {
    if (gameState.isRunning && !gameState.isPaused && !gameState.effects.frozen) {
        const currentDiff = difficulties[gameState.difficulty];
        const delay = gameState.effects.slow ? currentDiff.speed * 2 : currentDiff.speed;
        moveButton();
    }
}, 1000);

// Add CSS animation for fade messages
const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
document.head.appendChild(style);

// Initialize the game
initGame();