document.addEventListener('DOMContentLoaded', () => {

    // Liste des rappeurs
    const rappers = [
        "Booba", "Ninho", "Alpha Wann", "Nekfeu", "Damso", "La Fêve", "Zamdane",
        "Caballero", "Khali", "Laylow", "SCH", "Theodora", "Mairo", "Hamza",
        "Yvnnis", "NeS", "Luther", "Bekar", "Karmen", "H Jeunecrack"
    ];

    // Variables globales inspirées du fichier source
    let lstMember = [];
    let parent = [];
    let equal = [];
    let rec = [];
    let cmp1, cmp2;
    let head1, head2;
    let nrec;
    let numQuestion;
    let totalSize;
    let finishSize;
    let finishFlag;

    // Éléments du DOM
    const leftChoice = document.getElementById('left-choice');
    const rightChoice = document.getElementById('right-choice');
    const tieChoice1 = document.getElementById('tie-choice-1');
    const tieChoice2 = document.getElementById('tie-choice-2');
    const progressArea = document.getElementById('progress-area');
    const resultArea = document.getElementById('result-area');

    function initList() {
        lstMember = [];
        parent = [];
        equal = [];
        rec = [];

        let n = 0;
        lstMember[n] = [];
        for (let i = 0; i < rappers.length; i++) {
            lstMember[n][i] = i;
        }
        parent[n] = -1;
        totalSize = 0;
        n++;

        // Division de la liste en paires (logique de tri fusion)
        for (let i = 0; i < lstMember.length; i++) {
            if (lstMember[i].length >= 2) {
                let mid = Math.ceil(lstMember[i].length / 2);
                lstMember[n] = lstMember[i].slice(0, mid);
                totalSize += lstMember[n].length;
                parent[n] = i;
                n++;
                lstMember[n] = lstMember[i].slice(mid, lstMember[i].length);
                totalSize += lstMember[n].length;
                parent[n] = i;
                n++;
            }
        }

        for (let i = 0; i < rappers.length; i++) { rec[i] = 0; }
        nrec = 0;

        for (let i = 0; i <= rappers.length; i++) { equal[i] = -1; }

        cmp1 = lstMember.length - 2;
        cmp2 = lstMember.length - 1;
        head1 = 0;
        head2 = 0;
        numQuestion = 1;
        finishSize = 0;
        finishFlag = 0;
    }

    function sortList(flag) {
        if (flag < 0) { // Clic à gauche
            rec[nrec++] = lstMember[cmp1][head1++];
        } else if (flag > 0) { // Clic à droite
            rec[nrec++] = lstMember[cmp2][head2++];
        } else { // Match nul
            rec[nrec] = lstMember[cmp1][head1];
            equal[rec[nrec]] = lstMember[cmp2][head2];
            nrec++;
            head1++;
            rec[nrec++] = lstMember[cmp2][head2++];
        }

        finishSize++;

        if (head1 === lstMember[cmp1].length) {
            while (head2 < lstMember[cmp2].length) {
                rec[nrec++] = lstMember[cmp2][head2++];
            }
        }
        if (head2 === lstMember[cmp2].length) {
            while (head1 < lstMember[cmp1].length) {
                rec[nrec++] = lstMember[cmp1][head1++];
            }
        }

        if (head1 === lstMember[cmp1].length && head2 === lstMember[cmp2].length) {
            for (let i = 0; i < lstMember[cmp1].length + lstMember[cmp2].length; i++) {
                lstMember[parent[cmp1]][i] = rec[i];
            }
            lstMember.pop();
            lstMember.pop();
            cmp1 -= 2;
            cmp2 -= 2;
            head1 = 0;
            head2 = 0;

            for (let i = 0; i < rappers.length; i++) { rec[i] = 0; }
            nrec = 0;
        }

        if (cmp1 < 0) {
            finishFlag = 1;
            showResult();
        } else {
            numQuestion++;
            displayChoices();
        }
    }

    function displayChoices() {
        let progress = Math.floor(finishSize * 100 / totalSize);
        progressArea.innerHTML = `battle #${numQuestion}<br>${progress}% sorted.`;
        leftChoice.textContent = rappers[lstMember[cmp1][head1]];
        rightChoice.textContent = rappers[lstMember[cmp2][head2]];
    }

    function showResult() {
        progressArea.style.display = 'none';
        document.getElementById('main-table').style.display = 'none';

        let ranking = 1;
        let sameRank = 1;
        let str = `<table><tr><th>Rang</th><th>Rappeur</th></tr>`;
        for (let i = 0; i < rappers.length; i++) {
            str += `<tr><td class="rank">${ranking}</td><td>${rappers[lstMember[0][i]]}</td></tr>`;
            if (i < rappers.length - 1) {
                if (equal[lstMember[0][i]] === lstMember[0][i + 1]) {
                    sameRank++;
                } else {
                    ranking += sameRank;
                    sameRank = 1;
                }
            }
        }
        str += "</table>";
        resultArea.innerHTML = str;
    }

    // Listeners
    leftChoice.onclick = () => { if (!finishFlag) sortList(-1); };
    rightChoice.onclick = () => { if (!finishFlag) sortList(1); };
    tieChoice1.onclick = () => { if (!finishFlag) sortList(0); };
    tieChoice2.onclick = () => { if (!finishFlag) sortList(0); };

    // Démarrage
    initList();
    displayChoices();
});
