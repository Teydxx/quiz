// Stockage local simple pour les vidéos supprimées
const DeletedGamesStorage = {
    get() {
        const stored = localStorage.getItem('deletedGames');
        return stored ? JSON.parse(stored) : [];
    },
    
    add(game) {
        const deleted = this.get();
        deleted.push({
            name: game.name,
            videoId: game.videoId,
            date: new Date().toLocaleString(),
            reason: 'Problème détecté manuellement'
        });
        localStorage.setItem('deletedGames', JSON.stringify(deleted));
        console.log(`🗑️ ${game.name} ajouté aux vidéos supprimées`);
    },
    
    clear() {
        localStorage.removeItem('deletedGames');
    }
};

// Gestion des supprimés définitifs
const PermanentlyDeletedStorage = {
    get() {
        const stored = localStorage.getItem('permanentlyDeleted');
        return stored ? JSON.parse(stored) : [];
    },
    
    add(game) {
        const deleted = this.get();
        deleted.push({
            name: game.name,
            videoId: game.videoId,
            date: new Date().toLocaleString(),
            reason: 'Supprimé définitivement'
        });
        localStorage.setItem('permanentlyDeleted', JSON.stringify(deleted));
        console.log(`⛔ ${game.name} ajouté aux supprimés définitifs`);
    },
    
    remove(gameName) {
        const deleted = this.get();
        const updatedDeleted = deleted.filter(g => g.name !== gameName);
        localStorage.setItem('permanentlyDeleted', JSON.stringify(updatedDeleted));
    },
    
    clear() {
        localStorage.removeItem('permanentlyDeleted');
    }
};

// Exposer les fonctions globalement
window.DeletedGamesStorage = DeletedGamesStorage;
window.PermanentlyDeletedStorage = PermanentlyDeletedStorage;
window.addToPermanentlyDeleted = function(game) {
    PermanentlyDeletedStorage.add(game);
};