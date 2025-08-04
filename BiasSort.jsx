
import React, { useState, useEffect } from 'react';
import { Rapper } from '@/entities/Rapper';
import BattleInterface from '../components/BattleInterface';
import ResultsDisplay from '../components/ResultsDisplay';
import CurrentRankingModal from '../components/CurrentRankingModal';
import MergeProgress from '../components/MergeProgress';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export default function BiasSort() {
  const [rappers, setRappers] = useState([]);
  const [currentLevel, setCurrentLevel] = useState([]);
  const [nextLevel, setNextLevel] = useState([]);
  const [currentMerge, setCurrentMerge] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [finalRankings, setFinalRankings] = useState([]);
  const [battleCount, setBattleCount] = useState(0);
  const [completedMerges, setCompletedMerges] = useState(0);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [comparisons, setComparisons] = useState(new Map());

  // États pour l'administration
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // This state is set but not directly used for AdminPanel's visibility in the outline

  // Calcul dynamique du nombre total d'étapes
  // If rappers.length is 0 or 1, there are no merges. Math.max(1, X) ensures totalMerges is at least 1 for display purposes.
  const totalMerges = Math.max(1, rappers.length - 1);

  useEffect(() => {
    loadRappers();
  }, []);

  const loadRappers = async () => {
    try {
      const fetchedRappers = await Rapper.filter({ is_active: true }, 'name');
      const rapperNames = fetchedRappers.map((r) => r.name);

      // If no active rappers in DB, try to initialize with defaults
      if (rapperNames.length === 0) {
        await initializeDefaultRappers();
      } else {
        setRappers(rapperNames);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rappeurs:', error);
      // In case of error, try to initialize default rappers as a fallback
      await initializeDefaultRappers();
    }
  };

  const initializeDefaultRappers = async () => {
    const defaultRappers = [
    "Booba", "Ninho", "Alpha Wann", "Nekfeu", "Damso", "La Fêve",
    "Zamdane", "Caballero", "Khali", "Laylow", "SCH", "Theodora",
    "Mairo", "Hamza", "Yvnnis", "NeS", "Luther", "Bekar", "Karmen", "H Jeunecrack"];


    try {
      // Check which default rappers already exist to avoid duplicates
      const existingRappers = await Rapper.list();
      const existingNames = existingRappers.map((r) => r.name);

      // Add only the default rappers that don't already exist in the database
      const rappersToAdd = defaultRappers.filter((name) => !existingNames.includes(name));

      for (const rapperName of rappersToAdd) {
        await Rapper.create({ name: rapperName, is_active: true });
      }

      // After potentially adding new rappers, reload the active list
      const finalRappers = await Rapper.filter({ is_active: true }, 'name');
      setRappers(finalRappers.map((r) => r.name));
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des rappeurs par défaut:', error);
      // If default initialization fails, at least use the hardcoded list for current session
      setRappers(defaultRappers);
    }
  };

  const startNextMerge = (level, next) => {
    if (level.length >= 2) {
      // Cas 1: Il y a au moins deux groupes à fusionner dans le niveau actuel.
      const left = level.shift();
      const right = level.shift();
      setCurrentLevel([...level]); // Mettre à jour le niveau actuel
      setCurrentMerge({
        left,
        right,
        merged: [],
        leftIndex: 0,
        rightIndex: 0
      });
      if (battleCount === 0) {
        setBattleCount(1);
      }
    } else {
      // Cas 2: Il reste 0 ou 1 groupe, fin du niveau actuel.
      let newNextLevel = [...next];
      if (level.length === 1) {
        newNextLevel.push(level[0]);
      }

      // Vérifier si le tri est terminé.
      if (newNextLevel.length === 1 && level.length === 0) {
        setFinalRankings(generateFinalRanking(newNextLevel[0]));
        setIsComplete(true);
        return;
      }

      // Si non, on passe au niveau de fusion suivant.
      if (newNextLevel.length > 1) {
        setCurrentLevel([...newNextLevel]);
        setNextLevel([]);
        setTimeout(() => startNextMerge([...newNextLevel], []), 0);
      } else if (newNextLevel.length === 0 && level.length === 0) {
        // Cas de sécurité pour les listes vides, devrait marquer comme complet.
        setIsComplete(true);
      }
    }
  };

  const finishMerge = (mergedResult) => {
    setCompletedMerges((prev) => prev + 1);
    const newNextLevel = [...nextLevel, mergedResult];
    setNextLevel(newNextLevel);
    setCurrentMerge(null);
    setTimeout(() => startNextMerge([...currentLevel], newNextLevel), 0);
  };

  const handleChoice = (result) => {
    if (!currentMerge) return;

    let { left, right, merged, leftIndex, rightIndex } = currentMerge;

    // Store comparison result
    const key = `${left[leftIndex]}-${right[rightIndex]}`;
    setComparisons((prev) => new Map(prev).set(key, result));

    // Add chosen item(s) to merged list
    if (result === 'item1_wins') {
      merged.push(left[leftIndex++]);
    } else if (result === 'item2_wins') {
      merged.push(right[rightIndex++]);
    } else {// tie
      merged.push(left[leftIndex++], right[rightIndex++]);
    }

    // Check if merge is complete for current pair
    if (leftIndex >= left.length) {
      merged.push(...right.slice(rightIndex));
      finishMerge(merged);
    } else if (rightIndex >= right.length) {
      merged.push(...left.slice(leftIndex));
      finishMerge(merged);
    } else {
      // Continue with next battle in current merge
      setCurrentMerge({ left, right, merged, leftIndex, rightIndex });
      setBattleCount((prev) => prev + 1);
    }
  };

  const handleRestart = async () => {
    // Recharger la liste des rappeurs au cas où elle aurait changé
    // This `loadRappers()` call will update the `rappers` state,
    // which in turn triggers the `useEffect` below to actually start the sort.
    await loadRappers();

    // Reset game state variables
    // The actual sort start logic (startNextMerge) is now handled by the useEffect that depends on `rappers`
  };

  const generatePartialRanking = () => {
    // If no comparisons yet, return initial list without specific ranks
    if (comparisons.size === 0) return rappers.map((r, i) => ({ rank: i + 1, items: [r] }));

    // Calculate scores based on wins
    const scores = new Map(rappers.map((r) => [r, 0]));
    comparisons.forEach((result, key) => {
      const [item1, item2] = key.split('-');
      if (result === 'item1_wins') scores.set(item1, scores.get(item1) + 1);
      if (result === 'item2_wins') scores.set(item2, scores.get(item2) + 1);
    });

    // Sort rappers by score (descending)
    const sortedRappers = [...rappers].sort((a, b) => (scores.get(b) || 0) - (scores.get(a) || 0));

    // Generate ranked groups, handling ties
    const rankings = [];
    let rank = 1;
    for (let i = 0; i < sortedRappers.length;) {
      let j = i;
      while (j < sortedRappers.length && (scores.get(sortedRappers[j]) || 0) === (scores.get(sortedRappers[i]) || 0)) {
        j++;
      }
      rankings.push({ rank, items: sortedRappers.slice(i, j) });
      rank += j - i;
      i = j;
    }
    return rankings;
  };

  const generateFinalRanking = (sortedItems) => {
    if (!sortedItems || sortedItems.length === 0) return [];
    const rankings = [];
    let rank = 1;
    for (let i = 0; i < sortedItems.length;) {
      let j = i;
      // Find consecutive items that were tied
      while (j < sortedItems.length - 1) {
        const key1 = `${sortedItems[j]}-${sortedItems[j + 1]}`;
        const key2 = `${sortedItems[j + 1]}-${sortedItems[j]}`;
        if (comparisons.get(key1) === 'tie' || comparisons.get(key2) === 'tie') {
          j++;
        } else {
          break;
        }
      }
      const group = sortedItems.slice(i, j + 1);
      rankings.push({ rank, items: group });
      rank += group.length;
      i = j + 1;
    }
    return rankings;
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
    setShowAdminPanel(true);
  };

  const handleAdminPanelClose = () => {
    setShowAdminPanel(false);
    // Recharger les rappeurs pour rafraîchir la liste et redémarrer le tri
    loadRappers();
  };

  // Cet effet redémarre le tri chaque fois que la liste des rappeurs est modifiée
  useEffect(() => {
    if (rappers.length > 0) {
      const initialGroups = rappers.map((rapper) => [rapper]);
      setCurrentLevel(initialGroups);
      setNextLevel([]);
      setCurrentMerge(null);
      setIsComplete(false);
      setFinalRankings([]);
      setBattleCount(0);
      setCompletedMerges(0);
      setComparisons(new Map());
      setTimeout(() => startNextMerge(initialGroups, []), 0);
    }
  }, [rappers]);

  const currentComparison = currentMerge ?
  {
    item1: currentMerge.left[currentMerge.leftIndex],
    item2: currentMerge.right[currentMerge.rightIndex]
  } :
  null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative">

          <Button
            onClick={() => setShowAdminLogin(true)}
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
            aria-label="Admin settings">

            <Settings className="w-4 h-4" />
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">Classez vos rappeurs préférés

          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez votre classement personnel des rappeurs français en comparant par paires
          </p>
          {rappers.length > 0 &&
          <p className="text-sm text-gray-500 mt-2">
              {rappers.length} rappeurs dans le classement
            </p>
          }
        </motion.div>

        {!isComplete ?
        <>
            {/* Show MergeProgress only if there are enough rappers for actual merges */}
            {battleCount > 0 && rappers.length > 1 &&
          <MergeProgress
            currentMerge={completedMerges}
            totalMerges={totalMerges}
            battleNumber={battleCount}
            rapperCount={rappers.length} />

          }
            {currentComparison &&
          <BattleInterface
            item1={currentComparison.item1}
            item2={currentComparison.item2}
            onChoice={handleChoice}
            onShowRanking={() => setShowRankingModal(true)} />

          }
            {/* Display message if no rappers are available to sort */}
            {rappers.length === 0 && !showAdminLogin && !showAdminPanel &&
          <div className="text-center text-gray-500 mt-8">
                <p>Aucun rappeur n'est disponible pour le tri. Veuillez vous connecter en tant qu'administrateur pour ajouter des rappeurs.</p>
              </div>
          }
          </> :

        <ResultsDisplay
          rankings={finalRankings}
          onRestart={handleRestart}
          totalComparisons={comparisons.size} />

        }

        <CurrentRankingModal
          isOpen={showRankingModal}
          onClose={() => setShowRankingModal(false)}
          partialRankings={generatePartialRanking()}
          battleCount={battleCount} />


        {showAdminLogin &&
        <AdminLogin onLoginSuccess={handleAdminLogin} onClose={() => setShowAdminLogin(false)} />
        }

        {showAdminPanel &&
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={handleAdminPanelClose} />

        }
      </div>
    </div>);

}