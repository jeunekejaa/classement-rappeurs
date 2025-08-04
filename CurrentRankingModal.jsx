import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Trophy, Medal, Award } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

export default function CurrentRankingModal({ isOpen, onClose, partialRankings, battleCount }) {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Classement actuel</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm text-gray-600 text-center mb-4">
            Basé sur {battleCount - 1} comparaisons effectuées
          </p>

          <div className="space-y-2">
            {partialRankings.map((rankGroup, index) => (
              rankGroup.items && rankGroup.items.length > 0 && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${getRankColor(rankGroup.rank)} 
                            shadow-sm flex items-center gap-3`}
                >
                  <div className="flex items-center justify-center min-w-[40px]">
                    {getRankIcon(rankGroup.rank)}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800">
                      {Array.isArray(rankGroup.items) ? rankGroup.items.join(', ') : rankGroup.items}
                    </span>
                    {rankGroup.items && Array.isArray(rankGroup.items) && rankGroup.items.length > 1 && (
                      <span className="text-xs text-gray-500 block">Égalité</span>
                    )}
                  </div>
                </motion.div>
              )
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button 
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6"
            >
              Continuer le tri
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}