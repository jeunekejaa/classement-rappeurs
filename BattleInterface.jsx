import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Minus, BarChart3 } from 'lucide-react';

export default function BattleInterface({ item1, item2, onChoice, onShowRanking }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-light text-gray-800">
            Qui préférez-vous ?
          </h2>
          <Button
            onClick={onShowRanking}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <BarChart3 className="w-4 h-4" />
            Voir le classement
          </Button>
        </div>
        <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <Button
            onClick={() => onChoice('item1_wins')}
            className="w-full h-24 sm:h-32 bg-white border-2 border-gray-200 hover:border-amber-400 
                     hover:bg-amber-50 text-gray-800 text-lg sm:text-xl font-medium rounded-xl 
                     transition-all duration-300 shadow-lg hover:shadow-xl group-hover:shadow-amber-200/50"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 
                             bg-clip-text text-transparent group-hover:from-amber-600 group-hover:to-orange-700">
                {item1}
              </span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <Button
            onClick={() => onChoice('item2_wins')}
            className="w-full h-24 sm:h-32 bg-white border-2 border-gray-200 hover:border-amber-400 
                     hover:bg-amber-50 text-gray-800 text-lg sm:text-xl font-medium rounded-xl 
                     transition-all duration-300 shadow-lg hover:shadow-xl group-hover:shadow-amber-200/50"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 
                             bg-clip-text text-transparent group-hover:from-amber-600 group-hover:to-orange-700">
                {item2}
              </span>
            </div>
          </Button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
      >
        <Button
          onClick={() => onChoice('tie')}
          variant="outline"
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 
                   hover:border-pink-400 hover:bg-pink-50 text-gray-700 
                   rounded-full transition-all duration-300 text-sm sm:text-base"
        >
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">J'aime les deux également</span>
          <span className="sm:hidden">J'aime les deux</span>
        </Button>

        <Button
          onClick={() => onChoice('tie')}
          variant="outline"
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 
                   hover:border-gray-400 hover:bg-gray-50 text-gray-700 
                   rounded-full transition-all duration-300 text-sm sm:text-base"
        >
          <Minus className="w-4 h-4" />
          <span className="hidden sm:inline">Je n'ai pas d'avis</span>
          <span className="sm:hidden">Pas d'avis</span>
        </Button>
      </motion.div>
    </div>
  );
}