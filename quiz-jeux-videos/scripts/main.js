// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Chargement de l\'application...');
    
    // Créer et initialiser le gestionnaire de jeu
    const gameManager = new GameManager();
    gameManager.init();
    
    // Exposer gameManager globalement pour le débogage (optionnel)
    window.gameManager = gameManager;
    
    console.log('🎮 Application prête !');
});