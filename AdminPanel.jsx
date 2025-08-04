
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Rapper } from '@/entities/Rapper';
import { Settings, Plus, Trash2, X, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminPanel({ isOpen, onClose }) {
  const [rappers, setRappers] = useState([]);
  const [newRapperName, setNewRapperName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [notification, setNotification] = useState(null);
  const [exportTitle, setExportTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRappers();
      setShowExport(false);
      setExportText('');
      setImportText('');
      setNotification(null);
      setExportTitle('');
    }
  }, [isOpen]);

  const showTempNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadRappers = async () => {
    setIsLoading(true);
    try {
      const fetchedRappers = await Rapper.list('-created_date');
      setRappers(fetchedRappers);
    } catch (error) {
      console.error('Erreur lors du chargement des rappeurs:', error);
      showTempNotification('Erreur de chargement des rappeurs', 'error');
    }
    setIsLoading(false);
  };

  const addRapper = async (e) => {
    e.preventDefault();
    if (!newRapperName.trim()) return;
    
    const rapperName = newRapperName.trim();
    
    // Vérification des doublons (insensible à la casse)
    const isDuplicate = rappers.some(rapper => rapper.name.toLowerCase() === rapperName.toLowerCase());
    if (isDuplicate) {
      showTempNotification(`"${rapperName}" est déjà dans la liste.`, 'error');
      setNewRapperName(''); // Vider le champ
      return;
    }
    
    setNewRapperName(''); // Vider le champ pour un retour optimiste
    
    // Mise à jour optimiste: ajouter un rappeur temporaire à l'UI
    const tempRapper = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ID temporaire unique
      name: rapperName,
      is_active: true,
      created_date: new Date().toISOString() // Assigner une date de création pour un tri cohérent
    };
    // Ajouter au début de la liste pour correspondre au tri par -created_date
    setRappers(prev => [tempRapper, ...prev]); 
    
    try {
      const newRapper = await Rapper.create({ name: rapperName, is_active: true });
      // Remplacer le rappeur temporaire par le vrai de la réponse de l'API
      setRappers(prev => prev.map(r => 
        r.id === tempRapper.id ? newRapper : r
      ));
      showTempNotification(`"${rapperName}" a été ajouté.`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      // En cas d'erreur, retirer le rappeur temporaire de l'UI
      setRappers(prev => prev.filter(r => r.id !== tempRapper.id));
      showTempNotification('Erreur lors de l\'ajout', 'error');
    }
    // No setIsLoading(false) here, as it's an optimistic update.
  };

  const toggleRapperStatus = async (rapper) => {
    // Store original state for potential rollback
    const originalRappers = [...rappers]; 
    
    // Optimistic update: change status immediately in UI
    const updatedRapper = { ...rapper, is_active: !rapper.is_active };
    setRappers(prev => prev.map(r => 
      r.id === rapper.id ? updatedRapper : r
    ));
    
    try {
      await Rapper.update(rapper.id, { is_active: !rapper.is_active });
      showTempNotification(`Statut de "${rapper.name}" mis à jour.`);
      // No need to loadRappers() again, UI is already updated
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      // On error, revert to original state
      setRappers(originalRappers); 
      showTempNotification('Erreur de mise à jour', 'error');
    }
  };

  const deleteRapper = async (rapperId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rappeur ?')) return;
    
    // Save the rapper to restore it in case of an error
    const rapperToDelete = rappers.find(r => r.id === rapperId);
    if (!rapperToDelete) return; 
    
    // Optimistic update: remove the rapper from the UI immediately
    setRappers(prev => prev.filter(r => r.id !== rapperId));
    
    try {
      await Rapper.delete(rapperId);
      showTempNotification('Rappeur supprimé.');
      // No need to loadRappers() again, UI is already updated
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // On error, put the rapper back into the list
      if (rapperToDelete) {
        setRappers(prev => {
          const updated = [...prev, rapperToDelete];
          // Re-sort to maintain order based on created_date
          return updated.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        });
      }
      showTempNotification('Erreur de suppression', 'error');
    }
  };

  const handleImport = async () => {
    const namesToImport = importText.split(',').map(name => name.trim()).filter(Boolean);
    if (namesToImport.length === 0) {
      showTempNotification('Aucun nom à importer.', 'error');
      return;
    }

    setIsLoading(true); // Indicate that a batch operation is in progress

    try {
      const existingRappers = await Rapper.list(); // Fetch current DB state to avoid re-importing duplicates
      const existingNames = new Set(existingRappers.map(r => r.name.toLowerCase()));
      const newUniqueRappers = namesToImport.filter(name => !existingNames.has(name.toLowerCase()));

      if (newUniqueRappers.length > 0) {
        // Optimistic update: add temporary rappers to the UI
        const tempRappers = newUniqueRappers.map(name => ({
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Unique temporary ID
          name,
          is_active: true,
          created_date: new Date().toISOString()
        }));
        // Add to the beginning and sort to maintain display order
        setRappers(prev => [...tempRappers, ...prev].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

        // Create rappers in the background
        const createdRappersResponse = await Promise.all(
          newUniqueRappers.map(name => Rapper.create({ name, is_active: true }))
        );

        // Replace temporary rappers with actual ones from the successful API response
        setRappers(prev => {
          const tempIdToActualRapperMap = new Map();
          tempRappers.forEach((temp, index) => {
            tempIdToActualRapperMap.set(temp.id, createdRappersResponse[index]);
          });

          // Go through the current rappers state and replace temporary ones.
          // Filter out any temporary rappers that for some reason weren't in createdRappersResponse (shouldn't happen if Promise.all succeeds fully).
          // And also sort to maintain order.
          return prev.map(r => tempIdToActualRapperMap.get(r.id) || r)
                     .filter(r => !r.id.startsWith('temp-') || tempIdToActualRapperMap.has(r.id))
                     .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        });

        showTempNotification(`${newUniqueRappers.length} nouveau(x) rappeur(s) importé(s).`);
      } else {
        showTempNotification('Aucun nouveau rappeur à importer.', 'info');
      }
      
      setImportText('');
    } catch (error) {
      console.error("Erreur lors de l'import :", error);
      showTempNotification("Erreur lors de l'import.", 'error');
      // On error, revert to the database state as per outline
      await loadRappers(); 
    } finally {
      // Ensure the loading state is reset after the operation, regardless of success or failure.
      // If loadRappers() was called in catch, it already handles its own loading state.
      setIsLoading(false);
    }
  };

  const handleExportActive = async () => {
    try {
      const activeRappers = await Rapper.filter({ is_active: true }, 'name');
      const names = activeRappers.map(r => r.name);
      setExportText(names.join(', '));
      setExportTitle('Rappeurs actifs');
      setShowExport(true);
    } catch (error) {
      console.error("Erreur lors de l'export des actifs :", error);
      showTempNotification("Erreur lors de l'export.", 'error');
    }
  };

  const handleExportAll = async () => {
    try {
      const allRappers = await Rapper.list('name');
      const names = allRappers.map(r => r.name);
      setExportText(names.join(', '));
      setExportTitle('Tous les rappeurs');
      setShowExport(true);
    } catch (error) {
      console.error("Erreur lors de l'export de tous les rappeurs :", error);
      showTempNotification("Erreur lors de l'export.", 'error');
    }
  };


  if (!isOpen) return null;

  const activeRappersCount = rappers.filter(r => r.is_active).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Panel Administrateur</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 mb-4 rounded-md flex items-center gap-3 text-sm ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' : 
              notification.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800' // 'info' type
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Importer une liste</h4>
            <Textarea
              placeholder="Ex: Naps, Soso Maness, Jul..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="mb-2 text-sm"
            />
            <Button onClick={handleImport} disabled={isLoading} className="w-full text-sm">
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Exporter les listes</h4>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <Button onClick={handleExportActive} variant="outline" className="w-full text-sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter les actifs
              </Button>
              <Button onClick={handleExportAll} variant="outline" className="w-full text-sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter tous
              </Button>
            </div>
            {showExport && (
              <>
                <p className="text-xs text-gray-500 mb-1">{exportTitle}:</p>
                <Textarea
                  readOnly
                  value={exportText}
                  onClick={(e) => e.target.select()}
                  className="h-[80px] text-sm"
                />
              </>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
            Gérer les rappeurs ({activeRappersCount} actifs / {rappers.length} au total)
          </h3>
          
          <form onSubmit={addRapper} className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              placeholder="Nom du nouveau rappeur"
              value={newRapperName}
              onChange={(e) => setNewRapperName(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button 
              type="submit" 
              disabled={!newRapperName.trim()} // isLoading check removed for optimistic add
              className="bg-green-600 hover:bg-green-700 text-sm sm:w-auto w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </form>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {rappers.map((rapper) => (
              <motion.div
                key={rapper.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  rapper.is_active 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      rapper.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className={`font-medium text-sm sm:text-base truncate ${
                      rapper.is_active ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {rapper.name}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => toggleRapperStatus(rapper)}
                      size="sm"
                      variant={rapper.is_active ? "outline" : "default"}
                      className={`text-xs sm:text-sm flex-1 sm:flex-none ${rapper.is_active 
                        ? "text-orange-600 border-orange-300 hover:bg-orange-50" 
                        : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {rapper.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      onClick={() => deleteRapper(rapper.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {rappers.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Aucun rappeur dans la base de données.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
            Sauvegarder et Fermer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
