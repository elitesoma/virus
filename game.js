const difficulties = {
    easy: { initialPopUpRate: 1500, maxPopUps: 30 },
    medium: { initialPopUpRate: 1000, maxPopUps: 20 },
    hard: { initialPopUpRate: 500, maxPopUps: 15 }
};
let virusDownloaded = false;
let antivirusStarted = false;
let timerInterval, popUpInterval, rateDecreaseInterval, bossInterval;
let popUpCount = 0, score = 0, level = 1, paused = false;
let achievements = { closed50: false, under5: false, noPowerUps: false, allLevels: false, dailyChallenge: false };
let upgrades = { closeSpeed: 1, maxPopUps: 0 };
let currentRate, maxPopUps, antivirusTime = 180;
let popSound, powerUpSound, noPowerUps = true;
let dailyChallengeCompleted = false;
const storyMessages = [
    'Level 1: A minor virus infects your system.',
    'Level 2: The virus mutates, spawning faster.',
    'Level 3: Multiple viruses detected!',
    'Level 4: The virus fights back with bosses.',
    'Level 5: Final stand against the virus core.'
];
const messages = [
    'Virus Alert! Your computer is infected!',
    'Warning! System files corrupted!',
    'Error! Malware detected!',
    'Tip: Use strong passwords to stay safe.',
    'Tip: Avoid clicking unknown links.'
];

document.addEventListener('DOMContentLoaded', () => {
    popSound = new Audio('assets/sounds/pop.mp3');
    powerUpSound = new Audio('assets/sounds/powerup.mp3');
    document.getElementById('difficulty').addEventListener('change', setDifficulty);
    document.getElementById('mode').addEventListener('click', toggleMode);
    document.getElementById('tutorial').addEventListener('click', startTutorial);
    document.getElementById('download-virus').addEventListener('click', downloadVirus);
    document.getElementById('start-antivirus').addEventListener('click', startAntivirus);
    document.getElementById('pause').addEventListener('click', togglePause);
    document.getElementById('upgrades').addEventListener('click', showUpgrades);
    document.getElementById('theme-select').addEventListener('change', changeTheme);
    document.getElementById('color-picker').addEventListener('input', changePopUpColor);
    setDifficulty();
    checkDailyChallenge();
});

function setDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    currentRate = difficulties[difficulty].initialPopUpRate;
    maxPopUps = difficulties[difficulty].maxPopUps + upgrades.maxPopUps;
}

function toggleMode() {
    const modeBtn = document.getElementById('mode');
    if (modeBtn.textContent === 'Story Mode') {
        modeBtn.textContent = 'Survival Mode';
        level = 1;
        alert(storyMessages[0]);
    } else {
        modeBtn.textContent = 'Story Mode';
        alert('Survival Mode: Last as long as you can!');
    }
}

function startTutorial() {
    alert('Tutorial: Click "Download Virus" to start pop-ups. Click "Start Antivirus" to begin the 3-minute scan. Close pop-ups by clicking "X". Power-ups help! Try to keep pop-ups below the limit.');
}

function downloadVirus() {
    if (!virusDownloaded && !paused) {
        virusDownloaded = true;
        document.getElementById('start-antivirus').disabled = false;
        startPopUps();
    }
}

function startAntivirus() {
    if (virusDownloaded && !antivirusStarted && !paused) {
        antivirusStarted = true;
        startTimer();
    }
}

function startPopUps() {
    popUpInterval = setInterval(() => {
        if (popUpCount >= maxPopUps) {
            gameOver('Too many pop-ups! Game Over!');
        } else {
            createPopUp();
        }
    }, currentRate);
    rateDecreaseInterval = setInterval(() => {
        if (currentRate > 200) {
            currentRate = Math.max(200, currentRate - 50 * level);
            clearInterval(popUpInterval);
            popUpInterval = setInterval(() => {
                if (popUpCount >= maxPopUps) {
                    gameOver('Too many pop-ups! Game Over!');
                } else {
                    createPopUp();
                }
            }, currentRate);
        }
    }, 30000);
    bossInterval = setInterval(() => {
        if (!paused) createBossPopUp();
    }, 60000);
}

function createPopUp() {
    if (paused) return;
    const isPowerUp = Math.random() < 0.1;
    const type = isPowerUp ? 'powerup' : ['normal', 'sticky', 'moving', 'timed'][Math.floor(Math.random() * 4)];
    const popUp = document.createElement('div');
    popUp.className = `popup ${type === 'moving' ? 'moving' : ''}`;
    popUp.style.left = Math.random() * 600 + 'px';
    popUp.style.top = Math.random() * 400 + 'px';
    popUp.style.backgroundColor = document.getElementById('color-picker').value;
    let clicksNeeded = type === 'sticky' ? 2 : 1;
    popUp.innerHTML = `
        <div class="close-btn">X</div>
        <p>${messages[Math.floor(Math.random() * messages.length)]}${type === 'timed' ? '<br>Close in 5s!' : ''}</p>
    `;
    document.getElementById('game-container').appendChild(popUp);
    popUpCount++;
    popSound.play().catch(() => {});
    if (type === 'timed') {
        setTimeout(() => {
            if (popUp.parentNode) gameOver('Timed pop-up not closed! Game Over!');
        }, 5000);
    }
    const closeBtn = popUp.querySelector('.close-btn');
    const startTime = Date.now();
    const handleClose = (e) => {
        e.stopPropagation();
        clicksNeeded--;
        if (clicksNeeded <= 0) {
            popUp.remove();
            popUpCount--;
            const timeTaken = (Date.now() - startTime) / 1000;
            const points = timeTaken < 2 ? 15 : 10;
            score += points;
            document.getElementById('score').textContent = `Score: ${score}`;
            if (isPowerUp) {
                noPowerUps = false;
                powerUpSound.play().catch(() => {});
                applyPowerUp();
            }
            checkAchievements();
        }
    };
    closeBtn.addEventListener('click', handleClose);
    popUp.addEventListener('touchstart', handleClose);
    checkFeedback();
}

function createBossPopUp() {
    if (paused) return;
    const popUp = document.createElement('div');
    popUp.className = 'popup';
    popUp.style.width = '300px';
    popUp.style.height = '150px';
    popUp.style.left = Math.random() * 500 + 'px';
    popUp.style.top = Math.random() * 350 + 'px';
    popUp.style.backgroundColor = document.getElementById('color-picker').value;
    let clicksNeeded = 5;
    popUp.innerHTML = `
        <div class="close-btn">X</div>
        <p>Boss Virus! Close quickly! (${clicksNeeded} clicks left)</p>
    `;
    document.getElementById('game-container').appendChild(popUp);
    popUpCount++;
    popSound.play().catch(() => {});
    const closeBtn = popUp.querySelector('.close-btn');
    const handleClose = (e) => {
        e.stopPropagation();
        clicksNeeded--;
        popUp.querySelector('p').textContent = `Boss Virus! Close quickly! (${clicksNeeded} clicks left)`;
        if (clicksNeeded <= 0) {
            popUp.remove();
            popUpCount--;
            score += 50;
            document.getElementById('score').textContent = `Score: ${score}`;
            checkAchievements();
        }
    };
    closeBtn.addEventListener('click', handleClose);
    popUp.addEventListener('touchstart', handleClose);
    checkFeedback();
}

function applyPowerUp() {
    const effect = Math.random() < 0.5 ? 'slow' : 'autoClose';
    if (effect === 'slow') {
        currentRate += 500;
        clearInterval(popUpInterval);
        popUpInterval = setInterval(() => {
            if (popUpCount >= maxPopUps) {
                gameOver('Too many pop-ups! Game Over!');
            } else {
                createPopUp();
            }
        }, currentRate);
        setTimeout(() => {
            currentRate = Math.max(200, currentRate - 500);
            clearInterval(popUpInterval);
            popUpInterval = setInterval(() => {
                if (popUpCount >= maxPopUps) {
                    gameOver('Too many pop-ups! Game Over!');
                } else {
                    createPopUp();
                }
            }, currentRate);
        }, 10000);
        alert('Power-up: Pop-up rate slowed for 10 seconds!');
    } else if (effect === 'autoClose') {
        const popUps = document.querySelectorAll('.popup:not(.powerup)');
        for (let i = 0; i < Math.min(5, popUps.length); i++) {
            popUps[i].remove();
            popUpCount--;
        }
        document.getElementById('game-container').style.backgroundColor = '#0f0';
        setTimeout(() => {
            document.getElementById('game-container').style.backgroundColor = '#fff';
        }, 200);
        alert('Power-up: 5 pop-ups auto-closed!');
    } else {
        clearInterval(timerInterval);
        setTimeout(() => startTimer(Math.max(0, timeLeft - 5)), 5000);
        alert('Power-up: Timer paused for 5 seconds!');
    }
}

function startTimer(timeLeft = antivirusTime) {
    if (paused) return;
    const timerDiv = document.getElementById('timer');
    const progress = document.getElementById('progress');
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDiv.textContent = `Timer: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        progress.value = antivirusTime - timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            clearInterval(popUpInterval);
            clearInterval(rateDecreaseInterval);
            clearInterval(bossInterval);
            if (document.getElementById('mode').textContent === 'Survival Mode') {
                gameOver(`Survival Mode Ended! Score: ${score}`);
            } else {
                if (level < 5) {
                    level++;
                    alert(`Level ${level} completed! ${storyMessages[level - 1]}`);
                    resetLevel();
                } else {
                    achievements.allLevels = true;
                    checkAchievements();
                    gameOver('All levels completed! You win!');
                }
            }
        }
    }, 1000);
}

function resetLevel() {
    virusDownloaded = false;
    antivirusStarted = false;
    popUpCount = 0;
    document.getElementById('start-antivirus').disabled = true;
    document.querySelectorAll('.popup').forEach(p => p.remove());
    document.getElementById('timer').textContent = 'Timer: 3:00';
    document.getElementById('progress').value = 0;
    clearInterval(timerInterval);
    clearInterval(popUpInterval);
    clearInterval(rateDecreaseInterval);
    clearInterval(bossInterval);
    setDifficulty();
}

function gameOver(message) {
    clearInterval(timerInterval);
    clearInterval(popUpInterval);
    clearInterval(rateDecreaseInterval);
    clearInterval(bossInterval);
    alert(`${message} Final Score: ${score}`);
    resetLevel();
}

function togglePause() {
    paused = !paused;
    document.getElementById('pause').textContent = paused ? 'Resume' : 'Pause';
    if (paused) {
        clearInterval(timerInterval);
        clearInterval(popUpInterval);
        clearInterval(rateDecreaseInterval);
        clearInterval(bossInterval);
    } else {
        if (antivirusStarted) startTimer(parseInt(document.getElementById('progress').value));
        startPopUps();
    }
}

function showUpgrades() {
    const closeSpeedCost = 100 * upgrades.closeSpeed;
    const maxPopUpsCost = 200 * (upgrades.maxPopUps + 1);
    const choice = prompt(`Upgrades:\n1. Faster Closing (${closeSpeedCost} points)\n2. Increase Max Pop-ups (${maxPopUpsCost} points)\nEnter 1 or 2, or cancel.`);
    if (choice === '1' && score >= closeSpeedCost) {
        score -= closeSpeedCost;
        upgrades.closeSpeed++;
        document.getElementById('score').textContent = `Score: ${score}`;
        alert('Upgrade purchased: Faster closing!');
    } else if (choice === '2' && score >= maxPopUpsCost) {
        score -= maxPopUpsCost;
        upgrades.maxPopUps += 5;
        maxPopUps += 5;
        document.getElementById('score').textContent = `Score: ${score}`;
        alert('Upgrade purchased: Max pop-ups increased!');
    } else if (choice) {
        alert('Not enough points or invalid choice!');
    }
}

function changeTheme() {
    const theme = document.getElementById('theme-select').value;
    document.body.className = theme === 'default' ? '' : `${theme}-theme`;
}

function changePopUpColor() {
    document.querySelectorAll('.popup').forEach(p => {
        p.style.backgroundColor = document.getElementById('color-picker').value;
    });
}

function checkAchievements() {
    let count = 0;
    if (score >= 500 && !achievements.closed50) {
        achievements.closed50 = true;
        alert('Achievement Unlocked: Close 50 pop-ups!');
    }
    if (popUpCount < 5 && antivirusStarted && !achievements.under5) {
        achievements.under5 = true;
        alert('Achievement Unlocked: Keep under 5 pop-ups!');
    }
    if (level > 1 && noPowerUps && !achievements.noPowerUps) {
        achievements.noPowerUps = true;
        alert('Achievement Unlocked: Complete a level without power-ups!');
    }
    if (achievements.allLevels) {
        alert('Achievement Unlocked: Complete all levels!');
    }
    if (dailyChallengeCompleted && !achievements.dailyChallenge) {
        achievements.dailyChallenge = true;
        alert('Achievement Unlocked: Complete daily challenge!');
    }
    for (let key in achievements) if (achievements[key]) count++;
    document.getElementById('achievements').textContent = `Achievements: ${count}/5`;
}

function checkDailyChallenge() {
    const today = new Date().toDateString();
    const challenge = today.includes('Mon') ? 'Close 100 pop-ups' : 'Survive with <10 pop-ups';
    setInterval(() => {
        if (!dailyChallengeCompleted) {
            if (challenge.includes('100') && score >= 1000) {
                dailyChallengeCompleted = true;
                checkAchievements();
            } else if (challenge.includes('<10') && popUpCount < 10 && timeLeft <= 0) {
                dailyChallengeCompleted = true;
                checkAchievements();
            }
        }
    }, 1000);
}

function checkFeedback() {
    const container = document.getElementById('game-container');
    if (popUpCount >= maxPopUps * 0.8) {
        container.style.backgroundColor = '#ff0000';
        setTimeout(() => container.style.backgroundColor = '#fff', 200);
    }
}
