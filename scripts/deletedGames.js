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