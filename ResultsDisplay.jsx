import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

export default function ResultsDisplay({ rankings, onRestart, totalComparisons }) {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-gray-800 mb-4">
          Votre classement final
        </h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mb-6" />
        <p className="text-gray-600">
          Basé sur {totalComparisons} comparaisons
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {rankings.map((rankGroup, index) => (
          rankGroup.items.length > 0 && (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`p-4 rounded-xl border-2 ${getRankColor(rankGroup.rank)} 
                        shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4`}
            >
              <div className="flex items-center justify-center min-w-[60px]">
                {getRankIcon(rankGroup.rank)}
              </div>
              <div className="flex-1">
                <span className="text-lg font-semibold text-gray-800">
                  {rankGroup.items.join(', ')}
                </span>
              </div>
            </motion.div>
          )
        ))}
      </div>

      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 
                   text-white font-semibold rounded-full shadow-lg 
                   hover:shadow-xl hover:from-amber-600 hover:to-orange-700 
                   transition-all duration-300"
        >
          Recommencer le tri
        </motion.button>
      </div>
    </motion.div>
  );
}