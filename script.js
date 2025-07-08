document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('main-game');
    const resultsScreen = document.getElementById('results-screen');
    
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    const btnA = document.getElementById('btnA');
    const btnB = document.getElementById('btnB');
    const tieButton = document.getElementById('tie-button');
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const battleCounterText = document.getElementById('battle-counter');
    const resultsList = document.getElementById('results-list');

    const rappers = [
        "Booba", "Ninho", "Alpha Wann", "Nekfeu", "Damso", "La Fêve", "Zamdane", 
        "Caballero", "Khali", "Laylow", "SCH", "Theodora", "Mairo", "Hamza", 
        "Yvnnis", "NeS", "Luther", "Bekar", "Karmen", "H Jeunecrack"
    ];

    let sorter;

    function initSorter() {
        sorter = {
            list: [...rappers],
            pairs: [],
            progress: 0,
            totalSteps: 0,
        };
        generatePairs();
        sorter.totalSteps = sorter.pairs.length;
    }

    function generatePairs() {
        sorter.list = shuffle(sorter.list);
        let temp = [...sorter.list];
        while (temp.length > 1) {
            let head = temp.shift();
            for (let i = 0; i < temp.length; i++) {
                sorter.pairs.push([head, temp[i]]);
            }
        }
        sorter.pairs = shuffle(sorter.pairs);
    }
    
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function startGame() {
        startScreen.classList.add('hidden');
        resultsScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initSorter();
        nextBattle();
    }

    function updateProgress() {
        const percentage = Math.round((sorter.progress / sorter.totalSteps) * 100);
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
        battleCounterText.textContent = `Duel ${sorter.progress} / ${sorter.totalSteps}`;
    }

    function nextBattle() {
        if (sorter.pairs.length === 0) {
            endGame();
            return;
        }

        updateProgress();
        const [itemA, itemB] = sorter.pairs[0];
        btnA.textContent = itemA;
        btnB.textContent = itemB;
    }

    function choose(winner, loser) {
        // Move winner before loser in the main list
        const winnerIndex = sorter.list.indexOf(winner);
        const loserIndex = sorter.list.indexOf(loser);
        if (winnerIndex > loserIndex) {
            sorter.list.splice(winnerIndex, 1);
            sorter.list.splice(loserIndex, 0, winner);
        }

        sorter.progress++;
        sorter.pairs.shift();
        nextBattle();
    }
    
    function tie() {
        sorter.progress++;
        // Move the current pair to the end to be re-evaluated later if needed
        sorter.pairs.push(sorter.pairs.shift());
        nextBattle();
    }

    function endGame() {
        gameScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
        
        resultsList.innerHTML = '';
        sorter.list.forEach((rapper, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="rank">#${index + 1}</span> <span class="name">${rapper}</span>`;
            resultsList.appendChild(li);
        });
    }

    btnA.addEventListener('click', () => choose(btnA.textContent, btnB.textContent));
    btnB.addEventListener('click', () => choose(btnB.textContent, btnA.textContent));
    tieButton.addEventListener('click', tie);
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});