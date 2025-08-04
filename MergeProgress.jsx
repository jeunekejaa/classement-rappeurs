import React from 'react';
import { motion } from 'framer-motion';
import { GitMerge } from 'lucide-react';

export default function MergeProgress({ currentMerge, totalMerges, battleNumber, rapperCount }) {
  // Calcul dynamique de la complexité de chaque étape
  const calculateStepComplexities = (n) => {
    // Simuler les étapes de fusion pour calculer leur complexité relative
    const complexities = [];
    const levels = [];
    
    // Initialiser avec des listes de taille 1
    let currentLevel = new Array(n).fill(1);
    
    while (currentLevel.length > 1) {
      const nextLevel = [];
      
      // Fusionner les paires dans le niveau actuel
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          const leftSize = currentLevel[i];
          const rightSize = currentLevel[i + 1];
          // La complexité d'une fusion est proportionnelle à la somme des tailles
          complexities.push(leftSize + rightSize);
          nextLevel.push(leftSize + rightSize);
        } else {
          // Élément impair reporté au niveau suivant
          nextLevel.push(currentLevel[i]);
        }
      }
      
      currentLevel = nextLevel;
    }
    
    return complexities;
  };

  const getWeightedPercentage = (step, total, rapperCount) => {
    if (step === 0) return 0;
    if (step >= total) return 100;
    
    const complexities = calculateStepComplexities(rapperCount);
    const totalComplexity = complexities.reduce((sum, complexity) => sum + complexity, 0);
    
    // Calculer la complexité cumulée jusqu'à l'étape actuelle
    const completedComplexity = complexities
      .slice(0, step)
      .reduce((sum, complexity) => sum + complexity, 0);
    
    return Math.floor((completedComplexity / totalComplexity) * 100);
  };

  const getProgressPhaseText = (step, rapperCount) => {
    const complexities = calculateStepComplexities(rapperCount);
    if (step === 0) return "Initialisation";
    if (step > complexities.length) return "Finalisation";
    
    const currentComplexity = complexities[step - 1];
    const maxComplexity = Math.max(...complexities);
    
    // Déterminer la phase basée sur la complexité relative
    const complexityRatio = currentComplexity / maxComplexity;
    
    if (complexityRatio < 0.3) {
      return "Phase rapide : fusion des petites listes";
    } else if (complexityRatio < 0.7) {
      return "Phase modérée : fusion des listes moyennes";
    } else {
      return "Phase complexe : fusion des grandes listes";
    }
  };

  const percentage = getWeightedPercentage(currentMerge, totalMerges, rapperCount);
  const phaseText = getProgressPhaseText(currentMerge, rapperCount);

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-2 px-1">
        <span>Duel #{battleNumber}</span>
        <span>Étape {currentMerge} / {totalMerges} • {percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
        <GitMerge className="w-3 h-3 mr-1.5" />
        <span>{phaseText}</span>
      </div>
    </div>
  );
}