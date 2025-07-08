document.addEventListener('DOMContentLoaded', () => {

    // Liste des rappeurs (inchangée)
    const rappers = [
        "Booba", "Ninho", "Alpha Wann", "Nekfeu", "Damso", "La Fêve", "Zamdane",
        "Caballero", "Khali", "Laylow", "SCH", "Theodora", "Mairo", "Hamza",
        "Yvnnis", "NeS", "Luther", "Bekar", "Karmen", "H Jeunecrack"
    ];

    // Variables globales
    let lstMember, parent, equal, rec;
    let cmp1, cmp2, head1, head2, nrec;
    let numQuestion, totalSize, finishSize, finishFlag;

    // Éléments du DOM
    const leftChoice = document.getElementById('left-choice');
    const rightChoice = document.getElementById('right-choice');
    const tieChoice1 = document.getElementById('tie-choice-1');
    const tieChoice2 = document.getElementById('tie-choice-2');
    const progressArea = document.getElementById('progress-area');
    const resultArea = document.getElementById('result-area');
    const battleWrapper = document.querySelector('.battle-wrapper');

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

        rec = new Array(rappers.length).fill(0);
        nrec = 0;
        
        equal = new Array(rappers.length + 1).fill(-1);

        cmp1 = lstMember.length - 2;
        cmp2 = lstMember.length - 1;
        head1 = 0;
        head2 = 0;
        numQuestion = 1;
        finishSize = 0;
        finishFlag = 0;
    }

    // ==================================================================
    // FONCTION DE TRI ENTIÈREMENT CORRIGÉE
    // ==================================================================
    function sortList(flag) {
        if (finishFlag) return;

        // Stocke le choix dans le tableau de résultats temporaire 'rec'
        if (flag < 0) {
            rec[nrec++] = lstMember[cmp1][head1++];
        } else if (flag > 0) {
            rec[nrec++] = lstMember[cmp2][head2++];
        } else {
            rec[nrec] = lstMember[cmp1][head1];
            equal[rec[nrec]] = lstMember[cmp2][head2];
            nrec++;
            head1++;
            
            rec[nrec++] = lstMember[cmp2][head2++];
        }

        finishSize++;

        // Si l'un des deux sous-tableaux est terminé, on copie le reste de l'autre
        if (head1 === lstMember[cmp1].length) {
            while (head2 < lstMember[cmp2].length) {
                rec[nrec++] = lstMember[cmp2][head2++];
            }
        } else if (head2 === lstMember[cmp2].length) {
            while (head1 < lstMember[cmp1].length) {
                rec[nrec++] = lstMember[cmp1][head1++];
            }
        }

        // Si les deux sous-tableaux sont terminés, on passe à l'étape de fusion suivante
        if (head1 === lstMember[cmp1].length && head2 === lstMember[cmp2].length) {
            // Copie le résultat trié dans le tableau parent
            for (let i = 0; i < lstMember[parent[cmp1]].length; i++) {
                lstMember[parent[cmp1]][i] = rec[i];
            }
            
            // On supprime les sous-tableaux qu'on vient de fusionner
            lstMember.pop();
            lstMember.pop();
            
            // On passe à la paire de sous-tableaux précédente
            cmp1 -= 2;
            cmp2 -= 2;
            
            // On réinitialise les compteurs pour la nouvelle fusion
            head1 = 0;
            head2 = 0;
            nrec = 0;
            rec.fill(0);
        }

        // On vérifie si tout est terminé
        if (cmp1 < 0) {
            finishFlag = 1;
            showResult();
        } else {
            displayChoices();
        }
    }

    function displayChoices() {
        numQuestion++;
        let progress = totalSize > 0 ? Math.floor(finishSize * 100 / totalSize) : 0;
        progressArea.innerHTML = `battle #${numQuestion}<br>${progress}% sorted.`;
        
        leftChoice.textContent = rappers[lstMember[cmp1][head1]];
        rightChoice.textContent = rappers[lstMember[cmp2][head2]];
    }

    function showResult() {
        progressArea.style.display = 'none';
        battleWrapper.style.display = 'none';

        let ranking = 1;
        let sameRank = 1;
        let str = `<table><thead><tr><th>Rang</th><th>Rappeur</th></tr></thead><tbody>`;
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
        str += "</tbody></table>";
        resultArea.innerHTML = str;
    }

    // Listeners
    leftChoice.onclick = () => sortList(-1);
    rightChoice.onclick = () => sortList(1);
    tieChoice1.onclick = () => sortList(0);
    tieChoice2.onclick = () => sortList(0);

    // Démarrage
    initList();
    displayChoices();
    // On met à jour l'affichage initial une seule fois
    progressArea.innerHTML = `battle #1<br>0% sorted.`;
});
