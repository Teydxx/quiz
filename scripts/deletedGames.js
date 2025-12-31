// scripts/deletedGames.js - VERSION COMPLÈTE SÉCURISÉE
console.log('🔒 deletedGames.js chargé (version sécurisée)');

// SAUVEGARDE AUTOMATIQUE DES DONNÉES EXISTANTES
try {
    // 1. Vérifier et sauvegarder les données existantes
    const existingData = {
        deletedGames: localStorage.getItem('deletedGames'),
        failedVideos: localStorage.getItem('failedVideos'),
        correctedGames: localStorage.getItem('correctedGames'),
        permanentlyDeleted: localStorage.getItem('permanentlyDeleted'),
        timestamp: new Date().toISOString()
    };
    
    // Sauvegarder seulement si pas déjà sauvegardé
    if (!localStorage.getItem('deletedGames_backup') && existingData.deletedGames) {
        localStorage.setItem('deletedGames_backup', existingData.deletedGames);
        console.log('💾 Backup deletedGames créé');
    }
    
    if (!localStorage.getItem('failedVideos_backup') && existingData.failedVideos) {
        localStorage.setItem('failedVideos_backup', existingData.failedVideos);
        console.log('💾 Backup failedVideos créé');
    }
    
    // Log des données existantes (sans les effacer)
    if (existingData.deletedGames) {
        const deleted = JSON.parse(existingData.deletedGames);
        console.log(`📊 ${deleted.length} vidéo(s) dans deletedGames`);
    }
    
    if (existingData.failedVideos) {
        const failed = JSON.parse(existingData.failedVideos);
        console.log(`📊 ${failed.length} vidéo(s) dans failedVideos`);
    }
    
} catch(e) {
    console.warn('⚠️ Erreur lors de la vérification des données:', e);
}

// ===== STOCKAGE DES VIDÉOS SUPPRIMÉES MANUELLEMENT =====
const DeletedGamesStorage = {
    get() {
        try {
            const stored = localStorage.getItem('deletedGames');
            if (!stored) return [];
            
            const parsed = JSON.parse(stored);
            console.log(`📥 Chargement de ${parsed.length} vidéo(s) supprimée(s)`);
            return parsed;
            
        } catch(e) {
            console.error('❌ Erreur lecture deletedGames:', e);
            return [];
        }
    },
    
    add(game) {
        try {
            const deleted = this.get();
            
            // Vérifier si pas déjà présent
            const exists = deleted.some(g => 
                g.name === game.name && g.videoId === game.videoId
            );
            
            if (!exists) {
                const videoData = {
                    name: game.name,
                    videoId: game.videoId,
                    date: new Date().toLocaleString(),
                    reason: game.reason || 'Suppression manuelle',
                    type: 'manual'
                };
                
                deleted.push(videoData);
                localStorage.setItem('deletedGames', JSON.stringify(deleted));
                console.log(`📝 "${game.name}" ajouté aux vidéos supprimées`);
                
                return videoData;
            } else {
                console.log(`📝 "${game.name}" déjà dans la liste`);
                return null;
            }
            
        } catch(e) {
            console.error('❌ Erreur ajout deletedGames:', e);
            return null;
        }
    },
    
    remove(gameName, videoId = null) {
        try {
            const deleted = this.get();
            const updatedDeleted = deleted.filter(g => 
                !(g.name === gameName && (videoId === null || g.videoId === videoId))
            );
            
            localStorage.setItem('deletedGames', JSON.stringify(updatedDeleted));
            console.log(`🗑️ "${gameName}" retiré de deletedGames`);
            
            return updatedDeleted;
        } catch(e) {
            console.error('❌ Erreur suppression deletedGames:', e);
            return this.get();
        }
    },
    
    clear() {
        console.warn('⚠️ clear() appelé mais IGNORÉ pour sécurité');
        // NE PAS EFFACER LES DONNÉES
        // localStorage.removeItem('deletedGames'); // COMMENTÉ POUR SÉCURITÉ
        return this.get();
    },
    
    // NOUVEAU : Compter les vidéos
    count() {
        return this.get().length;
    }
};

// ===== STOCKAGE DES VIDÉOS DÉFAILLANTES AUTOMATIQUES =====
const FailedVideosStorage = {
    get() {
        try {
            const stored = localStorage.getItem('failedVideos');
            return stored ? JSON.parse(stored) : [];
        } catch(e) {
            console.error('❌ Erreur lecture failedVideos:', e);
            return [];
        }
    },
    
    add(game, reason = 'Erreur inconnue', attempts = 1) {
        try {
            const failed = this.get();
            
            // Vérifier si pas déjà présent
            const exists = failed.some(g => 
                g.name === game.name && g.videoId === game.videoId
            );
            
            if (!exists) {
                const videoData = {
                    name: game.name,
                    videoId: game.videoId,
                    date: new Date().toLocaleString(),
                    reason: reason,
                    attempts: attempts,
                    detectedAt: new Date().toISOString(),
                    type: 'auto'
                };
                
                failed.push(videoData);
                localStorage.setItem('failedVideos', JSON.stringify(failed));
                console.log(`🤖 "${game.name}" détecté automatiquement: ${reason}`);
                
                return videoData;
            } else {
                console.log(`🤖 "${game.name}" déjà dans failedVideos`);
                return null;
            }
            
        } catch(e) {
            console.error('❌ Erreur ajout failedVideos:', e);
            return null;
        }
    },
    
    remove(gameName, videoId = null) {
        try {
            const failed = this.get();
            const updatedFailed = failed.filter(g => 
                !(g.name === gameName && (videoId === null || g.videoId === videoId))
            );
            
            localStorage.setItem('failedVideos', JSON.stringify(updatedFailed));
            console.log(`🗑️ "${gameName}" retiré de failedVideos`);
            
            return updatedFailed;
        } catch(e) {
            console.error('❌ Erreur suppression failedVideos:', e);
            return this.get();
        }
    },
    
    clear() {
        console.warn('⚠️ clear() appelé mais IGNORÉ pour sécurité');
        // localStorage.removeItem('failedVideos'); // COMMENTÉ POUR SÉCURITÉ
        return this.get();
    },
    
    // NOUVEAU : Fusionner avec deletedGames
    getAllVideos() {
        const deleted = DeletedGamesStorage.get().map(v => ({...v, source: 'deleted'}));
        const failed = this.get().map(v => ({...v, source: 'failed'}));
        return [...deleted, ...failed];
    },
    
    count() {
        return this.get().length;
    }
};

// ===== STOCKAGE DES VIDÉOS SUPPRIMÉES DÉFINITIVEMENT =====
const PermanentlyDeletedStorage = {
    get() {
        try {
            const stored = localStorage.getItem('permanentlyDeleted');
            return stored ? JSON.parse(stored) : [];
        } catch(e) {
            console.error('❌ Erreur lecture permanentlyDeleted:', e);
            return [];
        }
    },
    
    add(game) {
        try {
            const deleted = this.get();
            
            // Vérifier si pas déjà présent
            const exists = deleted.some(g => g.name === game.name);
            
            if (!exists) {
                deleted.push({
                    name: game.name,
                    videoId: game.videoId,
                    date: new Date().toLocaleString(),
                    reason: 'Supprimé définitivement'
                });
                localStorage.setItem('permanentlyDeleted', JSON.stringify(deleted));
                console.log(`✅ "${game.name}" ajouté aux supprimés définitifs`);
                
                // Retirer des autres listes
                DeletedGamesStorage.remove(game.name, game.videoId);
                FailedVideosStorage.remove(game.name, game.videoId);
                
                return true;
            }
            return false;
            
        } catch(e) {
            console.error('❌ Erreur ajout permanentlyDeleted:', e);
            return false;
        }
    },
    
    remove(gameName) {
        try {
            const deleted = this.get();
            const updatedDeleted = deleted.filter(g => g.name !== gameName);
            localStorage.setItem('permanentlyDeleted', JSON.stringify(updatedDeleted));
            console.log(`🔄 "${gameName}" retiré des supprimés définitifs`);
            
            return updatedDeleted;
        } catch(e) {
            console.error('❌ Erreur suppression permanentlyDeleted:', e);
            return this.get();
        }
    },
    
    clear() {
        console.warn('⚠️ clear() appelé mais IGNORÉ pour sécurité');
        // localStorage.removeItem('permanentlyDeleted'); // COMMENTÉ POUR SÉCURITÉ
        return this.get();
    }
};

// ===== FONCTIONS GLOBALES =====

// Exposer les storages (seulement si pas déjà définis)
if (!window.DeletedGamesStorage) {
    window.DeletedGamesStorage = DeletedGamesStorage;
}
if (!window.FailedVideosStorage) {
    window.FailedVideosStorage = FailedVideosStorage;
}
if (!window.PermanentlyDeletedStorage) {
    window.PermanentlyDeletedStorage = PermanentlyDeletedStorage;
}

// Fonction pour GameManager.js
window.markVideoAsFailed = function(game, reason, attempts) {
    if (window.FailedVideosStorage && FailedVideosStorage.add) {
        return FailedVideosStorage.add(game, reason, attempts);
    } else {
        console.log(`🤖 [Simulation] Vidéo défaillante: ${game.name} - ${reason}`);
        return null;
    }
};

// Fonctions existantes (pour compatibilité)
window.addToPermanentlyDeleted = function(game) {
    if (window.PermanentlyDeletedStorage && PermanentlyDeletedStorage.add) {
        return PermanentlyDeletedStorage.add(game);
    }
    return false;
};

// Fonctions pour la page deleted-videos.html (si elles n'existent pas déjà)
if (!window.reintegrateGame) {
    window.reintegrateGame = function(gameName, currentVideoId, newVideoId = null) {
        if (!newVideoId) {
            newVideoId = prompt(
                `Corriger "${gameName}" :\n\nID actuel: ${currentVideoId}\n\nNouvel ID YouTube :`
            );
            if (!newVideoId) return;
        }
        
        const cleanedId = newVideoId.trim();
        
        // Ajouter aux jeux corrigés
        const correctedGames = JSON.parse(localStorage.getItem('correctedGames') || '[]');
        
        const existingIndex = correctedGames.findIndex(g => g.name === gameName);
        if (existingIndex !== -1) {
            correctedGames[existingIndex].videoId = cleanedId;
            correctedGames[existingIndex].date = new Date().toLocaleString();
        } else {
            correctedGames.push({
                name: gameName,
                videoId: cleanedId,
                date: new Date().toLocaleString(),
                originalId: currentVideoId
            });
        }
        
        localStorage.setItem('correctedGames', JSON.stringify(correctedGames));
        
        // Retirer des listes de suppression
        DeletedGamesStorage.remove(gameName, currentVideoId);
        FailedVideosStorage.remove(gameName, currentVideoId);
        
        alert(`✅ "${gameName}" corrigé !\nNouvel ID: ${cleanedId}`);
        
        // Recharger la page si on est sur deleted-videos.html
        if (window.location.pathname.includes('deleted-videos')) {
            window.location.reload();
        }
    };
}

if (!window.permanentlyDelete) {
    window.permanentlyDelete = function(gameName, videoId = null) {
        if (!confirm(`Supprimer définitivement "${gameName}" ?`)) return;
        
        // Ajouter aux supprimés définitifs
        PermanentlyDeletedStorage.add({name: gameName, videoId: videoId});
        
        // Retirer des autres listes
        DeletedGamesStorage.remove(gameName, videoId);
        FailedVideosStorage.remove(gameName, videoId);
        
        alert(`🗑️ "${gameName}" supprimé définitivement.`);
        
        // Recharger la page si on est sur deleted-videos.html
        if (window.location.pathname.includes('deleted-videos')) {
            window.location.reload();
        }
    };
}

console.log('✅ deletedGames.js prêt - Données sécurisées');