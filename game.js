let virusDownloaded = false;
let antivirusStarted = false;
let timerInterval;
let popUpInterval;
let rateDecreaseInterval;
let popUpCount = 0;
const maxPopUps = 20;
const initialPopUpRate = 1000; // milliseconds
const antivirusTime = 180; // seconds

document.getElementById('download-virus').addEventListener('click', () => {
    if (!virusDownloaded) {
        virusDownloaded = true;
        document.getElementById('start-antivirus').disabled = false;
        startPopUps();
    }
});

document.getElementById('start-antivirus').addEventListener('click', () => {
    if (virusDownloaded && !antivirusStarted) {
        antivirusStarted = true;
        startTimer();
    }
});

function startPopUps() {
    let currentRate = initialPopUpRate;
    popUpInterval = setInterval(() => {
        if (popUpCount >= maxPopUps) {
            gameOver('Too many pop-ups! Game Over!');
        } else {
            createPopUp();
        }
    }, currentRate);
    rateDecreaseInterval = setInterval(() => {
        if (currentRate > 200) {
            currentRate -= 100;
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
}

function createPopUp() {
    const popUp = document.createElement('div');
    popUp.className = 'popup';
    popUp.style.left = Math.random() * 600 + 'px';
    popUp.style.top = Math.random() * 400 + 'px';
    popUp.innerHTML = `
        <div class="close-btn">X</div>
        <p>Virus Alert! Your computer is infected!</p>
    `;
    document.getElementById('game-container').appendChild(popUp);
    popUpCount++;
    popUp.querySelector('.close-btn').addEventListener('click', () => {
        popUp.remove();
        popUpCount--;
    });
}

function startTimer() {
    let timeLeft = antivirusTime;
    const timerDiv = document.getElementById('timer');
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDiv.innerText = `Timer: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            clearInterval(popUpInterval);
            clearInterval(rateDecreaseInterval);
            gameOver('Antivirus completed! You win!');
        }
    }, 1000);
}

function gameOver(message) {
    clearInterval(popUpInterval);
    clearInterval(rateDecreaseInterval);
    clearInterval(timerInterval);
    alert(message);
    virusDownloaded = false;
    antivirusStarted = false;
    document.getElementById('start-antivirus').disabled = true;
    document.querySelectorAll('.popup').forEach(p => p.remove());
    popUpCount = 0;
    document.getElementById('timer').innerText = 'Timer: 3:00';
}
